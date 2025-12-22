import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import Button from '../ui/Button';

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

export default ChatModal;
