import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

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

export default DashboardView;
