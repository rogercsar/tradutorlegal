import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { supabase } from '../supabaseClient';

const ProfileView = ({ session, formData, setFormData, setView, handleLogout, handleProfileUpdate, handleDeleteAccount }) => {
    const [uploading, setUploading] = useState(false);

    // Constrói a URL pública para o avatar do usuário
    const avatarUrl = session?.user?.user_metadata?.avatar_url
        ? supabase.storage.from('avatars').getPublicUrl(session.user.user_metadata.avatar_url).data.publicUrl
        : null;

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
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar do usuário" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-bold text-gray-300">{session?.user?.user_metadata?.full_name?.charAt(0) || 'U'}</span>
                                )}
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

                    <div className="p-8 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Nome Completo" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            <Input label="Email Principal" value={formData.email} disabled className="bg-gray-50 cursor-not-allowed opacity-70" />
                            <Input label="Telefone / WhatsApp" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                            <Input label="Data de Nascimento" type="date" value={formData.birth} onChange={(e) => setFormData({ ...formData, birth: e.target.value })} />
                        </div>
                        <Input label="Endereço Completo" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />

                        <div className="pt-6 border-t border-gray-100 flex justify-between items-center gap-3">
                            <Button variant="danger" onClick={handleDeleteAccount} className="h-auto px-4 py-2 text-sm">Excluir Conta</Button>
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

export default ProfileView;
