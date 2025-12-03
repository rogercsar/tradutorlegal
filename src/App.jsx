import React, { useState, useEffect } from 'react';
import { 
  Shield, FileText, CheckCircle, AlertTriangle, Search, 
  Menu, X, User, Upload, ArrowRight, Lock, Save, Share2, 
  MessageSquare, FileCheck, DollarSign, Calendar, Home,
  Zap, Star, ChevronDown, Check, Mail, Phone, MapPin
} from 'lucide-react';

// --- MOCK DATA & SIMULATION LOGIC ---
// Em produção, isso viria do seu Backend Node.js/Netlify Functions

const SIMULATED_ANALYSIS = {
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

// --- COMPONENTS ---

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30",
    secondary: "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 hover:border-blue-300",
    outline: "border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm",
    ghost: "text-blue-600 hover:bg-blue-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100"
  };
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Input = ({ label, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    <input 
      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
      {...props}
    />
  </div>
);

// --- MAIN APP COMPONENT ---

export default function App() {
  const [view, setView] = useState('landing'); // landing, auth, profile, upload, analysis
  const [user, setUser] = useState(null); // Mock auth state
  const [loading, setLoading] = useState(false);
  const [currentContract, setCurrentContract] = useState(null);
  
  // Auth State
  const [isLoginMode, setIsLoginMode] = useState(true);

  const [formData, setFormData] = useState({
    name: 'Ana Silva',
    email: 'ana@exemplo.com',
    password: '',
    phone: '(11) 99999-9999',
    birth: '1995-05-20',
    address: 'Rua das Flores, 123 - SP'
  });

  // Simulation Handlers
  const handleAuth = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simula delay de rede
    setTimeout(() => {
      // Em produção, aqui chamaria o Supabase signIn ou signUp
      if (!isLoginMode) {
        // Lógica de cadastro
        console.log("Cadastrando usuário:", formData.name);
      } else {
        // Lógica de login
        console.log("Logando usuário:", formData.email);
      }
      
      setUser({ name: formData.name || 'Usuário', email: formData.email });
      setLoading(false);
      setView('upload');
    }, 1500);
  };

  const handleUpload = (type) => {
    setLoading(true);
    // Simulating upload & extraction processing
    setTimeout(() => {
      const result = type === 'rent' ? SIMULATED_ANALYSIS.rent : SIMULATED_ANALYSIS.service;
      setCurrentContract({ type, ...result, date: new Date().toLocaleDateString() });
      setLoading(false);
      setView('analysis');
    }, 2500);
  };

  // --- VIEWS ---

  const LandingPage = () => (
    <div className="font-sans text-gray-900 scroll-smooth bg-gray-50">
      
      {/* Navbar Transparente/Sticky */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2 text-2xl font-bold cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
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
                        <p className="text-gray-600 text-sm mt-1">Se você sair antes do fim do contrato, paga uma multa. <br/><br/>Exemplo: Se sair faltando 6 meses, a multa será aprox. <strong>R$ 1.200,00</strong>.</p>
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
            <Shield className="h-6 w-6 text-blue-600" />
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

  const AuthPage = () => (
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
                 onChange={e => setFormData({...formData, name: e.target.value})}
                 required
               />
             </div>
          )}

          <Input 
            label="Email Profissional ou Pessoal" 
            type="email" 
            placeholder="seu@email.com"
            value={formData.email} 
            onChange={e => setFormData({...formData, email: e.target.value})}
            required
          />
          
          <Input 
            label="Senha" 
            type="password" 
            placeholder="Mínimo 6 caracteres"
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
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

  const DashboardLayout = ({ children, active = 'upload' }) => (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between h-auto md:h-screen sticky top-0 z-40">
        <div>
          <div className="flex items-center gap-2 font-bold text-xl text-gray-900 mb-10 cursor-pointer" onClick={() => setView('landing')}>
            <div className="bg-blue-600 p-1 rounded-md">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span>Tradutor<span className="text-blue-600">Legal</span></span>
          </div>
          
          <nav className="space-y-1">
            {[
              { id: 'upload', icon: Upload, label: 'Novo Contrato' },
              { id: 'analysis', icon: FileCheck, label: 'Última Análise', disabled: !currentContract },
              { id: 'profile', icon: User, label: 'Meu Perfil' }
            ].map((item) => (
              <button 
                key={item.id}
                disabled={item.disabled}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  active === item.id 
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
            <div className="h-10 w-10 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'Visitante'}</p>
              <button onClick={() => setView('landing')} className="text-xs text-gray-500 group-hover:text-red-500 transition-colors flex items-center gap-1">
                Sair da conta
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );

  const UploadView = () => (
    <DashboardLayout active="upload">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Olá, {user?.name?.split(' ')[0]} 👋</h2>
        <p className="text-gray-500">O que vamos desmistificar hoje?</p>
      </div>

      {loading ? (
        <div className="bg-white p-16 rounded-3xl shadow-sm border border-gray-100 text-center animate-pulse flex flex-col items-center justify-center min-h-[400px]">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
            <div className="relative h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <Search className="h-10 w-10 text-blue-600 animate-spin" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Analisando documento...</h3>
          <p className="text-gray-500 max-w-sm">Nossa IA está lendo cada cláusula, procurando por pegadinhas e termos complexos.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Tipo 1 */}
          <button 
            onClick={() => handleUpload('rent')}
            className="group bg-white p-8 rounded-3xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Home className="h-32 w-32 text-blue-600" />
            </div>
            <div className="h-14 w-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors relative z-10">
              <Home className="h-7 w-7 text-orange-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 relative z-10">Contrato de Aluguel</h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed relative z-10">
              Ideal para inquilinos. Verifica índice de reajuste (IGPM/IPCA), multa de rescisão e responsabilidades de pintura.
            </p>
          </button>

          {/* Tipo 2 */}
          <button 
            onClick={() => handleUpload('service')}
            className="group bg-white p-8 rounded-3xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all text-left relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FileText className="h-32 w-32 text-purple-600" />
            </div>
            <div className="h-14 w-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors relative z-10">
              <FileText className="h-7 w-7 text-purple-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 relative z-10">Prestação de Serviços</h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed relative z-10">
              Para freelancers e agências. Verifica prazos de pagamento, propriedade intelectual e condições de entrega.
            </p>
          </button>
          
          {/* Dropzone visual */}
          <div className="md:col-span-2 border-3 border-dashed border-gray-200 rounded-3xl p-16 text-center hover:bg-gray-50 hover:border-blue-400 transition-colors cursor-pointer flex flex-col items-center justify-center">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
            <p className="font-bold text-lg text-gray-900">Arraste e solte seu PDF aqui</p>
            <p className="text-sm text-gray-500 mt-1">ou clique para selecionar do computador</p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );

  const AnalysisView = () => {
    if (!currentContract) return <UploadView />;
    const data = currentContract;

    return (
      <DashboardLayout active="analysis">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wide flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Análise Completa
              </span>
              <span className="text-gray-400 text-sm">Hoje, 14:30</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Resumo do Contrato</h2>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="px-4 py-2 text-sm h-10"><Save className="h-4 w-4" /> Salvar PDF</Button>
            <Button className="px-4 py-2 text-sm h-10"><Share2 className="h-4 w-4" /> Compartilhar</Button>
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
              <div className={`h-full rounded-full ${data.summary.score > 70 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{width: `${data.summary.score}%`}}></div>
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
            <button className="bg-white/20 hover:bg-white/30 w-full py-2 rounded-lg text-sm font-semibold backdrop-blur-sm transition-colors flex items-center justify-center gap-2 relative z-10">
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
                </div>
              ))}
            </div>
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
              <Button className="w-full mt-6 bg-white/10 hover:bg-white/20 border-none text-white text-sm h-9">
                Adicionar Lembrete
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  };

  const ProfileView = () => (
    <DashboardLayout active="profile">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Configurações da Conta</h2>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row items-center gap-8">
            <div className="relative group cursor-pointer">
               <div className="h-28 w-28 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 border-4 border-white shadow-lg overflow-hidden">
                 {/* Simulação de Foto */}
                 <span className="text-4xl font-bold text-gray-300">{formData.name.charAt(0)}</span>
               </div>
               <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <Upload className="h-6 w-6 text-white" />
               </div>
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{formData.name}</h2>
              <p className="text-gray-500 mb-4">{formData.email}</p>
              <div className="flex justify-center md:justify-start gap-3">
                <Button variant="outline" className="text-gray-600 border-gray-300 hover:bg-gray-50 h-9 px-4 text-sm">Alterar Senha</Button>
                <Button variant="danger" className="h-9 px-4 text-sm bg-red-50 text-red-600 hover:bg-red-100">Excluir Conta</Button>
              </div>
            </div>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Nome Completo" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              <Input label="Email Principal" value={formData.email} disabled className="bg-gray-50 cursor-not-allowed opacity-70" />
              <Input label="Telefone / WhatsApp" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              <Input label="Data de Nascimento" type="date" value={formData.birth} onChange={(e) => setFormData({...formData, birth: e.target.value})} />
            </div>
            <Input label="Endereço Completo" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
            
            <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setView('upload')}>Cancelar</Button>
              <Button onClick={() => alert("Salvo com sucesso!")}>Salvar Alterações</Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );

  // --- RENDER CONTROL ---

  switch (view) {
    case 'auth': return <AuthPage />;
    case 'upload': return <UploadView />;
    case 'analysis': return <AnalysisView />;
    case 'profile': return <ProfileView />;
    default: return <LandingPage />;
  }
}