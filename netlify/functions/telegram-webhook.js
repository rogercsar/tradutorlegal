import { analyzeText } from './utils/analysisCore.js';

import axios from 'axios';


const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

const sendMessage = async (chatId, text, keyboard = null) => {
    const body = {
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
    };
    if (keyboard) {
        body.reply_markup = keyboard;
    }
    await axios.post(`${TELEGRAM_API}/sendMessage`, body);
};

const sendTypingAction = async (chatId) => {
    await axios.post(`${TELEGRAM_API}/sendChatAction`, {
        chat_id: chatId,
        action: 'typing'
    });
};

export const handler = async (event) => {
    console.log("🔍 [Webhook] Função iniciada. Método:", event.httpMethod); // Log de entrada

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        console.log("🔍 [Webhook] Corpo recebido:", event.body); // Log do payload
        const update = JSON.parse(event.body);

        // Verifica se é uma mensagem
        if (!update.message) {
            console.log("⚠️ [Webhook] Update não contém mensagem. Ignorando.");
            return { statusCode: 200, body: 'OK' }; // Ignora atualizações que não são mensagens
        }

        const chatId = update.message.chat.id;
        const document = update.message.document;
        const text = update.message.text;

        console.log(`🔍 [Webhook] ChatID: ${chatId}, Texto: ${text}, Documento: ${document ? 'Sim' : 'Não'}`);

        // Menu Principal
        const mainMenuKeyboard = {
            keyboard: [
                [{ text: "📄 Enviar Contrato" }, { text: "❓ Como funciona?" }],
                [{ text: "📞 Suporte" }]
            ],
            resize_keyboard: true,
            one_time_keyboard: false
        };

        // 1. Boas vindas / Menu
        if (text === '/start' || text === '👋 Olá') {
            await sendMessage(chatId,
                "👋 *Olá! Bem-vindo ao Tradutor Legal Bot.*\n\nEu sou uma Inteligência Artificial especializada em simplificar contratos.\n\nO que você deseja fazer hoje?",
                mainMenuKeyboard
            );
            return { statusCode: 200, body: 'OK' };
        }

        // 2. Respostas do Menu
        if (text === '❓ Como funciona?') {
            await sendMessage(chatId, "É muito simples:\n\n1. Você me envia um arquivo **PDF** do seu contrato.\n2. Eu leio e analiso as cláusulas principais.\n3. Te respondo com um resumo, alertas de risco e recomendações.\n\nExperimente clicar em *📄 Enviar Contrato*!");
            return { statusCode: 200, body: 'OK' };
        }

        if (text === '📞 Suporte') {
            await sendMessage(chatId, "Para falar com um humano, envie um e-mail para: suporte@tradutorlegal.com.br");
            return { statusCode: 200, body: 'OK' };
        }

        if (text === '📄 Enviar Contrato') {
            await sendMessage(chatId, "Ótimo! Por favor, anexe o arquivo **PDF** do contrato aqui na conversa e eu começarei a análise imediatamente.");
            return { statusCode: 200, body: 'OK' };
        }

        // 3. Processamento de Arquivo (PDF)
        if (document) {
            if (document.mime_type !== 'application/pdf') {
                await sendMessage(chatId, "⚠️ Eu só consigo ler arquivos PDF no momento. Por favor, envie um arquivo .pdf.");
                return { statusCode: 200, body: 'OK' };
            }

            await sendMessage(chatId, "📥 Recebi seu arquivo! Estou analisando as cláusulas... 🕵️‍♀️");
            await sendTypingAction(chatId);

            // Obtém link e baixa
            const fileRes = await axios.get(`${TELEGRAM_API}/getFile?file_id=${document.file_id}`);
            const filePath = fileRes.data.result.file_path;
            const downloadUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${filePath}`;

            const pdfRes = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
            const pdfBuffer = pdfRes.data;

            // Extrai texto
            const pdfParse = await import('pdf-parse');
            const data = await pdfParse.default(pdfBuffer);
            const pdfText = data.text;

            // Analisa
            let contractType = 'outro';
            if (pdfText.match(/locador|locatário|aluguel/i)) contractType = 'locacao';
            else if (pdfText.match(/contratante|contratada|serviços/i)) contractType = 'servicos';
            else if (pdfText.match(/seguradora|segurado|apólice/i)) contractType = 'seguro';

            const { extractedData } = analyzeText(pdfText, contractType);

            // Responde
            let responseText = `🔎 *Análise Concluída!* (${contractType.toUpperCase()})\n\n`;
            responseText += `💰 *Valor:* ${extractedData.summary.main_value}\n`;
            responseText += `📅 *Duração:* ${extractedData.summary.duration}\n`;
            responseText += `🛡️ *Segurança:* ${extractedData.summary.score}/100\n\n`;

            if (extractedData.alerts.length > 0) {
                responseText += `⚠️ *Pontos de Atenção:*\n`;
                extractedData.alerts.forEach(alert => {
                    responseText += `- *${alert.title}*: ${alert.desc}\n`;
                });
                responseText += `\n`;
            }

            if (extractedData.recommendations.length > 0) {
                responseText += `💡 *Dica:* ${extractedData.recommendations[0].text}\n`;
            }

            responseText += `\n_Para ver detalhes completos, acesse nossa plataforma web._`;

            await sendMessage(chatId, responseText);
            return { statusCode: 200, body: 'OK' };
        }

        // 4. Default if text not understood
        if (!document && text !== '/start') {
            await sendMessage(chatId, "Desculpe, não entendi. Use o menu abaixo para navegar.", mainMenuKeyboard);
            return { statusCode: 200, body: 'OK' };
        }

        return { statusCode: 200, body: 'OK' };

    } catch (error) {
        console.error("Erro no webhook telegram:", error);
        try {
            if (event.body) {
                const update = JSON.parse(event.body);
                if (update.message) {
                    await sendMessage(update.message.chat.id, "😵‍💫 Tive um erro interno ao processar sua solicitação.");
                }
            }
        } catch (e) { }
        return { statusCode: 500, body: 'Error' };
    }
};
