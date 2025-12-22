const { analyzeText } = require('./utils/analysisCore');
const pdfjsLib = require('pdfjs-dist');
const axios = require('axios');

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

const sendMessage = async (chatId, text) => {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
    });
};

const sendTypingAction = async (chatId) => {
    await axios.post(`${TELEGRAM_API}/sendChatAction`, {
        chat_id: chatId,
        action: 'typing'
    });
};

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const update = JSON.parse(event.body);

        // Verifica se é uma mensagem
        if (!update.message) {
            return { statusCode: 200, body: 'OK' }; // Ignora atualizações que não são mensagens
        }

        const chatId = update.message.chat.id;
        const document = update.message.document;

        // 1. Boas vindas se for comando /start
        if (update.message.text && update.message.text.startsWith('/start')) {
            await sendMessage(chatId, "👋 Olá! Eu sou a IA do *Tradutor Legal*.\n\nEnvie um arquivo **PDF** de um contrato e eu farei uma análise simplificada para você.");
            return { statusCode: 200, body: 'OK' };
        }

        // 2. Se não tiver documento, pede um PDF
        if (!document) {
            await sendMessage(chatId, "Por favor, me envie um arquivo **PDF** para eu analisar.");
            return { statusCode: 200, body: 'OK' };
        }

        // 3. Verifica se é PDF
        if (document.mime_type !== 'application/pdf') {
            await sendMessage(chatId, "⚠️ Eu só consigo ler arquivos PDF no momento. Por favor, tente novamente.");
            return { statusCode: 200, body: 'OK' };
        }

        await sendMessage(chatId, "📥 Recebi seu contrato! Estou lendo, aguarde um momento...");
        await sendTypingAction(chatId);

        // 4. Obtém o link de download do arquivo do Telegram
        const fileRes = await axios.get(`${TELEGRAM_API}/getFile?file_id=${document.file_id}`);
        const filePath = fileRes.data.result.file_path;
        const downloadUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${filePath}`;

        // 5. Baixa o arquivo
        const pdfRes = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
        const pdfBuffer = pdfRes.data;

        // 6. Extrai texto (reuso da lógica)
        const doc = await pdfjsLib.getDocument(pdfBuffer).promise;
        let pdfText = '';
        for (let i = 1; i <= doc.numPages; i++) {
            const page = await doc.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map(item => item.str);
            pdfText += strings.join(' ') + '\n';
        }

        // 7. Analisa (assume tipo genérico se não conseguir inferir, ou 'locacao' como default smart)
        // Tenta inferir tipo básico pelo texto
        let contractType = 'outro';
        if (pdfText.match(/locador|locatário|aluguel/i)) contractType = 'locacao';
        else if (pdfText.match(/contratante|contratada|serviços/i)) contractType = 'servicos';

        // Chama o core
        const { extractedData } = analyzeText(pdfText, contractType);

        // 8. Formata a resposta para o Telegram
        let responseText = `🔎 *Análise de Contrato: ${contractType.toUpperCase()}*\n\n`;
        responseText += `💰 *Valor:* ${extractedData.summary.main_value}\n`;
        responseText += `📅 *Duração:* ${extractedData.summary.duration}\n`;
        responseText += `🛡️ *Nota de Segurança:* ${extractedData.summary.score}/100\n\n`;

        if (extractedData.alerts.length > 0) {
            responseText += `⚠️ *Pontos de Atenção:*\n`;
            extractedData.alerts.forEach(alert => {
                responseText += `- *${alert.title}*: ${alert.desc}\n`;
            });
            responseText += `\n`;
        }

        if (extractedData.recommendations.length > 0) {
            responseText += `💡 *Recomendação da IA:*\n${extractedData.recommendations[0].text}\n`;
        }

        responseText += `\n_Esta é uma análise automática e não substitui um advogado._`;

        await sendMessage(chatId, responseText);

        return { statusCode: 200, body: 'OK' };

    } catch (error) {
        console.error("Erro no webhook telegram:", error);
        // Tenta avisar o usuário do erro se tiver chat_id
        try {
            if (event.body) {
                const update = JSON.parse(event.body);
                if (update.message) {
                    await sendMessage(update.message.chat.id, "😵‍💫 Desculpe, tive um problema ao analisar este documento.");
                }
            }
        } catch (e) { }

        return { statusCode: 500, body: 'Error' };
    }
};
