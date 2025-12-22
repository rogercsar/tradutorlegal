import React from 'react';
import {
    CheckCircle, RefreshCw, Save, Share2, DollarSign, Calendar, MessageSquare, AlertTriangle, Bookmark, Lightbulb, Search, Check
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import Button from '../components/ui/Button';

const AnalysisView = ({ currentContract, handleDownloadPdf, handleShare, handleAddReminder, handleReanalyze, handleSaveClause, handleGenerateEmail, setView, session, handleLogout }) => {
    if (!currentContract) return null; // Should ideally redirect or show loading

    // Acessa os dados da análise a partir da propriedade aninhada 'analysis_result'
    // e combina com os dados do documento principal.
    const data = { ...currentContract, ...currentContract.analysis_result };

    return (
        <DashboardLayout active="analysis" setView={setView} session={session} handleLogout={handleLogout} currentContract={currentContract} >
            <div id="analysis-report-content"> {/* Adicionamos um ID para capturar esta área */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wide flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" /> Análise Completa
                            </span>
                            <span className="text-gray-400 text-sm">{data.analysisDate}</span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Resumo do Contrato</h2>
                    </div>
                    <div className="flex w-full justify-center md:w-auto md:justify-start gap-3">
                        <Button variant="outline" onClick={() => handleReanalyze(data)} className="px-4 py-2 text-sm h-10 text-gray-600 border-gray-300 hover:bg-gray-50"><RefreshCw className="h-4 w-4" /> Reanalisar</Button>
                        <Button variant="secondary" onClick={() => handleDownloadPdf(data.titulo)} className="px-4 py-2 text-sm h-10"><Save className="h-4 w-4" /> Baixar Análise</Button>
                        <Button onClick={() => handleShare(data.titulo)} className="px-4 py-2 text-sm h-10"><Share2 className="h-4 w-4" /> Compartilhar</Button>
                    </div>
                </header>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Nível de Segurança</p>
                        <div className="flex items-end gap-2">
                            <span className={`text-4xl font-bold ${data.summary.score > 70 ? 'text-green-600' : 'text-yellow-600'}`}>
                                {data.summary.score}
                            </span>
                            <span className="text-gray-400 text-lg mb-1">/100</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div className={`h-full rounded-full ${data.summary.score > 70 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${data.summary.score}%` }}></div>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Valor Identificado</p>
                        <div className="flex items-center gap-2 h-full pb-4">
                            <DollarSign className="h-6 w-6 text-blue-600" />
                            <span className="text-2xl font-bold text-gray-900">{data.summary.main_value}</span>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Duração</p>
                        <div className="flex items-center gap-2 h-full pb-4">
                            <Calendar className="h-6 w-6 text-purple-600" />
                            <span className="text-2xl font-bold text-gray-900">{data.summary.duration}</span>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-5 rounded-2xl shadow-lg text-white relative overflow-hidden group cursor-pointer">
                        <div className="absolute -right-4 -top-4 bg-white/10 w-24 h-24 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                        <p className="text-blue-100 text-xs font-bold uppercase mb-2 relative z-10">IA Assistant</p>
                        <p className="font-bold mb-3 relative z-10 leading-tight">Tem dúvida sobre alguma cláusula?</p>
                        <button onClick={() => setView('chat')} className="bg-white/20 hover:bg-white/30 w-full py-2 rounded-lg text-sm font-semibold backdrop-blur-sm transition-colors flex items-center justify-center gap-2 relative z-10">
                            <MessageSquare className="h-4 w-4" /> Perguntar Agora
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Coluna Esquerda: Riscos e Pontos Positivos */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-gray-400" />
                                Pontos de Atenção
                            </h3>
                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">3 encontrados</span>
                        </div>

                        <div className="space-y-4">
                            {data.alerts.map((alert, idx) => (
                                <div key={idx} className={`p-6 rounded-2xl border-l-[6px] shadow-sm flex gap-5 items-start bg-white transition-transform hover:-translate-x-1
                ${alert.type === 'danger' ? 'border-red-500' : alert.type === 'warning' ? 'border-yellow-500' : 'border-green-500'}`}>
                                    <div className={`mt-1 p-3 rounded-xl shrink-0 ${alert.type === 'danger' ? 'bg-red-50 text-red-600' : alert.type === 'warning' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'}`}>
                                        {alert.type === 'danger' ? <AlertTriangle className="h-6 w-6" /> : alert.type === 'warning' ? <AlertTriangle className="h-6 w-6" /> : <CheckCircle className="h-6 w-6" />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg mb-1">{alert.title}</h4>
                                        <p className="text-gray-600 leading-relaxed">{alert.desc}</p>
                                    </div>
                                    <button onClick={() => handleSaveClause('alert', alert.title, alert.desc)} className="ml-auto p-2 rounded-full hover:bg-gray-100 shrink-0">
                                        <Bookmark className="h-5 w-5 text-gray-400 hover:text-blue-600" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Seção de Recomendações */}
                        {data.recommendations && data.recommendations.length > 0 && (
                            <div className="mt-8">
                                <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2 mb-4">
                                    <Lightbulb className="h-5 w-5 text-gray-400" />
                                    Recomendações da IA
                                </h3>
                                <div className="space-y-4">
                                    {data.recommendations.map((rec, idx) => (
                                        <div key={idx} className="p-5 rounded-2xl border-l-4 border-blue-500 bg-blue-50/50 flex flex-col sm:flex-row gap-4 items-start">
                                            <div className="mt-1 p-2 bg-blue-100 text-blue-600 rounded-full shrink-0">
                                                <Lightbulb className="h-5 w-5" />
                                            </div>
                                            <p className="text-gray-700 leading-relaxed flex-1">{rec.text}</p>
                                            <div className="flex gap-2 self-start sm:self-center">
                                                <Button variant="ghost" onClick={() => handleGenerateEmail(rec)} className="h-auto px-3 py-1 text-xs">Gerar E-mail</Button>
                                                <button onClick={() => handleSaveClause('recommendation', 'Recomendação da IA', rec.text)} className="p-2 rounded-full hover:bg-gray-100 shrink-0">
                                                    <Bookmark className="h-5 w-5 text-gray-400 hover:text-blue-600" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Coluna Direita: Glossário e Checklist */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                                <Search className="h-4 w-4 text-blue-600" />
                                <h3 className="font-bold text-gray-900 text-sm uppercase">Glossário do Documento</h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {data.terms.map((item, idx) => (
                                    <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                                        <p className="font-bold text-blue-700 text-sm mb-1 cursor-help underline decoration-dotted">{item.term}</p>
                                        <p className="text-gray-500 text-xs leading-relaxed">{item.meaning}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl">
                            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Check className="h-5 w-5 text-green-400" /> Checklist
                            </h4>
                            <ul className="space-y-3">
                                {[
                                    "Negociar índice de reajuste",
                                    "Reconhecer firma em cartório",
                                    "Enviar comprovante de renda"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                        <input type="checkbox" className="mt-1 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-offset-gray-900" />
                                        <span className="leading-tight">{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button onClick={handleAddReminder} className="w-full mt-6 bg-white/10 hover:bg-white/20 border-none text-white text-sm h-9">
                                Adicionar Lembrete
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AnalysisView;
