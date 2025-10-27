// src/app/page.js
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Package, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';
import PageHeader from '@/components/layout/Header';

const formatCurrency = (value) => {
  const num = parseFloat(value) || 0;
  return `R$ ${num.toFixed(2).replace('.', ',')}`;
};

export default function Home() {
  const [totalPares, setTotalPares] = useState(0);
  const [valorTotal, setValorTotal] = useState(0);
  const [dashboardData, setDashboardData] = useState({
    lowStockCount: 0,
    lotesHoje: 0,
    modelosAtivos: 0,
    alerts: [],
  });
  const [rankingVendidos, setRankingVendidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [epoca, setEpoca] = useState('normal');

  const fetchTotaisEOutros = async () => {
    setLoading(true);
    try {
      const produtosRes = await fetch('/api/produtos');
      if (!produtosRes.ok) {
        const errorText = await produtosRes.text();
        console.error('Erro ao buscar produtos:', produtosRes.status, errorText);
        throw new Error('Erro ao buscar totais');
      }
      const prodData = await produtosRes.json();
      setTotalPares(prodData.totalProdutos || 0);
      setValorTotal(prodData.valorTotalRevenda || 0);

      const url = epoca === 'pico' ? '/api/home?epoca=pico' : '/api/home';
      const homeRes = await fetch(url);
      if (!homeRes.ok) {
        const errorText = await homeRes.text();
        console.error('Erro ao buscar home:', homeRes.status, errorText);
        toast.error('Erro ao carregar dados da página inicial');
        setDashboardData({
          lowStockCount: 0,
          lotesHoje: 0,
          modelosAtivos: 0,
          alerts: [],
        });
        return;
      }
      const homeData = await homeRes.json();
      setDashboardData({
        lowStockCount: homeData.lowStockCount || 0,
        lotesHoje: homeData.lotesHoje || 0,
        modelosAtivos: homeData.modelosAtivos || 0,
        alerts: homeData.alerts || [],
      });
    } catch (err) {
      console.error('Erro geral:', err);
      toast.error('Erro ao carregar página inicial');
      setDashboardData({
        lowStockCount: 0,
        lotesHoje: 0,
        modelosAtivos: 0,
        alerts: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRankingVendidos = async () => {
    try {
      const res = await fetch('/api/vendas');
      if (!res.ok) throw new Error('Erro ao buscar ranking');
      const data = await res.json();
      setRankingVendidos(data.rankingModelos || []);
    } catch (err) {
      console.error('Erro ao carregar ranking de vendas:', err);
      toast.error('Erro ao carregar ranking de vendas');
    }
  };

  useEffect(() => {
    fetchTotaisEOutros();
    fetchRankingVendidos();
  }, [epoca]);

 // LOADING STATE - VERSÃO MINIMALISTA
if (loading) return (
  <div className="p-6 bg-gray-50 min-h-screen">
    {/* Header */}
    <div className="w-48 h-5 bg-gray-200 animate-pulse rounded mb-6"></div>
    
    {/* Toggle */}
    <div className="w-28 h-8 bg-gray-200 animate-pulse rounded mb-6"></div>

    {/* 5 Cards - SUPER COMPACTO */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white p-4 rounded-xl h-16 flex items-center gap-3">
          <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
          <div className="space-y-1 flex-1">
            <div className="w-12 h-2.5 bg-gray-200 rounded"></div>
            <div className="w-16 h-5 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>

    {/* Tabela - SUPER COMPACTA */}
    <div className="bg-white rounded-xl p-4">
      <div className="w-40 h-4 bg-gray-200 rounded mb-3"></div>
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-50 rounded animate-pulse"></div>
        ))}
      </div>
    </div>
  </div>
);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader title="Home" greeting="Bom dia! Visão Geral da Home" />

      {/* Toggle para época */}
      <div className="mb-4 text-gray-500">
        <label className="text-sm font-poppins text-gray-600 mr-2">Época:</label>
        <select
          value={epoca}
          onChange={(e) => setEpoca(e.target.value)}
          className="border border-gray-300 rounded-md p-2 font-poppins text-sm"
        >
          <option value="normal">Normal</option>
          <option value="pico">Pico (ex.: verão, volta às aulas)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 flex items-center gap-4 hover:shadow-lg transition-shadow">
          <div className="text-3xl">📦</div>
          <div>
            <p className="text-xs font-poppins text-gray-500">Pares Totais</p>
            <p className="text-2xl font-bold font-poppins text-gray-800">{totalPares.toLocaleString('pt-BR')}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 flex items-center gap-4 hover:shadow-lg transition-shadow">
          <DollarSign className="w-8 h-8 text-green-500" />
          <div>
            <p className="text-xs font-poppins text-gray-500">Valor Estoque</p>
            <p className="text-2xl font-bold font-poppins text-gray-800">{formatCurrency(valorTotal)}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 flex items-center gap-4 hover:shadow-lg transition-shadow">
          <AlertTriangle className="w-8 h-8 text-yellow-500" />
          <div>
            <p className="text-xs font-poppins text-gray-500">Baixo Estoque</p>
            <p className="text-2xl font-bold font-poppins text-gray-800">{dashboardData.lowStockCount}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 flex items-center gap-4 hover:shadow-lg transition-shadow">
          <Package className="w-8 h-8 text-blue-500" />
          <div>
            <p className="text-xs font-poppins text-gray-500">Lotes Hoje</p>
            <p className="text-2xl font-bold font-poppins text-gray-800">{dashboardData.lotesHoje}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 flex items-center gap-4 hover:shadow-lg transition-shadow">
          <TrendingUp className="w-8 h-8 text-purple-500" />
          <div>
            <p className="text-xs font-poppins text-gray-500">Modelos Ativos</p>
            <p className="text-2xl font-bold font-poppins text-gray-800">{dashboardData.modelosAtivos}</p>
          </div>
        </div>
      </div>

      {dashboardData.alerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-5 rounded-xl shadow-md mb-8">
          <h3 className="text-lg font-semibold font-poppins text-red-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Ações Urgentes
          </h3>
          <ul className="space-y-2">
            {dashboardData.alerts.map((alert, i) => (
              <li key={i} className="text-sm font-poppins text-red-700 flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                <span className={alert.message.includes('Sandálias Infantil') ? 'font-bold' : ''}>
                  {alert.message.includes('Sandálias Infantil') && '🔥 '}
                  {alert.message}
                </span>
                <button
                  onClick={() => toast.error('Funcionalidade "Ver Detalhes" ainda não implementada')}
                  className="text-xs underline hover:text-red-900 font-medium"
                >
                  Ver Detalhes
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold font-poppins text-gray-700 mb-4">Ranking de Modelos Mais Vendidos (Geral)</h3>
        {rankingVendidos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold font-poppins text-gray-600 uppercase tracking-wider">Modelo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold font-poppins text-gray-600 uppercase tracking-wider">Unidades Vendidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rankingVendidos.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-poppins text-gray-900">{item.modelo}</td>
                    <td className="px-4 py-3 text-sm font-poppins text-gray-900">{item.qtyVendida}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 font-poppins">Nenhum dado de vendas disponível.</p>
        )}
      </div>
    </div>
  );
}