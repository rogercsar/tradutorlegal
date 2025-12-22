import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

const ComparisonView = ({ documentos, setView, session, handleLogout }) => {
    const [contractAId, setContractAId] = useState('');
    const [contractBId, setContractBId] = useState('');

    const contractA = documentos.find(doc => doc.id === parseInt(contractAId));
    const contractB = documentos.find(doc => doc.id === parseInt(contractBId));

    // Lógica para determinar a melhor pontuação
    let winner = null;
    if (contractA?.analysis_result && contractB?.analysis_result) {
        if (contractA.analysis_result.summary.score > contractB.analysis_result.summary.score) {
            winner = 'A';
        } else if (contractB.analysis_result.summary.score > contractA.analysis_result.summary.score) {
            winner = 'B';
        }
    }

    const renderSummary = (contract, isWinner) => {
        if (!contract || !contract.analysis_result) {
            return <div className="text-center text-gray-500 p-8">Selecione um contrato analisado.</div>;
        }
        const summary = contract.analysis_result.summary;
        return (
            <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500">Valor Principal</p>
                    <p className="font-bold text-lg text-blue-600">{summary.main_value}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500">Duração</p>
                    <p className="font-bold text-lg">{summary.duration}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500">Nível de Segurança</p>
                    <div className="flex items-center gap-2">
                        <p className={`font-bold text-lg ${summary.score > 70 ? 'text-green-600' : 'text-yellow-600'}`}>{summary.score} / 100</p>
                        {isWinner && (
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">Melhor Opção</span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <DashboardLayout active="comparison" setView={setView} session={session} handleLogout={handleLogout}>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Comparador de Contratos</h2>
                <p className="text-gray-500">Selecione dois contratos para ver um resumo comparativo de suas análises.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Coluna Contrato A */}
                <div className={`bg-white p-6 rounded-2xl shadow-sm transition-all duration-300 ${winner === 'A' ? 'border-2 border-green-500' : 'border border-gray-200'}`}>
                    <h3 className="font-bold text-lg mb-4">Contrato 1</h3>
                    <select value={contractAId} onChange={e => setContractAId(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-6">
                        <option value="">Selecione o primeiro contrato</option>
                        {documentos.filter(doc => doc.analysis_result).map(doc => <option key={doc.id} value={doc.id}>{doc.titulo}</option>)}
                    </select>
                    {renderSummary(contractA, winner === 'A')}
                </div>

                {/* Coluna Contrato B */}
                <div className={`bg-white p-6 rounded-2xl shadow-sm transition-all duration-300 ${winner === 'B' ? 'border-2 border-green-500' : 'border border-gray-200'}`}>
                    <h3 className="font-bold text-lg mb-4">Contrato 2</h3>
                    <select value={contractBId} onChange={e => setContractBId(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-6">
                        <option value="">Selecione o segundo contrato</option>
                        {documentos.filter(doc => doc.analysis_result && doc.id !== parseInt(contractAId)).map(doc => <option key={doc.id} value={doc.id}>{doc.titulo}</option>)}
                    </select>
                    {renderSummary(contractB, winner === 'B')}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ComparisonView;
