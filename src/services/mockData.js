// --- MOCK DATA & SIMULATION LOGIC ---
// Em produção, isso viria do seu Backend Node.js/Netlify Functions
export const SIMULATED_ANALYSIS = {
    rent: {
        summary: {
            score: 65, // 0 a 100 de segurança
            risk_level: 'medium',
            main_value: 'R$ 2.500,00',
            duration: '30 Meses'
        },
        alerts: [
            { type: 'danger', title: 'Índice IGP-M', desc: 'O contrato prevê reajuste pelo IGP-M, que costuma ser muito alto.' },
            { type: 'warning', title: 'Multa de Rescisão', desc: 'Multa de 3 aluguéis inteiros se sair antes de 12 meses.' },
            { type: 'success', title: 'Benfeitorias', desc: 'O proprietário aceita abater reformas do aluguel.' }
        ],
        terms: [
            { term: 'Fiança Fidejussória', meaning: 'Significa apenas que você precisa de um Fiador.' },
            { term: 'Solidariedade Passiva', meaning: 'Se tiver mais de um inquilino, a dívida de um pode ser cobrada do outro.' }
        ]
    },
    service: {
        summary: {
            score: 90,
            risk_level: 'low',
            main_value: 'R$ 5.000,00',
            duration: 'Determinado (Projeto)'
        },
        alerts: [
            { type: 'warning', title: 'Propriedade Intelectual', desc: 'O contrato não deixa claro quem é dono do código final.' },
            { type: 'success', title: 'Pagamento', desc: '50% na entrada e 50% na entrega. Modelo seguro.' }
        ],
        terms: [
            { term: 'Foro de Eleição', meaning: 'Cidade onde ocorrerá o processo judicial caso haja briga.' }
        ]
    }
};
