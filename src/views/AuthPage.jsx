import React from 'react';
import { Shield, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const AuthPage = ({ isLoginMode, setIsLoginMode, formData, setFormData, handleAuth, loading, setView }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full relative overflow-hidden">
            {/* Decorative Header */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

            <div className="text-center mb-10">
                <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                    <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {isLoginMode ? 'Bem-vindo de volta' : 'Crie sua conta'}
                </h2>
                <p className="text-gray-500">
                    {isLoginMode ? 'Acesse seus contratos analisados.' : 'Comece a analisar contratos grátis.'}
                </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
                {/* Campo Nome (Apenas Cadastro) */}
                {!isLoginMode && (
                    <div className="animate-fade-in-down">
                        <Input
                            label="Nome Completo"
                            type="text"
                            placeholder="Ex: João da Silva"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                )}

                <Input
                    label="Email Profissional ou Pessoal"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                />

                <Input
                    label="Senha"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    required
                />

                <Button type="submit" className="w-full h-12 text-lg justify-center shadow-blue-200">
                    {loading ? (
                        <span className="animate-pulse">Processando...</span>
                    ) : (
                        isLoginMode ? 'Entrar na Plataforma' : 'Criar Conta Grátis'
                    )}
                </Button>
            </form>

            {/* Toggle Login/Cadastro */}
            <div className="mt-8 text-center pt-6 border-t border-gray-100">
                <p className="text-gray-600">
                    {isLoginMode ? 'Ainda não tem conta?' : 'Já tem uma conta?'}
                    <button
                        onClick={() => setIsLoginMode(!isLoginMode)}
                        className="ml-2 font-bold text-blue-600 hover:underline focus:outline-none"
                    >
                        {isLoginMode ? 'Cadastre-se' : 'Fazer Login'}
                    </button>
                </p>
            </div>

            <button
                onClick={() => setView('landing')}
                className="mt-6 text-xs text-gray-400 hover:text-gray-600 w-full text-center flex items-center justify-center gap-1"
            >
                <ArrowRight className="h-3 w-3 rotate-180" /> Voltar para Home
            </button>
        </div>
    </div>
);

export default AuthPage;
