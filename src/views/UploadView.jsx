import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { supabase } from '../supabaseClient';

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
        if (!newDocumentTitle.trim() || !uploadingFile) {
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 items-end">
                    <Input label="Título do Documento" type="text" placeholder="Ex: Contrato Aluguel Apto 101" value={newDocumentTitle} onChange={(e) => setNewDocumentTitle(e.target.value)} required />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de Contrato</label>
                        <select value={contractType} onChange={(e) => setContractType(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white h-[50px]">
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Arquivo PDF</label>
                        <input type="file" accept="application/pdf" onChange={handleFileSelect} required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    </div>
                </div>
                <div className="mt-6 text-right">
                    <Button type="submit" disabled={isSubmitting} className="h-auto">{isSubmitting ? 'Enviando...' : 'Enviar para Análise'}</Button>
                </div>
            </form>
        </DashboardLayout>);
};

export default UploadView;
