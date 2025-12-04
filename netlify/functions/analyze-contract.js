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
    } else if (contractType === 'seguro') {
        const coberturaEnchenteRegex = /(riscos\s+excluídos|não\s+há\s+cobertura)[\s\S]*?(enchente|inundação|alagamento)/i;
        const temExclusao = pdfText.match(coberturaEnchenteRegex);

        extractedData.summary = { score: 60, risk_level: 'medium', main_value: 'Apólice', duration: 'Anual' };
        extractedData.alerts = [];
        extractedData.recommendations = [];

        if (temExclusao) {
            extractedData.alerts.push({ type: 'danger', title: 'Exclusão de Cobertura', desc: 'Atenção: Sua apólice parece excluir explicitamente a cobertura para danos causados por enchentes, inundações ou alagamentos.' });
            extractedData.recommendations.push({ type: 'suggestion', text: 'Se você reside em uma área de risco, é altamente recomendável contatar sua seguradora para negociar a inclusão de uma cobertura adicional para enchentes.' });
        } else {
            extractedData.alerts.push({ type: 'success', title: 'Cobertura de Enchente', desc: 'Não foi encontrada uma cláusula de exclusão explícita para enchentes. Verifique as condições gerais para confirmar.' });
        }
        extractedData.terms = [{ term: 'Franquia', meaning: 'Valor que você precisa pagar do próprio bolso em caso de sinistro antes que o seguro cubra o restante.' }];

    } else if (contractType === 'financiamento') {
        const cetRegex = /Custo\s+Efetivo\s+Total\s*\(CET\)\s+de\s+([\d.,]+\s*%)\s+ao\s+ano/i;
        const cetAnual = hunt(pdfText, cetRegex);

        extractedData.summary = { score: 70, risk_level: 'medium', main_value: cetAnual, duration: 'N/A' };
        extractedData.alerts = [{ type: 'info', title: 'Custo Efetivo Total (CET)', desc: `O custo real do seu financiamento, incluindo juros, taxas e encargos, é de ${cetAnual} ao ano.` }];
        extractedData.recommendations = [{ type: 'suggestion', text: 'O CET é o número mais importante para comparar propostas de financiamento. Use este valor, e não apenas a taxa de juros nominal, para tomar sua decisão.' }];
        extractedData.terms = [];

    } else if (contractType === 'edital') {
        const prazoEntregaRegex = /entrega\s+d(?:a|as)\s+propostas\s+até\s+o\s+dia\s+([\d\/]+)/i;
        const documentosRegex = /DOCUMENTOS\s+DE\s+HABILITAÇÃO([\s\S]*?)(\n[IVX]+\s*-|\n\n)/i;
        const garantiaRegex = /garantia\s+d(?:a|e)\s+proposta\s+no\s+valor\s+de\s+R\$\s*([\d.,]+)/i;

        extractedData.summary = { score: 85, risk_level: 'low', main_value: 'Edital', duration: 'N/A' };
        extractedData.alerts = [
            { type: 'warning', title: 'Prazo de Entrega', desc: `A data limite para entrega das propostas parece ser: ${hunt(pdfText, prazoEntregaRegex)}.` },
            { type: 'info', title: 'Garantia da Proposta', desc: `O valor da garantia exigida é de: ${hunt(pdfText, garantiaRegex)}.` }
        ];
        extractedData.recommendations = [{ type: 'suggestion', text: 'Crie um checklist com todos os documentos de habilitação e revise-os cuidadosamente para evitar desclassificação.' }];
        extractedData.terms = [{ term: 'Habilitação Jurídica', meaning: 'Comprovação de que sua empresa existe legalmente e está apta a contratar com o poder público.' }];

    } else if (contractType === 'propriedade_intelectual' || contractType === 'servicos') {
        const piRegex = /propriedade\s+intelectual[\s\S]*?pertencerá\s+(?:exclusivamente\s+)?a(?:o|à)\s+(CONTRATANTE|CONTRATADA)/i;
        const donoDaPI = hunt(pdfText, piRegex);

        extractedData.summary = { score: 65, risk_level: 'medium', main_value: 'Propriedade Intelectual', duration: 'N/A' };
        extractedData.alerts = [];
        extractedData.recommendations = [];

        if (donoDaPI.toUpperCase() === 'CONTRATANTE') {
            extractedData.alerts.push({ type: 'danger', title: 'Propriedade Intelectual', desc: 'Atenção: O contrato estipula que toda a propriedade intelectual gerada pertencerá ao CONTRATANTE.' });
            extractedData.recommendations.push({ type: 'negotiation', text: 'Se você está desenvolvendo uma tecnologia reutilizável, considere negociar uma licença de uso para o contratante em vez da transferência total da propriedade.' });
        } else if (donoDaPI.toUpperCase() === 'CONTRATADA') {
            extractedData.alerts.push({ type: 'success', title: 'Propriedade Intelectual', desc: 'O contrato estipula que a propriedade intelectual gerada pertencerá a você (CONTRATADA).' });
        } else {
            extractedData.alerts.push({ type: 'warning', title: 'Propriedade Intelectual', desc: 'A cláusula de propriedade intelectual não foi claramente identificada ou é ambígua.' });
        }
        extractedData.terms = [];

    } else if (contractType === 'nda') {
        const prazoSigiloRegex = /período\s+de\s+sigilo\s+de\s*([\d\s\w]+)/i;
        const multaRegex = /multa\s+por\s+quebra\s+de\s+sigilo.*?R\$\s*([\d.,]+)/i;

        extractedData.summary = { score: 70, risk_level: 'low', main_value: 'Confidencialidade', duration: hunt(pdfText, prazoSigiloRegex) };
        extractedData.alerts = [
            { type: 'info', title: 'Duração do Sigilo', desc: `O dever de confidencialidade permanece por: ${hunt(pdfText, prazoSigiloRegex)}.` },
            { type: 'danger', title: 'Multa por Quebra', desc: `A multa por quebra de sigilo identificada é de: ${hunt(pdfText, multaRegex)}.` }
        ];
        extractedData.recommendations = [];
        extractedData.terms = [{ term: 'Informação Confidencial', meaning: 'Qualquer dado, técnico ou comercial, que não seja de conhecimento público e que seja compartilhado entre as partes.' }];

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