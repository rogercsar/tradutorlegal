import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

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

export default Notification;
