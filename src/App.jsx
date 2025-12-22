import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Components
import Notification from './components/ui/Notification';
import ChatModal from './components/modals/ChatModal';
import EmailSuggestionModal from './components/modals/EmailSuggestionModal';

// Views
import LandingPage from './views/LandingPage';
import AuthPage from './views/AuthPage';
import DashboardView from './views/DashboardView';
import UploadView from './views/UploadView';
import AnalysisView from './views/AnalysisView';
import HistoryView from './views/HistoryView';
import ProfileView from './views/ProfileView';
import ClausesView from './views/ClausesView';
import ComparisonView from './views/ComparisonView';

export default function App() {
  // Estado de Autenticação Real com Supabase
  const [session, setSession] = useState(null);
  const [view, setView] = useState('landing'); // landing, auth, profile, upload, analysis
  const [loading, setLoading] = useState(false);
  const [currentContract, setCurrentContract] = useState(null);

  // Estados para dados reais do Supabase
  const [documentos, setDocumentos] = useState([]);
  const [allDocumentos, setAllDocumentos] = useState([]); // Novo estado para a lista completa

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

  // Estados para o Modal de Sugestão de E-mail
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSuggestion, setEmailSuggestion] = useState('');

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
      setCurrentPage(0); // Reseta para a primeira página a cada nova busca ou filtro
    }, 500); // Atraso de 500ms

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm, typeFilter]);

  // Efeito para buscar os documentos do usuário logado
  useEffect(() => {
    if (session) {
      if (view === 'history') fetchDocumentos(currentPage, debouncedSearchTerm, typeFilter);
      if (view === 'dashboard') fetchDashboardData();
      if (view === 'comparison') fetchAllDocuments();
    }
  }, [session, view, currentPage, debouncedSearchTerm, typeFilter]);

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

    setDashboardData({
      totalContracts,
      totalValue: `R$ ${totalValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      totalAlerts,
    });
  }

  // Função para buscar TODOS os documentos (para o comparador)
  async function fetchAllDocuments() {
    try {
      const { data, error } = await supabase
        .from('documentos')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAllDocumentos(data || []);
    } catch (error) { console.error("Erro ao buscar todos os documentos:", error); }
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
      }
    } catch (error) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyseDocument = async (documento) => {
    if (documento.analysis_result) {
      console.log("Carregando análise do histórico...");
      setCurrentContract({ ...documento, analysisDate: new Date(documento.created_at).toLocaleDateString() });
      setView('analysis');
      return;
    }

    if (!documento.storage_path) {
      alert("Este documento não possui um arquivo PDF para ser analisado.");
      return;
    }

    setLoading(true);
    setView('upload');

    try {
      const response = await fetch('/.netlify/functions/analyze-contract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          storagePath: documento.storage_path,
          contractType: documento.contract_type,
          documentId: documento.id
        }),
      });

      if (!response.ok) throw new Error(`Erro da API: ${response.statusText}`);

      const analysisResult = await response.json();

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
  };

  const handleReanalyze = async (documento) => {
    if (!window.confirm(`Tem certeza que deseja re-analisar o documento "${documento.titulo}"? A análise anterior será perdida e uma nova será gerada com as regras mais recentes.`)) {
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('documentos')
        .update({ analysis_result: null })
        .eq('id', documento.id);

      if (updateError) throw updateError;

      const updatedDocumento = { ...documento, analysis_result: null };
      await handleAnalyseDocument(updatedDocumento);
    } catch (error) {
      console.error("Erro ao solicitar reanálise:", error.message);
      alert("Não foi possível iniciar a reanálise.");
    }
  };

  const handleDeleteDocument = async (documento) => {
    if (!window.confirm(`Tem certeza que deseja excluir o documento "${documento.titulo}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      if (documento.storage_path) {
        const { error: storageError } = await supabase.storage.from('documentos').remove([documento.storage_path]);
        if (storageError) throw storageError;
      }

      const { error: dbError } = await supabase.from('documentos').delete().match({ id: documento.id });
      if (dbError) throw dbError;

      setDocumentos(documentos.filter(d => d.id !== documento.id));
    } catch (error) {
      console.error("Erro ao deletar documento:", error.message);
      alert("Não foi possível excluir o documento. Tente novamente.");
    }
  };

  const handleDownloadPdf = async (documentTitle) => {
    const reportElement = document.getElementById('analysis-report-content');
    if (!reportElement) {
      alert("Não foi possível encontrar o conteúdo da análise para gerar o PDF.");
      return;
    }

    try {
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Analise-${documentTitle.replace(/\s+/g, '-')}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF da análise:", error);
      alert("Ocorreu um erro ao gerar o PDF da análise.");
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const { user } = session;
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

  const handleDeleteAccount = async () => {
    if (!window.confirm("Você tem certeza absoluta? Essa ação é irreversível.")) {
      return;
    }
    // In a real app, you would call a cloud function to delete the user from Supabase Auth and Database
    alert("Funcionalidade de exclusão de conta deve ser implementada via Backend (Admin API).");
  };

  const handleShare = async (title) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Análise do Contrato: ${title}`,
          text: `Veja a análise do meu contrato feita pelo TradutorLegal!`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link da análise copiado para a área de transferência!');
      } catch (err) {
        alert('Não foi possível copiar o link.');
      }
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

  const handleSendMessage = (message) => {
    setChatMessages(prev => [...prev, { sender: 'user', text: message }]);
    setIsAiReplying(true);

    setTimeout(() => {
      setChatMessages(prev => [...prev, { sender: 'ai', text: `Entendi sua dúvida sobre "${message}". O contrato diz que...` }]);
      setIsAiReplying(false);
    }, 2000);
  };

  const handleGenerateEmail = (recommendation) => {
    setEmailSuggestion(`Prezado(a),\n\nGostaria de discutir o seguinte ponto: ${recommendation.text}\n\nProponho que...`);
    setIsEmailModalOpen(true);
  };

  const handleSaveClause = async (type, title, text) => {
    try {
      const { user } = session;
      const { error } = await supabase
        .from('saved_clauses')
        .insert({
          user_id: user.id,
          document_id: currentContract?.id,
          document_title: currentContract?.titulo,
          clause_type: type,
          clause_title: title,
          clause_text: text
        });

      if (error) throw error;

      const newNotification = {
        id: Date.now(),
        message: 'Cláusula salva com sucesso!',
      };
      setNotifications(prev => [...prev, newNotification]);

    } catch (error) {
      console.error("Erro ao salvar cláusula:", error);
      alert("Erro ao salvar. Tente novamente.");
    }
  };

  const handleDeleteClause = async (id) => {
    if (!window.confirm("Remover dos itens salvos?")) return;
    try {
      const { error } = await supabase
        .from('saved_clauses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Force refresh logic would go here, but ClausesView handles fetching on mount.
      // A mechanism to refresh ClausesView would be better (context or refetch trigger)
      // For now we'll rely on the view reloading when permitted.
      alert("Cláusula removida.");
    } catch (err) {
      console.error(err);
    }
  }

  // Router simplificado
  const renderView = () => {
    switch (view) {
      case 'landing':
        return <LandingPage setView={setView} setIsLoginMode={setIsLoginMode} />;
      case 'auth':
        return <AuthPage isLoginMode={isLoginMode} setIsLoginMode={setIsLoginMode} formData={formData} setFormData={setFormData} handleAuth={handleAuth} loading={loading} setView={setView} />;
      case 'dashboard':
        return <DashboardView session={session} setView={setView} handleLogout={handleLogout} dashboardData={dashboardData} />;
      case 'upload':
        return <UploadView session={session} loading={loading} documentos={documentos} handleAnalyseDocument={handleAnalyseDocument} handleDeleteDocument={handleDeleteDocument} fetchDocumentos={fetchDocumentos} setView={setView} handleLogout={handleLogout} />;
      case 'analysis':
        return <AnalysisView currentContract={currentContract} handleDownloadPdf={handleDownloadPdf} handleShare={handleShare} handleAddReminder={handleAddReminder} handleReanalyze={handleReanalyze} handleSaveClause={handleSaveClause} handleGenerateEmail={handleGenerateEmail} setView={setView} session={session} handleLogout={handleLogout} />;
      case 'history':
        return <HistoryView documentos={documentos} loading={loading} handleAnalyseDocument={handleAnalyseDocument} handleDeleteDocument={handleDeleteDocument} setView={setView} session={session} handleLogout={handleLogout} currentPage={currentPage} setCurrentPage={setCurrentPage} hasMore={hasMore} searchTerm={searchTerm} setSearchTerm={setSearchTerm} typeFilter={typeFilter} setTypeFilter={setTypeFilter} />;
      case 'clauses':
        return <ClausesView session={session} setView={setView} handleLogout={handleLogout} handleGenerateEmail={handleGenerateEmail} handleDeleteClause={handleDeleteClause} />;
      case 'comparison':
        return <ComparisonView documentos={allDocumentos} setView={setView} session={session} handleLogout={handleLogout} />;
      case 'profile':
        return <ProfileView session={session} formData={formData} setFormData={setFormData} setView={setView} handleLogout={handleLogout} handleProfileUpdate={handleProfileUpdate} handleDeleteAccount={handleDeleteAccount} />;
      default:
        return <LandingPage setView={setView} setIsLoginMode={setIsLoginMode} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {renderView()}

      {/* Notificações Toast */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            message={notification.message}
            onDismiss={() => dismissNotification(notification.id)}
          />
        ))}
      </div>

      {/* Chat Bot */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setView('analysis')} // Volta para a análise
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        isReplying={isAiReplying}
      />

      {/* Modal de Sugestão de Email */}
      <EmailSuggestionModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        emailText={emailSuggestion}
      />
    </div>
  );
}