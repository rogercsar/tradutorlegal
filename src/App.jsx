import React, { useState, useEffect } from 'react';
import { 
  Shield, FileText, CheckCircle, AlertTriangle, Search, 
  Menu, X, User, Upload, ArrowRight, Lock, Save, Share2, 
  MessageSquare, FileCheck, DollarSign, Calendar, Home,
  Zap, Star, ChevronDown, Check
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
  const baseStyle = "px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5",
    secondary: "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50",
    outline: "border-2 border-white text-white hover:bg-white/10",
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
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input 
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
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
  const [formData, setFormData] = useState({
    name: 'Ana Silva',
    email: 'ana@exemplo.com',
    phone: '(11) 99999-9999',
    birth: '1995-05-20',
    address: 'Rua das Flores, 123 - SP'
  });

  // Simulation Handlers
  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setUser({ name: formData.name, email: formData.email });
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
    <div className="font-sans text-gray-900 scroll-smooth">
      {/* Hero */}
      <header className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white pb-24 pt-6 px-4 relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>

        <nav className="max-w-6xl mx-auto flex justify-between items-center mb-20 relative z-10">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <Shield className="h-8 w-8 text-green-400" />
            <span>Tradutor<span className="text-blue-200">Legal</span></span>
          </div>
          <div className="hidden md:flex gap-8 items-center">
            <a href="#funciona" className="hover:text-blue-200 transition-colors">Como Funciona</a>
            <a href="#exemplo" className="hover:text-blue-200 transition-colors">Exemplos</a>
            <a href="#planos" className="hover:text-blue-200 transition-colors">Planos</a>
            <button onClick={() => setView('auth')} className="bg-white text-blue-900 px-5 py-2 rounded-full font-bold hover:bg-blue-50 transition-colors">Entrar</button>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-800/50 backdrop-blur-sm rounded-full text-sm font-medium mb-8 border border-blue-500/30 text-blue-100">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> +10.000 contratos analisados este mês
          </span>
          <h1 className="text-4xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
            Pare de assinar <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-blue-200">sem entender.</span>
          </h1>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            A Inteligência Artificial que lê as letras miúdas, encontra multas abusivas e traduz o "juridiquês" para português claro em segundos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => setView('auth')} className="text-lg px-8 py-4 bg-green-500 hover:bg-green-600 border-none shadow-green-900/20">
              Analisar Contrato Grátis
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button variant="outline" onClick={() => document.getElementById('exemplo').scrollIntoView({ behavior: 'smooth' })}>
              Ver Exemplo Real
            </Button>
          </div>
          <p className="mt-6 text-sm text-blue-200 opacity-80 flex items-center justify-center gap-2">
            <Lock className="h-4 w-4" /> Seus dados são criptografados e deletados após a análise.
          </p>
        </div>
      </header>

      {/* Como Funciona */}
      <section id="funciona" className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Como funciona a mágica</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Não precisa de advogado. É simples como enviar uma foto no WhatsApp.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Linha conectora (Desktop only) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gray-100 -z-10"></div>

            <div className="bg-white p-6 text-center relative">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-sm">
                <Upload className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">1. Envie o PDF</h3>
              <p className="text-gray-500">Faça upload do seu contrato de aluguel, serviço ou edital. Aceitamos fotos também.</p>
            </div>

            <div className="bg-white p-6 text-center relative">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-sm">
                <Zap className="h-10 w-10 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">2. IA Analisa</h3>
              <p className="text-gray-500">Nossa tecnologia varre o documento procurando multas, prazos e armadilhas.</p>
            </div>

            <div className="bg-white p-6 text-center relative">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-sm">
                <FileCheck className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">3. Você Decide</h3>
              <p className="text-gray-500">Receba um relatório simples dizendo se é seguro assinar ou o que negociar.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Exemplo Prático */}
      <section id="exemplo" className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-blue-600 font-bold tracking-wider text-sm uppercase mb-2 block">O problema</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Você entende o que <br/>está assinando?
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Documentos legais são feitos para serem difíceis. Eles escondem obrigações financeiras pesadas atrás de palavras bonitas em latim. Nós somos o seu "tradutor".
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-green-100 p-1 rounded">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <strong className="text-gray-900 block">Identificação de Multas</strong>
                    <span className="text-gray-500">Calculamos o valor real que você pagaria se saísse antes.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-green-100 p-1 rounded">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <strong className="text-gray-900 block">Termos Abusivos</strong>
                    <span className="text-gray-500">Alertamos sobre cláusulas proibidas pelo Código do Consumidor.</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Card Visual de Comparação */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl opacity-20 blur-xl"></div>
              <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <span className="text-xs font-mono text-gray-400">analise_contrato.pdf</span>
                </div>
                
                <div className="p-6 md:p-8 space-y-6">
                  {/* O que o contrato diz */}
                  <div className="bg-red-50 border border-red-100 rounded-lg p-4 relative">
                    <span className="absolute -top-3 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded font-bold shadow-sm">Contrato Diz</span>
                    <p className="font-serif text-gray-600 italic text-sm line-through decoration-red-300">
                      "O locatário renuncia expressamente ao benefício de ordem previsto no artigo 827 do Código Civil..."
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <ArrowRight className="text-gray-400 rotate-90 md:rotate-0" />
                  </div>

                  {/* O que a IA diz */}
                  <div className="bg-green-50 border border-green-100 rounded-lg p-4 relative">
                    <span className="absolute -top-3 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded font-bold shadow-sm">O que significa</span>
                    <p className="font-medium text-gray-800">
                      ⚠️ <strong className="text-green-700">Risco para o Fiador:</strong> Isso significa que se você não pagar o aluguel, a imobiliária pode cobrar diretamente o seu fiador, sem nem tentar cobrar você primeiro.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Escolha o plano ideal</h2>
          <p className="text-gray-500 mb-12">Comece grátis. Pague apenas se precisar de análises aprofundadas.</p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <div className="border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Curioso</h3>
              <div className="text-4xl font-bold text-gray-900 mb-4">R$ 0<span className="text-base font-normal text-gray-500">/mês</span></div>
              <p className="text-gray-500 text-sm mb-8">Para quem quer testar ou tem apenas uma dúvida simples.</p>
              <ul className="text-left space-y-4 mb-8">
                <li className="flex gap-2 text-sm text-gray-600"><Check className="h-5 w-5 text-blue-600" /> 1 Análise Resumida</li>
                <li className="flex gap-2 text-sm text-gray-600"><Check className="h-5 w-5 text-blue-600" /> Detecção de Risco Básico</li>
                <li className="flex gap-2 text-sm text-gray-400"><X className="h-5 w-5" /> Sem Chat com IA</li>
              </ul>
              <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50" onClick={() => setView('auth')}>Começar Grátis</Button>
            </div>

            {/* Pro - Destaque */}
            <div className="border-2 border-blue-600 rounded-2xl p-8 shadow-xl relative transform md:-translate-y-4 bg-white">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                Mais Popular
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Protegido</h3>
              <div className="text-4xl font-bold text-gray-900 mb-4">R$ 29<span className="text-base font-normal text-gray-500">/mês</span></div>
              <p className="text-gray-500 text-sm mb-8">Para quem está alugando imóvel ou assinando contratos importantes.</p>
              <ul className="text-left space-y-4 mb-8">
                <li className="flex gap-2 text-sm text-gray-600"><Check className="h-5 w-5 text-green-500" /> 5 Análises Completas</li>
                <li className="flex gap-2 text-sm text-gray-600"><Check className="h-5 w-5 text-green-500" /> Chat Ilimitado com o Documento</li>
                <li className="flex gap-2 text-sm text-gray-600"><Check className="h-5 w-5 text-green-500" /> Geração de Contra-proposta</li>
                <li className="flex gap-2 text-sm text-gray-600"><Check className="h-5 w-5 text-green-500" /> Suporte Prioritário</li>
              </ul>
              <Button onClick={() => setView('auth')} className="w-full">Assinar Agora</Button>
            </div>

            {/* Enterprise */}
            <div className="border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Imobiliárias</h3>
              <div className="text-4xl font-bold text-gray-900 mb-4">Sob Consulta</div>
              <p className="text-gray-500 text-sm mb-8">API para integrar no seu sistema de gestão.</p>
              <ul className="text-left space-y-4 mb-8">
                <li className="flex gap-2 text-sm text-gray-600"><Check className="h-5 w-5 text-blue-600" /> Análises Ilimitadas</li>
                <li className="flex gap-2 text-sm text-gray-600"><Check className="h-5 w-5 text-blue-600" /> Whitelabel (Sua Marca)</li>
                <li className="flex gap-2 text-sm text-gray-600"><Check className="h-5 w-5 text-blue-600" /> API de Integração</li>
              </ul>
              <Button variant="ghost" className="w-full" onClick={() => window.open('mailto:comercial@tradutorlegal.com')}>Falar com Vendas</Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4 bg-gray-50 border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Perguntas Frequentes</h2>
          <div className="space-y-4">
            <details className="bg-white p-6 rounded-lg shadow-sm group cursor-pointer">
              <summary className="flex justify-between items-center font-bold text-gray-900 list-none">
                A plataforma substitui um advogado?
                <ChevronDown className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Não. O TradutorLegal é uma ferramenta informativa. Nós ajudamos você a entender o conteúdo e levantar bandeiras vermelhas, mas não oferecemos aconselhamento jurídico formal. Para casos complexos ou disputas judiciais, sempre consulte um advogado.
              </p>
            </details>
            <details className="bg-white p-6 rounded-lg shadow-sm group cursor-pointer">
              <summary className="flex justify-between items-center font-bold text-gray-900 list-none">
                Meus documentos ficam salvos?
                <ChevronDown className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Nós priorizamos sua privacidade. Seus documentos são processados e, por padrão, deletados dos nossos servidores após a análise, a menos que você escolha salvá-los no seu perfil seguro.
              </p>
            </details>
            <details className="bg-white p-6 rounded-lg shadow-sm group cursor-pointer">
              <summary className="flex justify-between items-center font-bold text-gray-900 list-none">
                Funciona com fotos de celular?
                <ChevronDown className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Sim! Nossa tecnologia OCR (Reconhecimento Óptico de Caracteres) consegue ler textos em fotos, desde que estejam nítidas e iluminadas.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 bg-blue-900 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para assinar com segurança?</h2>
          <p className="text-blue-200 mb-8 text-lg">Junte-se a milhares de pessoas que não têm mais medo de burocracia.</p>
          <Button onClick={() => setView('auth')} className="bg-green-500 hover:bg-green-600 text-white px-10 py-4 text-lg border-none shadow-xl">
            Criar Conta Grátis
          </Button>
        </div>
      </section>

      {/* Footer Completo */}
      <footer className="bg-gray-900 text-gray-400 py-16 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 text-xl font-bold text-white mb-4">
              <Shield className="h-6 w-6 text-green-400" />
              <span>Tradutor<span className="text-blue-400">Legal</span></span>
            </div>
            <p className="text-sm leading-relaxed">
              Democratizando o entendimento jurídico no Brasil. Tecnologia a serviço da clareza.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Produto</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#funciona" className="hover:text-blue-400">Como Funciona</a></li>
              <li><a href="#planos" className="hover:text-blue-400">Preços</a></li>
              <li><a href="#" className="hover:text-blue-400">Para Imobiliárias</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-blue-400">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-blue-400">Política de Privacidade</a></li>
              <li><a href="#" className="hover:text-blue-400">LGPD</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Contato</h4>
            <ul className="space-y-2 text-sm">
              <li>suporte@tradutorlegal.com</li>
              <li>Av. Paulista, 1000 - SP</li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 pt-8 border-t border-gray-800 text-center text-sm">
          <p>© 2024 Tradutor Legal. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );

  const AuthPage = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
        <div className="text-center mb-8">
          <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Bem-vindo de volta</h2>
          <p className="text-gray-500">Acesse seus documentos seguros</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <Input 
            label="Email" 
            type="email" 
            value={formData.email} 
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
          <Input 
            label="Senha" 
            type="password" 
            defaultValue="123456" 
          />
          <Button type="submit" className="w-full justify-center">
            {loading ? 'Carregando...' : 'Entrar na Plataforma'}
          </Button>
        </form>
        
        <button 
          onClick={() => setView('landing')} 
          className="mt-6 text-sm text-gray-500 hover:text-blue-600 w-full text-center"
        >
          Voltar para Home
        </button>
      </div>
    </div>
  );

  const DashboardLayout = ({ children, active = 'upload' }) => (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between h-auto md:h-screen sticky top-0">
        <div>
          <div className="flex items-center gap-2 font-bold text-xl text-blue-900 mb-10 cursor-pointer" onClick={() => setView('landing')}>
            <Shield className="text-blue-600" /> TradutorLegal
          </div>
          
          <nav className="space-y-2">
            <button 
              onClick={() => setView('upload')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${active === 'upload' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Upload className="h-5 w-5" /> Novo Contrato
            </button>
            <button 
              onClick={() => setView('analysis')}
              disabled={!currentContract}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${active === 'analysis' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 disabled:opacity-50'}`}
            >
              <FileCheck className="h-5 w-5" /> Última Análise
            </button>
            <button 
              onClick={() => setView('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${active === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <User className="h-5 w-5" /> Meu Perfil
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
              {user?.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{user?.name}</p>
              <button onClick={() => setView('landing')} className="text-xs text-gray-500 hover:text-red-500">Sair</button>
            </div>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );

  const UploadView = () => (
    <DashboardLayout active="upload">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">O que vamos analisar hoje?</h2>
        <p className="text-gray-500 mb-8">Selecione o tipo de documento para uma análise mais precisa.</p>

        {loading ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center animate-pulse">
            <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Analisando cláusulas...</h3>
            <p className="text-gray-500 mt-2">Estamos caçando multas e traduzindo o juridiquês.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Tipo 1 */}
            <button 
              onClick={() => handleUpload('rent')}
              className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left"
            >
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                <Home className="h-6 w-6 text-orange-600 group-hover:text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Contrato de Aluguel</h3>
              <p className="text-sm text-gray-500 mt-2">Ideal para inquilinos. Verifica reajustes (IGPM/IPCA), multas de saída e garantias.</p>
            </button>

            {/* Tipo 2 */}
            <button 
              onClick={() => handleUpload('service')}
              className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left"
            >
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                <FileText className="h-6 w-6 text-purple-600 group-hover:text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Prestação de Serviços</h3>
              <p className="text-sm text-gray-500 mt-2">Para freelancers e contratantes. Verifica prazos, entregas e rescisão.</p>
            </button>
            
            {/* Dropzone visual */}
            <div className="md:col-span-2 border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:bg-gray-50 cursor-pointer">
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
              <p className="font-medium text-gray-900">Ou arraste qualquer PDF aqui</p>
              <p className="text-sm text-gray-500">Suporta .PDF, .DOCX até 10MB</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );

  const AnalysisView = () => {
    if (!currentContract) return <UploadView />;
    const data = currentContract;

    return (
      <DashboardLayout active="analysis">
        <header className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold uppercase tracking-wider text-gray-400">Análise Concluída</span>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">PDF Processado</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Resumo do Contrato</h2>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="px-4 py-2 text-sm"><Save className="h-4 w-4" /> Salvar</Button>
            <Button variant="secondary" className="px-4 py-2 text-sm"><Share2 className="h-4 w-4" /> Compartilhar</Button>
          </div>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Score de Segurança</p>
            <div className="flex items-center gap-2">
              <span className={`text-3xl font-bold ${data.summary.score > 70 ? 'text-green-600' : 'text-yellow-600'}`}>
                {data.summary.score}/100
              </span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Valor Principal</p>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <span className="text-2xl font-bold text-gray-900">{data.summary.main_value}</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Prazo / Duração</p>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span className="text-2xl font-bold text-gray-900">{data.summary.duration}</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl shadow-lg text-white">
            <p className="text-blue-200 text-sm mb-2">Dúvidas?</p>
            <p className="font-bold mb-4">Pergunte à IA sobre este contrato.</p>
            <button className="bg-white/20 hover:bg-white/30 w-full py-2 rounded text-sm font-semibold backdrop-blur-sm transition-colors">
              Iniciar Chat
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Coluna Esquerda: Riscos e Pontos Positivos */}
          <div className="md:col-span-2 space-y-6">
            <h3 className="font-bold text-xl text-gray-800">🚦 Semáforo de Riscos</h3>
            
            {data.alerts.map((alert, idx) => (
              <div key={idx} className={`p-6 rounded-xl border-l-4 shadow-sm flex gap-4 items-start bg-white
                ${alert.type === 'danger' ? 'border-red-500' : alert.type === 'warning' ? 'border-yellow-500' : 'border-green-500'}`}>
                <div className={`mt-1 p-2 rounded-full ${alert.type === 'danger' ? 'bg-red-100 text-red-600' : alert.type === 'warning' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                   {alert.type === 'danger' ? <AlertTriangle className="h-5 w-5" /> : alert.type === 'warning' ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{alert.title}</h4>
                  <p className="text-gray-600 mt-1">{alert.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Coluna Direita: Glossário */}
          <div className="space-y-6">
            <h3 className="font-bold text-xl text-gray-800">🧠 Tradutor de Termos</h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
              {data.terms.map((item, idx) => (
                <div key={idx} className="p-4">
                  <p className="font-bold text-blue-800 text-sm mb-1 cursor-help underline decoration-dotted">{item.term}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.meaning}</p>
                </div>
              ))}
            </div>
            
            <div className="bg-gray-100 rounded-xl p-6">
              <h4 className="font-bold text-gray-800 mb-2">Checklist Sugerido</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" className="rounded text-blue-600" />
                  Negociar índice de reajuste
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" className="rounded text-blue-600" />
                  Reconhecer firma em cartório
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" className="rounded text-blue-600" />
                  Enviar comprovante de renda
                </li>
              </ul>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  };

  const ProfileView = () => (
    <DashboardLayout active="profile">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex items-center gap-6">
          <div className="h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 relative group cursor-pointer overflow-hidden">
             {/* Simulação de Foto */}
             <User className="h-10 w-10" />
             <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="text-white text-xs">Alterar</span>
             </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Meu Perfil</h2>
            <p className="text-gray-500">Gerencie seus dados pessoais</p>
          </div>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Nome Completo" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            <Input label="Email" value={formData.email} disabled className="bg-gray-50 cursor-not-allowed" />
            <Input label="Telefone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            <Input label="Data de Nascimento" type="date" value={formData.birth} onChange={(e) => setFormData({...formData, birth: e.target.value})} />
          </div>
          <Input label="Endereço Completo" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
          
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="secondary">Cancelar</Button>
            <Button>Salvar Alterações</Button>
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