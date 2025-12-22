import React from 'react';
import { Search, FileCheck, FileText, Trash2 } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const HistoryView = ({ documentos, loading, handleAnalyseDocument, handleDeleteDocument, setView, session, handleLogout, currentPage, setCurrentPage, hasMore, searchTerm, setSearchTerm, typeFilter, setTypeFilter }) => (
    <DashboardLayout active="history" setView={setView} session={session} handleLogout={handleLogout}>
        <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Histórico de Análises</h2>
            <p className="text-gray-500">Consulte todos os seus documentos enviados e seus respectivos status.</p>
        </div>

        {/* Filtros */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="relative md:col-span-2">
                <Input type="text" placeholder="Buscar pelo título do documento..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <div>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white h-[50px]">
                    <option value="all">Todos os Tipos</option>
                    <option value="locacao">Aluguel / Locação</option>
                    <option value="servicos">Prestação de Serviços</option>
                    <option value="seguro">Apólice de Seguro</option>
                    <option value="financiamento">Financiamento</option>
                    <option value="edital">Edital de Licitação</option>
                    <option value="nda">Acordo de Confidencialidade (NDA)</option>
                    <option value="propriedade_intelectual">Propriedade Intelectual</option>
                    <option value="outro">Outro (Análise Genérica)</option>
                </select>
            </div>
        </div>

        {loading ? (
            <div className="bg-white p-16 rounded-3xl shadow-sm border border-gray-100 text-center animate-pulse flex flex-col items-center justify-center min-h-[400px]">
                <div className="relative h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                    <Search className="h-10 w-10 text-blue-600 animate-spin" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Analisando documento...</h3>
            </div>
        ) : (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-4">Meus Documentos</h3>
                {documentos.length > 0 ? (
                    <ul className="divide-y divide-gray-100">
                        {documentos.map(doc => {
                            const hasAnalysis = !!doc.analysis_result;
                            return (
                                <li key={doc.id} className="flex items-center justify-between py-3 hover:bg-gray-50 px-2 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        {hasAnalysis ? (
                                            <FileCheck className="h-5 w-5 text-green-500" title="Analisado" />
                                        ) : (
                                            <FileText className="h-5 w-5 text-gray-400" title="Pendente de análise" />
                                        )}
                                        <span className="text-gray-800">{doc.titulo}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" onClick={() => handleAnalyseDocument(doc)} className="h-auto px-3 py-1 text-sm">
                                            {hasAnalysis ? 'Ver Análise' : 'Analisar'}
                                        </Button>
                                        <Button variant="ghost" onClick={() => handleDeleteDocument(doc)} className="h-auto px-2 py-1 text-sm text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="text-center text-gray-500 py-8">Você ainda não adicionou nenhum documento.</p>
                )}
            </div>
        )}

        {/* Controles de Paginação */}
        {!loading && documentos.length > 0 && (
            <div className="flex justify-between items-center mt-6">
                <Button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0} variant="secondary" className="h-10 px-4 text-sm">
                    Anterior
                </Button>
                <span className="text-sm text-gray-500">Página {currentPage + 1}</span>
                <Button onClick={() => setCurrentPage(p => p + 1)} disabled={!hasMore} variant="secondary" className="h-10 px-4 text-sm">
                    Próxima
                </Button>
            </div>
        )}
    </DashboardLayout>
);

export default HistoryView;
