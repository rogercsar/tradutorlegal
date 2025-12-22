import React, { useState } from 'react';
import { Shield, LayoutDashboard, Upload, GitCompareArrows, History, Bookmark, FileCheck, User, X, Menu } from 'lucide-react';
import { supabase } from '../supabaseClient';

const DashboardLayout = ({ children, active = 'upload', setView, currentContract, session, handleLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Constrói a URL pública para o avatar do usuário
    const avatarUrl = session?.user?.user_metadata?.avatar_url
        ? supabase.storage.from('avatars').getPublicUrl(session.user.user_metadata.avatar_url).data.publicUrl
        : null;

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            {/* Overlay para fechar o menu no mobile */}
            {isMenuOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setIsMenuOpen(false)}></div>}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between z-50 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
                <div>
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-2 font-bold text-xl text-gray-900 cursor-pointer" onClick={() => setView('dashboard')}>
                            <div className="bg-blue-600 p-1 rounded-md">
                                <Shield className="h-5 w-5 text-white" />
                            </div>
                            <span>Tradutor<span className="text-blue-600">Legal</span></span>
                        </div>
                        <button onClick={() => setIsMenuOpen(false)} className="md:hidden p-1">
                            <X className="h-6 w-6 text-gray-500" />
                        </button>
                    </div>

                    <nav className="space-y-1">
                        {[
                            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                            { id: 'upload', icon: Upload, label: 'Novo Contrato' },
                            { id: 'comparison', icon: GitCompareArrows, label: 'Comparar Contratos' },
                            { id: 'history', icon: History, label: 'Histórico' },
                            { id: 'clauses', icon: Bookmark, label: 'Cláusulas Salvas' },
                            { id: 'analysis', icon: FileCheck, label: 'Última Análise', disabled: !currentContract },
                            { id: 'profile', icon: User, label: 'Meu Perfil' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                disabled={item.disabled}
                                onClick={() => setView(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${active === item.id
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                                    }`}
                            >
                                <item.icon className={`h-5 w-5 ${active === item.id ? 'text-blue-600' : 'text-gray-400'}`} />
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group">
                        <div className="h-10 w-10 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow-md overflow-hidden">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar do usuário" className="h-full w-full object-cover" />
                            ) : (
                                session?.user?.user_metadata?.full_name?.charAt(0) || 'U'
                            )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-gray-900 truncate">{session?.user?.user_metadata?.full_name || 'Visitante'}</p>
                            <button onClick={handleLogout} className="text-xs text-gray-500 group-hover:text-red-500 transition-colors flex items-center gap-1">
                                Sair da conta
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4 flex items-center justify-between z-30">
                    <div className="flex items-center gap-2 font-bold text-lg text-gray-900" onClick={() => setView('dashboard')}>
                        <div className="bg-blue-600 p-1 rounded-md">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <span>Tradutor<span className="text-blue-600">Legal</span></span>
                    </div>
                    <button onClick={() => setIsMenuOpen(true)} className="p-2">
                        <Menu className="h-6 w-6 text-gray-700" />
                    </button>
                </header>
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <div className="max-w-5xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
