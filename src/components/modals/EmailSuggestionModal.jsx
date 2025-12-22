import React from 'react';
import { Mail, X } from 'lucide-react';
import Button from '../ui/Button';

const EmailSuggestionModal = ({ isOpen, onClose, emailText }) => {
    if (!isOpen) return null;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(emailText).then(() => {
            alert('Texto copiado para a área de transferência!');
        }, (err) => {
            console.error('Erro ao copiar texto: ', err);
            alert('Falha ao copiar o texto.');
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Mail className="h-5 w-5 text-blue-600" />
                        Sugestão de E-mail para Negociação
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><X className="h-5 w-5 text-gray-500" /></button>
                </header>
                <main className="p-6">
                    <p className="text-sm text-gray-500 mb-4">Você pode copiar o texto abaixo e adaptá-lo para enviar ao locador ou prestador de serviço.</p>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap font-mono max-h-[40vh] overflow-y-auto">
                        {emailText}
                    </div>
                </main>
                <footer className="p-4 border-t border-gray-200 flex justify-end gap-3">
                    <Button variant="secondary" onClick={onClose}>Fechar</Button>
                    <Button onClick={copyToClipboard}>Copiar Texto</Button>
                </footer>
            </div>
        </div>
    );
};

export default EmailSuggestionModal;
