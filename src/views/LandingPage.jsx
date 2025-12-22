import React from 'react';
import { Shield, ArrowRight, CheckCircle, Zap, Upload, FileCheck, Check, Share2, Mail } from 'lucide-react';
import Button from '../components/ui/Button';

const LandingPage = ({ setView, setIsLoginMode }) => (
    <div className="font-sans text-gray-900 scroll-smooth bg-gray-50">

        {/* Navbar Transparente/Sticky */}
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center gap-2 text-2xl font-bold cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
                        <img src="/logo.png" alt="Logo Tradutor Legal" className="h-8 w-auto" />
                        <span className="text-gray-900 tracking-tight">Tradutor<span className="text-blue-600">Legal</span></span>
                    </div>
                    <div className="hidden md:flex gap-8 items-center font-medium text-sm text-gray-600">
                        <a href="#funciona" className="hover:text-blue-600 transition-colors">Como Funciona</a>
                        <a href="#exemplo" className="hover:text-blue-600 transition-colors">Exemplos</a>
                        <a href="#planos" className="hover:text-blue-600 transition-colors">Planos</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => { setIsLoginMode(true); setView('auth'); }} className="hidden md:block text-gray-600 font-medium hover:text-blue-600">Entrar</button>
                        <Button onClick={() => { setIsLoginMode(false); setView('auth'); }} className="px-5 py-2.5 text-sm rounded-full shadow-blue-200">
                            Criar Conta
                        </Button>
                    </div>
                </div>
            </div>
        </nav>

        {/* Hero Modernizado */}
        <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-20 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 mb-8 animate-fade-in-up">
                    <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                    <span className="text-sm font-medium text-gray-600">+10.000 contratos simplificados hoje</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-[1.1]">
                    Transforme <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Juridiquês</span> <br className="hidden md:block" />
                    em Português Claro.
                </h1>

                <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Nossa IA analisa contratos em segundos, destaca riscos ocultos e te protege de multas abusivas antes de você assinar.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button onClick={() => { setIsLoginMode(false); setView('auth'); }} className="h-14 px-8 text-lg w-full sm:w-auto">
                        Começar Grátis
                        <ArrowRight className="h-5 w-5" />
                    </Button>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" /> Sem cartão de crédito
                    </div>
                </div>

                {/* Floating UI Mockup */}
                <div className="mt-16 mx-auto max-w-5xl relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20"></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 border-b border-gray-100 p-4 flex gap-2">
                            <div className="h-3 w-3 rounded-full bg-red-400"></div>
                            <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                            <div className="h-3 w-3 rounded-full bg-green-400"></div>
                        </div>
                        <div className="p-8 grid md:grid-cols-2 gap-8 text-left">
                            <div className="space-y-4 opacity-50 blur-[0.5px] select-none pointer-events-none">
                                <h4 className="font-serif text-lg font-bold">CLÁUSULA SÉTIMA - DA RESCISÃO</h4>
                                <p className="font-serif text-sm leading-relaxed">O LOCATÁRIO poderá rescindir o presente contrato, mediante notificação prévia, incorrendo na multa de 03 (três) aluguéis vigentes, proporcionalmente ao tempo restante...</p>
                            </div>
                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm relative">
                                <div className="absolute -left-3 top-10 w-6 h-6 bg-blue-500 rotate-45 transform"></div>
                                <div className="flex items-start gap-4 relative z-10">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                        <Zap className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-gray-900">Tradução da IA</h5>
                                        <p className="text-gray-600 text-sm mt-1">Se você sair antes do fim do contrato, paga uma multa. <br /><br />Exemplo: Se sair faltando 6 meses, a multa será aprox. <strong>R$ 1.200,00</strong>.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        {/* Features Grid */}
        <section id="funciona" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-20">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Como funciona</h2>
                    <p className="text-lg text-gray-500">Simplificamos o complexo em 3 passos.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { icon: Upload, color: "text-blue-600", bg: "bg-blue-50", title: "1. Upload Seguro", desc: "Envie PDF, foto ou Word. Seus dados são criptografados de ponta a ponta." },
                        { icon: Zap, color: "text-purple-600", bg: "bg-purple-50", title: "2. Análise Instantânea", desc: "Nossa IA lê 50 páginas em segundos e destaca o que realmente importa." },
                        { icon: FileCheck, color: "text-green-600", bg: "bg-green-50", title: "3. Relatório Claro", desc: "Receba um resumo com riscos (vermelho) e benefícios (verde)." }
                    ].map((feature, idx) => (
                        <div key={idx} className="group p-8 rounded-3xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <feature.icon className={`h-7 w-7 ${feature.color}`} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Planos */}
        <section id="planos" className="py-24 bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl font-bold mb-4">Planos transparentes.</h2>
                        <p className="text-gray-400 text-lg">Sem letras miúdas. Cancele quando quiser.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Free */}
                    <div className="p-8 rounded-3xl border border-gray-800 hover:border-gray-700 transition-colors bg-gray-800/50">
                        <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Básico</div>
                        <div className="text-4xl font-bold mb-6">R$ 0</div>
                        <ul className="space-y-4 mb-8 text-gray-300">
                            <li className="flex gap-3"><Check className="h-5 w-5 text-blue-500" /> 1 Análise Resumida</li>
                            <li className="flex gap-3"><Check className="h-5 w-5 text-blue-500" /> Detecção de Risco Alto</li>
                        </ul>
                        <Button variant="outline" className="w-full" onClick={() => { setIsLoginMode(false); setView('auth'); }}>Criar Conta Grátis</Button>
                    </div>

                    {/* Pro */}
                    <div className="p-8 rounded-3xl bg-blue-600 relative transform md:-translate-y-4 shadow-2xl shadow-blue-900/50">
                        <div className="absolute top-0 right-0 bg-white text-blue-600 text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">POPULAR</div>
                        <div className="text-sm font-bold text-blue-100 uppercase tracking-wider mb-4">Pro</div>
                        <div className="text-4xl font-bold mb-1">R$ 29</div>
                        <div className="text-sm text-blue-200 mb-6">cobrado mensalmente</div>
                        <ul className="space-y-4 mb-8 text-white">
                            <li className="flex gap-3"><Check className="h-5 w-5 text-white" /> 5 Análises Completas/mês</li>
                            <li className="flex gap-3"><Check className="h-5 w-5 text-white" /> Chat Ilimitado com IA</li>
                            <li className="flex gap-3"><Check className="h-5 w-5 text-white" /> Gerador de Contraproposta</li>
                        </ul>
                        <Button className="w-full bg-white text-blue-600 hover:bg-gray-100 border-none shadow-none" onClick={() => { setIsLoginMode(false); setView('auth'); }}>Começar Teste Grátis</Button>
                    </div>

                    {/* Enterprise */}
                    <div className="p-8 rounded-3xl border border-gray-800 hover:border-gray-700 transition-colors bg-gray-800/50">
                        <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Empresas</div>
                        <div className="text-4xl font-bold mb-6">API</div>
                        <ul className="space-y-4 mb-8 text-gray-300">
                            <li className="flex gap-3"><Check className="h-5 w-5 text-blue-500" /> Integração via API</li>
                            <li className="flex gap-3"><Check className="h-5 w-5 text-blue-500" /> Whitelabel</li>
                            <li className="flex gap-3"><Check className="h-5 w-5 text-blue-500" /> Volume Ilimitado</li>
                        </ul>
                        <Button variant="outline" className="w-full" onClick={() => window.open('mailto:comercial@tradutorlegal.com')}>Falar com Vendas</Button>
                    </div>
                </div>
            </div>
        </section>

        {/* Footer Minimalista */}
        <footer className="bg-white border-t border-gray-200 py-12">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2 text-xl font-bold text-gray-900">
                    <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
                    <span>Tradutor<span className="text-blue-600">Legal</span></span>
                </div>
                <div className="text-gray-500 text-sm">
                    © 2024 Tradutor Legal Ltda. Todos os direitos reservados.
                </div>
                <div className="flex gap-6">
                    <a href="#" className="text-gray-400 hover:text-blue-600"><Mail className="h-5 w-5" /></a>
                    <a href="#" className="text-gray-400 hover:text-blue-600"><Share2 className="h-5 w-5" /></a>
                </div>
            </div>
        </footer>
    </div>
);

export default LandingPage;
