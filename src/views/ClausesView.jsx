import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import Button from '../components/ui/Button';
import { supabase } from '../supabaseClient';

const ClausesView = ({ session, setView, handleLogout, handleGenerateEmail, handleDeleteClause }) => {
    const [savedClauses, setSavedClauses] = useState([]);
    const [loadingClauses, setLoadingClauses] = useState(true);

    useEffect(() => {
        let isMounted = true; // Flag para controlar o efeito

        async function fetchSavedClauses() {
            setLoadingClauses(true);
            const { data, error } = await supabase
                .from('saved_clauses')
                .select('*')
                .order('created_at', { ascending: false });

            if (isMounted) { // Só atualiza o estado se o componente ainda estiver montado
                if (error) {
                    console.error("Erro ao buscar cláusulas salvas:", error);
                } else {
                    setSavedClauses(data);
                }
                setLoadingClauses(false);
            }
        }
        fetchSavedClauses();

        return () => { isMounted = false; }; // Função de limpeza
    }, []); // O array vazio garante que o efeito rode apenas na montagem

    return (
        <DashboardLayout active="clauses" setView={setView} session={session} handleLogout={handleLogout}>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Cláusulas Salvas</h2>
                <p className="text-gray-500">Seu repositório pessoal de pontos importantes e recomendações.</p>
            </div>
            {loadingClauses ? <p>Carregando...</p> : (
                <div className="space-y-4">
                    {savedClauses.map(clause => (
                        <div key={clause.id} className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-xs text-gray-400">Do contrato: <span className="font-semibold text-gray-500">{clause.document_title}</span></p>
                                <p className="text-xs text-gray-400">Salvo em: {new Date(clause.created_at).toLocaleDateString()}</p>
                            </div>
                            <h4 className="font-bold text-gray-800 mb-2 flex-1">{clause.clause_title}</h4>
                            <p className="text-gray-600 text-sm mb-4 flex-1">{clause.clause_text}</p>
                            <div className="flex justify-end items-center gap-2 border-t border-gray-100 pt-3 mt-auto">
                                {clause.clause_type.startsWith('recommendation') && (
                                    <Button variant="ghost" onClick={() => handleGenerateEmail({ type: clause.clause_type.split(':')[1], text: clause.clause_text })} className="h-auto px-3 py-1 text-xs">Gerar E-mail</Button>
                                )}
                                <button onClick={() => handleDeleteClause(clause.id)} className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
};

export default ClausesView;
