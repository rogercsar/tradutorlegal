import { useState, useEffect, Fragment } from 'react';
import { 
  Shield, FileText, CheckCircle, AlertTriangle, Search, Send, LayoutDashboard, Lightbulb,
  Menu, X, User, Upload, ArrowRight, Lock, Save, Share2, 
  MessageSquare, FileCheck, DollarSign, Calendar, Home, Trash2, History,
  Zap, Star, ChevronDown, Check, Mail, Phone, MapPin
} from 'lucide-react';
import { supabase } from './supabaseClient'; // Importando o Supabase

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

// --- UI COMPONENTS ADICIONAIS ---

const Notification = ({ message, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000); // A notificação some após 4 segundos

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="bg-green-500 text-white py-3 px-5 rounded-lg shadow-lg animate-fade-in-down flex items-center gap-3">
      <CheckCircle className="h-5 w-5" />
      <span>{message}</span>
    </div>
  );
};

const ChatModal = ({ isOpen, onClose, messages, onSendMessage, isReplying }) => {
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Pergunte à IA sobre o contrato
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><X className="h-5 w-5 text-gray-500" /></button>
        </header>
        <main className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isReplying && (
            <div className="flex justify-start">
              <div className="max-w-md p-3 rounded-2xl bg-gray-100 text-gray-800 rounded-bl-none animate-pulse">
                Digitando...
              </div>
            </div>
          )}
        </main>
        <footer className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input 
              type="text" 
              className="flex-1 w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
              placeholder="Digite sua pergunta..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend} className="h-auto px-4" disabled={isReplying}><Send className="h-5 w-5" /></Button>
          </div>
        </footer>
      </div>
    </div>
  );
};

// --- VIEWS (como componentes independentes) ---

const LandingPage = ({ setView, setIsLoginMode }) => (
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

const DashboardLayout = ({ children, active = 'upload', setView, currentContract, session, handleLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            { id: 'history', icon: History, label: 'Histórico' },
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
            {session?.user?.user_metadata?.full_name?.charAt(0) || 'U'}
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

const UploadView = ({ session, loading, documentos, handleAnalyseDocument, handleDeleteDocument, fetchDocumentos, setView, handleLogout }) => {
  const [newDocumentTitle, setNewDocumentTitle] = useState('');
  const [uploadingFile, setUploadingFile] = useState(null);
  const [contractType, setContractType] = useState('locacao'); // Estado para o tipo de contrato
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadingFile(e.target.files[0]);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!newDocumentTitle.trim() || !uploadingFile || !contractType) {
      alert("Por favor, dê um título e selecione um arquivo PDF.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { user } = session;
      const fileExt = uploadingFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // 1. Faz o upload do arquivo para o Supabase Storage
      let { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, uploadingFile);

      if (uploadError) throw uploadError;

      // 2. Se o upload for bem-sucedido, insere o registro no banco de dados
      const { error } = await supabase
        .from('documentos')
        .insert({ titulo: newDocumentTitle, user_id: user.id, storage_path: filePath, contract_type: contractType });

      if (error) throw error;

      setNewDocumentTitle('');
      setUploadingFile(null);
      setContractType('locacao');
      await fetchDocumentos(); // Re-busca a lista para atualizar a UI
    } catch (error) {
      console.error("Erro no processo de upload:", error.message);
      alert("Não foi possível enviar o documento. Verifique o console para mais detalhes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout setView={setView} session={session} handleLogout={handleLogout} active="upload">
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Olá, {session?.user?.user_metadata?.full_name?.split(' ')[0] || 'Usuário'} 👋</h2>
      <p className="text-gray-500">O que vamos desmistificar hoje?</p>
    </div>

    {/* Formulário para Adicionar Novo Documento */}
    <form onSubmit={handleFormSubmit} className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="font-bold text-lg mb-4">Adicionar Novo Documento</h3>
      <div className="grid md:grid-cols-3 gap-4 items-end">
        <Input label="Título do Documento" type="text" placeholder="Ex: Contrato Aluguel Apto 101" value={newDocumentTitle} onChange={(e) => setNewDocumentTitle(e.target.value)} required />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de Contrato</label>
          <select value={contractType} onChange={(e) => setContractType(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white h-[50px]">
            <option value="locacao">Locação</option>
            <option value="servicos">Serviços</option>
            <option value="edital">Edital</option>
            <option value="outro">Outro</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Arquivo PDF</label>
          <input type="file" accept="application/pdf" onChange={handleFileSelect} required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
        </div>
      </div>
      <div className="mt-6 text-right">
        <Button type="submit" disabled={isSubmitting} className="h-auto">{isSubmitting ? 'Enviando...' : 'Enviar para Análise'}</Button>
      </div>
    </form>    
  </DashboardLayout>);
};

const AnalysisView = ({ currentContract, handleDownloadPdf, handleShare, handleAddReminder, setView, session, handleLogout }) => {
  if (!currentContract) return <UploadView />;
  
  // Acessa os dados da análise a partir da propriedade aninhada 'analysis_result'
  // e combina com os dados do documento principal.
  const data = { ...currentContract, ...currentContract.analysis_result };

  return (
    <DashboardLayout active="analysis" setView={setView} session={session} handleLogout={handleLogout} currentContract={currentContract}>
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
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => handleDownloadPdf(data.storage_path)} className="px-4 py-2 text-sm h-10"><Save className="h-4 w-4" /> Salvar PDF</Button>
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
                  <div key={idx} className="p-5 rounded-2xl border-l-4 border-blue-500 bg-blue-50/50 flex gap-4 items-start">
                    <div className="mt-1 p-2 bg-blue-100 text-blue-600 rounded-full shrink-0">
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <p className="text-gray-700 leading-relaxed">{rec.text}</p>
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
    </DashboardLayout>
  );
};

const ProfileView = ({ session, formData, setFormData, setView, handleLogout, handleProfileUpdate }) => {
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (event) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você precisa selecionar uma imagem para fazer o upload.');
      }

      const user = session.user;
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from('avatars') // Nome do bucket para fotos de perfil
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Atualiza os metadados do usuário com o caminho do novo avatar
      const { error: updateUserError } = await supabase.auth.updateUser({
        data: { avatar_url: filePath },
      });

      if (updateUserError) throw updateUserError;

      alert('Foto de perfil atualizada! Pode ser necessário recarregar a página para ver a alteração.');
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout active="profile" setView={setView} session={session} handleLogout={handleLogout}>
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Configurações da Conta</h2>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row items-center gap-8">
          <div className="relative group cursor-pointer">
             <div className="h-28 w-28 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 border-4 border-white shadow-lg overflow-hidden">
               <span className="text-4xl font-bold text-gray-300">{session?.user?.user_metadata?.full_name?.charAt(0) || 'U'}</span>
             </div>
             <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <Upload className="h-6 w-6 text-white" />
                </label>
                <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} className="hidden" />
             </div>
          </div>
          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{session?.user?.user_metadata?.full_name}</h2>
            <p className="text-gray-500 mb-4">{session?.user?.email}</p>
            <div className="flex justify-center md:justify-start gap-3">
              <Button variant="outline" className="text-gray-600 border-gray-300 hover:bg-gray-50 h-9 px-4 text-sm">Alterar Senha</Button>
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
          
          <div className="pt-6 border-t border-gray-100 flex justify-between items-center gap-3">
            <Button variant="danger" className="h-auto px-4 py-2 text-sm">Excluir Conta</Button>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setView('upload')}>Cancelar</Button>
              <Button onClick={handleProfileUpdate}>Salvar Alterações</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
  );
};

const HistoryView = ({ documentos, loading, handleAnalyseDocument, handleDeleteDocument, setView, session, handleLogout, currentPage, setCurrentPage, hasMore, searchTerm, setSearchTerm }) => (
  <DashboardLayout active="history" setView={setView} session={session} handleLogout={handleLogout}>
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Histórico de Análises</h2>
      <p className="text-gray-500">Consulte todos os seus documentos enviados e seus respectivos status.</p>
    </div>

    {/* Campo de Busca */}
    <div className="mb-6">
      <div className="relative">
        <Input type="text" placeholder="Buscar pelo título do documento..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
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

const DashboardView = ({ session, setView, handleLogout, dashboardData }) => (
  <DashboardLayout active="dashboard" setView={setView} session={session} handleLogout={handleLogout}>
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Olá, {session?.user?.user_metadata?.full_name?.split(' ')[0] || 'Usuário'} 👋</h2>
      <p className="text-gray-500">Este é o seu resumo geral de contratos.</p>
    </div>

    {!dashboardData ? (
      <div className="text-center py-16">Carregando dados do dashboard...</div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card Total de Contratos */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-bold text-gray-400 uppercase mb-3">Total de Contratos</p>
          <p className="text-5xl font-bold text-gray-900">{dashboardData.totalContracts}</p>
        </div>

        {/* Card Valor Total */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-bold text-gray-400 uppercase mb-3">Valor Agregado</p>
          <p className="text-3xl font-bold text-blue-600">{dashboardData.totalValue}</p>
        </div>

        {/* Card Total de Alertas */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-bold text-gray-400 uppercase mb-3">Alertas Encontrados</p>
          <p className="text-5xl font-bold text-red-500">{dashboardData.totalAlerts}</p>
        </div>

        {/* Card Próximo Vencimento (Placeholder) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-bold text-gray-400 uppercase mb-3">Próximo Vencimento</p>
          <p className="text-2xl font-bold text-gray-900">Contrato Apto 101</p>
          <p className="text-sm text-gray-500">em 3 meses</p>
        </div>
      </div>
    )}
  </DashboardLayout>
);

// --- MAIN APP COMPONENT ---
export default function App() {
  // Estado de Autenticação Real com Supabase
  const [session, setSession] = useState(null);
  const [view, setView] = useState('landing'); // landing, auth, profile, upload, analysis
  const [loading, setLoading] = useState(false);
  const [currentContract, setCurrentContract] = useState(null);
  
  // Estados para dados reais do Supabase
  const [documentos, setDocumentos] = useState([]);

  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const PAGE_SIZE = 5; // Define quantos itens por página

  // Estado para a busca
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Estado para o filtro de tipo
  const [typeFilter, setTypeFilter] = useState('all');

  // Estados para o Chat
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [isAiReplying, setIsAiReplying] = useState(false);

  // Estado para Notificações
  const [notifications, setNotifications] = useState([]);

  // Estado para os dados do Dashboard
  const [dashboardData, setDashboardData] = useState(null);

  // Auth State
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    birth: '',
    address: ''
  });

  // Gerenciamento de sessão do Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        setView('dashboard'); // Se já tem sessão, vai para o dashboard
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setView('landing'); // Se deslogar, volta para a landing page
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Efeito para abrir/fechar o chat
  useEffect(() => {
    setIsChatOpen(view === 'chat');
  }, [view]);

  // Efeito para debouncing da busca
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(0); // Reseta para a primeira página a cada nova busca
    }, 500); // Atraso de 500ms

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm, typeFilter]);

  // Efeito para buscar os documentos do usuário logado
  useEffect(() => {
    if (session) {
      fetchDocumentos(currentPage, debouncedSearchTerm, typeFilter); // Para a lista de histórico
      fetchDashboardData(); // Para os cards do dashboard
    }
  }, [session]);

  // Efeito para popular o formulário de perfil quando a view muda
  useEffect(() => {
    if (view === 'profile' && session) {
      setFormData({
        name: session.user.user_metadata?.full_name || '',
        email: session.user.email || '',
        phone: session.user.user_metadata?.phone || '',
        birth: session.user.user_metadata?.birth || '',
        address: session.user.user_metadata?.address || ''
      });
    }
  }, [view, session]);

  // Efeito para recarregar a lista de histórico quando a busca ou filtro mudam
  useEffect(() => {
    if (session) {
      fetchDocumentos(currentPage, debouncedSearchTerm, typeFilter);
    }
  }, [currentPage, debouncedSearchTerm, typeFilter]);

  // Função para buscar os dados agregados para o Dashboard
  async function fetchDashboardData() {
    const { data, error } = await supabase
      .from('documentos')
      .select('analysis_result');

    if (error) {
      console.error("Erro ao buscar dados para o dashboard:", error);
      return;
    }

    const totalContracts = data.length;
    let totalValue = 0;
    let totalAlerts = 0;

    data.forEach(doc => {
      if (doc.analysis_result) {
        const valueString = doc.analysis_result.summary?.main_value || 'R$ 0';
        const numericValue = parseFloat(valueString.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
        if (!isNaN(numericValue)) {
          totalValue += numericValue;
        }
        totalAlerts += doc.analysis_result.alerts?.length || 0;
      }
    });

    setDashboardData({ totalContracts, totalValue: `R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, totalAlerts });
  }

  // Função para buscar documentos no Supabase
  async function fetchDocumentos(page = 0, search = '', type = 'all') {
    try {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('documentos')
        .select('*', { count: 'exact' }) // Pede a contagem total de itens
        .order('created_at', { ascending: false })
        .range(from, to); // Busca apenas o intervalo da página atual

      // Adiciona o filtro de busca se um termo for fornecido
      if (search) {
        query = query.ilike('titulo', `%${search}%`);
      }

      // Adiciona o filtro de tipo se um tipo for fornecido
      if (type !== 'all') {
        query = query.eq('contract_type', type);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      if (data) {
        setDocumentos(data);
        // Verifica se existem mais páginas
        setHasMore(to < count - 1);
      }
    } catch (error) {
      console.error("Erro ao buscar documentos:", error.message);
    }
  }

  // Simulation Handlers
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!isLoginMode) {
        // Lógica de cadastro com Supabase
        const { user, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
            }
          }
        });
        if (error) throw error;
        alert('Cadastro realizado! Verifique seu e-mail para confirmar a conta.');
      } else {
        // Lógica de login com Supabase
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        // O onAuthStateChange vai detectar o login e mudar a view
      }
    } catch (error) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyseDocument = async (documento) => {
    // 1. Verifica se a análise já existe no histórico (no banco de dados)
    if (documento.analysis_result) {
      console.log("Carregando análise do histórico...");
      // Se existir, apenas define o contrato atual e muda a view, sem chamar a API
      setCurrentContract({ ...documento, analysisDate: new Date(documento.created_at).toLocaleDateString() });
      setView('analysis');
      return;
    }

    // 2. Se não houver histórico, continua com o processo de análise via API
    if (!documento.storage_path) {
      alert("Este documento não possui um arquivo PDF para ser analisado.");
      return;
    }

    setLoading(true);
    setView('upload'); // Garante que a view correta com o loader seja exibida

    try {
      // Chamada real para a Netlify Function
      const response = await fetch('/.netlify/functions/analyze-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storagePath: documento.storage_path, contractType: documento.contract_type }),
      });

      if (!response.ok) throw new Error(`Erro da API: ${response.statusText}`);

      const analysisResult = await response.json();

      // 3. Salva o resultado da análise no banco de dados para futuras consultas
      const { error: updateError } = await supabase
        .from('documentos')
        .update({ analysis_result: analysisResult })
        .eq('id', documento.id);

      if (updateError) throw updateError;

      setCurrentContract({ ...documento, analysis_result: analysisResult, analysisDate: new Date().toLocaleDateString() });
      setView('analysis');
    } catch (error) {
      console.error("Erro ao analisar o documento:", error.message);
      alert("Falha ao analisar o documento. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    // O onAuthStateChange vai cuidar de redirecionar para 'landing'
  };

  const handleDeleteDocument = async (documento) => {
    if (!window.confirm(`Tem certeza que deseja excluir o documento "${documento.titulo}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      // 1. Deleta o arquivo do Storage, se houver um caminho salvo.
      if (documento.storage_path) {
        const { error: storageError } = await supabase.storage.from('documentos').remove([documento.storage_path]);
        if (storageError) throw storageError;
      }

      // 2. Deleta o registro do banco de dados.
      const { error: dbError } = await supabase.from('documentos').delete().match({ id: documento.id });
      if (dbError) throw dbError;

      // 3. Atualiza a UI removendo o item do estado local.
      setDocumentos(documentos.filter(d => d.id !== documento.id));
    } catch (error) {
      console.error("Erro ao deletar documento:", error.message);
      alert("Não foi possível excluir o documento. Tente novamente.");
    }
  };

  const handleDownloadPdf = async (storagePath) => {
    try {
      const { data, error } = await supabase.storage
        .from('documentos')
        .createSignedUrl(storagePath, 60); // URL válida por 60 segundos

      if (error) throw error;

      // Abre a URL em uma nova aba para iniciar o download
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error("Erro ao gerar link para download:", error.message);
      alert("Não foi possível baixar o arquivo.");
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const { user } = session;

      // Prepara os dados a serem atualizados no `user_metadata`
      const updates = {
        data: { 
          full_name: formData.name,
          phone: formData.phone,
          birth: formData.birth,
          address: formData.address,
        },
      };

      const { error } = await supabase.auth.updateUser(updates);

      if (error) throw error;
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAddReminder = () => {
    const newNotification = {
      id: Date.now(),
      message: 'Lembrete adicionado com sucesso!',
    };
    setNotifications(prev => [...prev, newNotification]);
  };
  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleShare = async (title) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Análise do Contrato: ${title}`,
          text: `Veja a análise do meu contrato feita pelo TradutorLegal!`,
          url: window.location.href, // Compartilha a URL atual
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      alert('A função de compartilhar não é suportada neste navegador. Você pode copiar a URL manualmente.');
    }
  };

  const handleSendMessage = (message) => {
    // Adiciona a mensagem do usuário
    setChatMessages(prev => [...prev, { sender: 'user', text: message }]);
    setIsAiReplying(true);

    // Simula a resposta da IA
    setTimeout(() => {
      let aiResponse = "Desculpe, não encontrei informações sobre isso no contrato. Tente perguntar sobre 'multa', 'valor', 'prazo' ou 'reajuste'.";
      const lowerCaseMessage = message.toLowerCase();

      if (currentContract && currentContract.analysis_result) {
        const { summary, alerts, recommendations } = currentContract.analysis_result;

        if (lowerCaseMessage.includes('multa')) {
          const multaAlert = alerts.find(a => a.title.toLowerCase().includes('multa'));
          if (multaAlert) {
            aiResponse = `Sobre a multa: ${multaAlert.desc}`;
          }
        } else if (lowerCaseMessage.includes('valor') || lowerCaseMessage.includes('aluguel')) {
          if (summary.main_value) {
            aiResponse = `O valor principal identificado no contrato foi de ${summary.main_value}.`;
          }
        } else if (lowerCaseMessage.includes('prazo')) {
          if (summary.duration) {
            aiResponse = `A duração do contrato identificada foi de ${summary.duration}.`;
          }
        } else if (lowerCaseMessage.includes('reajuste')) {
            const reajusteAlert = alerts.find(a => a.title.toLowerCase().includes('reajuste'));
            if (reajusteAlert) {
              aiResponse = `Sobre o reajuste: ${reajusteAlert.desc}`;
            }
        } else if (lowerCaseMessage.includes('recomenda') || lowerCaseMessage.includes('sugest')) {
          if (recommendations && recommendations.length > 0) {
            const recommendationText = recommendations.map(rec => `• ${rec.text}`).join('\n');
            aiResponse = `Claro! Aqui estão as recomendações que identifiquei para este contrato:\n\n${recommendationText}`;
          }
        }
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
      setIsAiReplying(false);
    }, 1500);
  };

  const closeChat = () => {
    // Ao fechar o chat, volta para a tela de análise
    setView('analysis');
    // Opcional: Limpar o histórico do chat ao fechar
    // setChatMessages([]);
  };

  // --- RENDER CONTROL ---

  // Renderiza as views baseado na sessão do usuário
  if (!session) {
    return view === 'auth' ? (
      <AuthPage 
        isLoginMode={isLoginMode}
        setIsLoginMode={setIsLoginMode}
        formData={formData}
        setFormData={setFormData}
        handleAuth={handleAuth}
        loading={loading}
        setView={setView}
      />
    ) : (
      <LandingPage setView={setView} setIsLoginMode={setIsLoginMode} />
    );
  } else {
    // Usuário está logado
    return (
      <>
        {/* Área de Notificações */}
        <div className="fixed top-5 right-5 z-50 space-y-3">
          {notifications.map(n => (
            <Notification key={n.id} message={n.message} onDismiss={() => dismissNotification(n.id)} />
          ))}
        </div>

        {/* Modal do Chat */}
        <ChatModal isOpen={isChatOpen} onClose={closeChat} messages={chatMessages} onSendMessage={handleSendMessage} isReplying={isAiReplying} />

        {(() => {
          switch (view) {
            case 'dashboard':
              return (
                <DashboardView
                  session={session}
                  setView={setView}
                  handleLogout={handleLogout}
                  dashboardData={dashboardData}
                />
              );
            case 'upload': 
              return (
                <UploadView 
                  session={session}
                  loading={loading}
                  documentos={documentos}
                  handleAnalyseDocument={handleAnalyseDocument}
                  handleDeleteDocument={handleDeleteDocument}
                  fetchDocumentos={fetchDocumentos}
                  setView={setView}
                  handleLogout={handleLogout}
                />
              );
            case 'history':
              return (
                <HistoryView
                  documentos={documentos}
                  loading={loading}
                  handleAnalyseDocument={handleAnalyseDocument}
                  handleDeleteDocument={handleDeleteDocument}
                  setView={setView}
                  session={session}
                  handleLogout={handleLogout}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  hasMore={hasMore}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  typeFilter={typeFilter}
                  setTypeFilter={setTypeFilter}
                />
              );
            case 'analysis': 
              return (
                <AnalysisView 
                  currentContract={currentContract} 
                  handleDownloadPdf={handleDownloadPdf}
                  handleShare={handleShare}
                  handleAddReminder={handleAddReminder}
                  setView={setView}
                  session={session}
                  handleLogout={handleLogout}
                />
              );
            case 'profile': 
              return (
                <ProfileView 
                  session={session}
                  formData={formData}
                  setFormData={setFormData}
                  setView={setView}
                  handleLogout={handleLogout}
                  handleProfileUpdate={handleProfileUpdate}
                />
              );
            default: 
              return ( // Padrão para dashboard se logado
                  <UploadView 
                    session={session}
                    loading={loading}
                    documentos={documentos}
                    handleAnalyseDocument={handleAnalyseDocument}
                    handleDeleteDocument={handleDeleteDocument}
                    fetchDocumentos={fetchDocumentos}
                    setView={setView}
                    handleLogout={handleLogout}
                  />
                );
          }
        })()}
      </>
    );
  }
}