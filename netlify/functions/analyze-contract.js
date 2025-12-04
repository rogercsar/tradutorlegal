const { createClient } = require('@supabase/supabase-js');
const pdfjsLib = require('pdfjs-dist');

// Inicializa o cliente Supabase com as variáveis de ambiente do backend.
// Usamos a SERVICE_KEY para ter acesso total e baixar arquivos privados.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * "Caça" um padrão no texto usando Regex e retorna o valor encontrado ou um padrão.
 * @param {string} text O texto completo do contrato.
 * @param {RegExp} regex A expressão regular para encontrar o valor.
 * @param {string} defaultValue O valor a ser retornado se nada for encontrado.
 * @returns {string} O valor encontrado ou o padrão.
 */
const hunt = (text, regex, defaultValue = 'Não identificado') => {
  const match = text.match(regex);
  return match ? match[1] || match[0] : defaultValue;
};

exports.handler = async (event) => {
  // Permite que a função seja chamada de qualquer origem (CORS)
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // O Netlify Functions usa um pré-vôo OPTIONS para chamadas POST
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed', headers };
  }

  try {
    const { storagePath, contractType } = JSON.parse(event.body);
    if (!storagePath) {
      return { statusCode: 400, body: 'storagePath não fornecido.', headers };
    }

    // 1. Baixa o arquivo PDF do Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documentos')
      .download(storagePath);

    if (downloadError) throw downloadError;

    // 2. Extrai o texto do PDF
    // Usando pdfjs-dist para maior compatibilidade no ambiente serverless
    const pdfBuffer = await fileData.arrayBuffer();
    const doc = await pdfjsLib.getDocument(pdfBuffer).promise;
    let pdfText = '';

    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str);
      pdfText += strings.join(' ') + '\n';
    }

    // 3. Lógica de Extração Determinística (O "Scanner") - Agora por tipo de contrato
    let extractedData = {};

    if (contractType === 'locacao') {
      const valorRegex = /aluguel.*?R\$\s*([\d.,]+)/i; 
      const prazoRegex = /prazo\s+de\s+vigência\s+de\s*([\d\w\s]+)\s+(meses|anos)/i;
      const reajusteRegex = /reajust\w+\s+pelo\s+índice\s+([\w-]+)/i;
      const multaRegex = /multa\s+de\s+([\d.,]+\s*%|R\$\s*[\d.,]+|[\w\s]+meses?\s+de\s+aluguel)/i;
      const locadorRegex = /LOCADOR(?:A)?:\s*([A-Z\s]+),/
      const locatarioRegex = /LOCATÁRI(?:O|A):\s*([A-Z\s]+),/

      // --- Extração ---
      const indiceReajuste = hunt(pdfText, reajusteRegex);
      const valorMulta = hunt(pdfText, multaRegex);

      // --- Lógica de Raciocínio e Recomendações ---
      const recommendations = [];
      if (indiceReajuste.toUpperCase().includes('IGP-M')) {
        recommendations.push({ type: 'suggestion', text: 'O índice de reajuste é o IGP-M. Considere negociar a troca pelo IPCA, que historicamente tem variações mais suaves e previsíveis.' });
      }
      if (valorMulta.includes('3') || valorMulta.toLowerCase().includes('três')) {
        recommendations.push({ type: 'negotiation', text: 'A multa de 3 aluguéis é comum, mas pode ser negociada, especialmente se o prazo de desocupação for longo. Verifique a proporcionalidade da cobrança.' });
      }
      if (!pdfText.toLowerCase().includes('benfeitorias')) {
        recommendations.push({ type: 'addition', text: 'O contrato não menciona benfeitorias. Recomenda-se adicionar uma cláusula que defina como reformas e melhorias serão tratadas.' });
      }

      extractedData = {
        summary: {
          score: 75,
          risk_level: 'low',
          main_value: hunt(pdfText, valorRegex),
          duration: hunt(pdfText, prazoRegex, 'Não identificado'),
        },
        alerts: [
          { type: 'warning', title: 'Índice de Reajuste', desc: `O índice encontrado foi: ${indiceReajuste}.` },
          { type: 'danger', title: 'Multa Contratual', desc: `A multa por rescisão identificada foi de: ${valorMulta}.` },
        ],
        terms: [
          { term: 'Foro de Eleição', meaning: 'Cidade onde ocorrerá o processo judicial caso haja briga.' },
          { term: 'Locador', meaning: `A parte que aluga o imóvel: ${hunt(pdfText, locadorRegex, 'Não identificado')}` },
          { term: 'Locatário', meaning: `A parte que irá ocupar o imóvel: ${hunt(pdfText, locatarioRegex, 'Não identificado')}` },
        ],
        recommendations: recommendations,
      };
    } else {
      // Fallback para outros tipos de contrato (serviços, edital, etc.)
      // Aqui você pode adicionar outras lógicas de Regex
      const valorRegex = /valor\s+total\s+de\s+R\$\s*([\d.,]+)/i;
      const prazoRegex = /prazo\s+de\s+execução\s+de\s*(\d+\s+\w+)/i;
      extractedData = {
        summary: { score: 80, risk_level: 'low', main_value: hunt(pdfText, valorRegex), duration: hunt(pdfText, prazoRegex) },
        alerts: [{ type: 'info', title: 'Análise Genérica', desc: 'Este é um modelo de análise para outros tipos de contrato.' }],
        terms: [],
        recommendations: [],
      };
    }

    // 4. Retorna o JSON estruturado para o frontend
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(extractedData),
    };

  } catch (error) {
    console.error('Erro na função analyze-contract:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Falha ao processar o documento.', details: error.message }),
    };
  }
};