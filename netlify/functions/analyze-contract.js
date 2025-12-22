const { createClient } = require('@supabase/supabase-js');
const pdfjsLib = require('pdfjs-dist');
const { analyzeText } = require('./utils/analysisCore');

// Inicializa o cliente Supabase com as variáveis de ambiente do backend.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed', headers };
  }

  try {
    const { storagePath, contractType, documentId } = JSON.parse(event.body);
    if (!storagePath) {
      return { statusCode: 400, body: 'storagePath não fornecido.', headers };
    }

    // 1. Baixa o arquivo PDF do Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documentos')
      .download(storagePath);

    if (downloadError) throw downloadError;

    // 2. Extrai o texto do PDF
    const pdfBuffer = await fileData.arrayBuffer();
    const doc = await pdfjsLib.getDocument(pdfBuffer).promise;
    let pdfText = '';

    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str);
      pdfText += strings.join(' ') + '\n';
    }

    // --- Autenticação ---
    const token = event.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      throw new Error("Token de autenticação não fornecido.");
    }
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      throw new Error("Usuário inválido ou não autenticado.");
    }

    // 3. Usa a lógica compartilhada para analisar o texto
    const { extractedData, tokensToSave } = analyzeText(pdfText, contractType);

    // --- Salvando os Tokens ---
    if (tokensToSave.length > 0) {
      const tokensWithIds = tokensToSave.map(token => ({
        ...token,
        user_id: user.id,
        document_id: documentId,
        contract_type: contractType,
      }));

      const { error: tokenError } = await supabase.from('extracted_tokens').insert(tokensWithIds);
      if (tokenError) {
        console.error("Erro ao salvar tokens:", tokenError);
      }
    }

    // 4. Retorna o JSON estruturado
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