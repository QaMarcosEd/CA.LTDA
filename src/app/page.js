'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, Package, AlertTriangle, DollarSign, Box, TrendingUp } from 'lucide-react';
import ModalCadastroLoteCalçados from '@/components/ui/modals/ModalCadastroLoteCalcados';

const formatCurrency = (value) => {
  const num = parseFloat(value) || 0;
  return `R$ ${num.toFixed(2).replace('.', ',')}`;
};

export default function DashboardPage() {
  const [totalPares, setTotalPares] = useState(0);
  const [valorTotal, setValorTotal] = useState(0);
  const [dashboardData, setDashboardData] = useState({
    lowStockCount: 0,
    lotesHoje: 0,
    modelosAtivos: 0,
    alerts: [],
    estoquePorGenero: [],
    topModelos: [],
  });
  const [rankingVendidos, setRankingVendidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [epoca, setEpoca] = useState('normal'); // Novo estado para época
  const [loteModalOpen, setLoteModalOpen] = useState(false);

  const refreshDashboard = async () => {
    await fetchTotaisEOutros();
    await fetchRankingVendidos();
  };

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
          estoquePorGenero: [],
          topModelos: [],
        });
        return;
      }
      const homeData = await homeRes.json();
      setDashboardData({
        lowStockCount: homeData.lowStockCount || 0,
        lotesHoje: homeData.lotesHoje || 0,
        modelosAtivos: homeData.modelosAtivos || 0,
        alerts: homeData.alerts || [],
        estoquePorGenero: homeData.estoquePorGenero || [],
        topModelos: homeData.topModelos || [],
      });
    } catch (err) {
      console.error('Erro geral:', err);
      toast.error('Erro ao carregar página inicial');
      setDashboardData({
        lowStockCount: 0,
        lotesHoje: 0,
        modelosAtivos: 0,
        alerts: [],
        estoquePorGenero: [],
        topModelos: [],
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

  const handleSubmitLote = async (data) => {
    try {
      const response = await fetch('/api/produtos/lote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.status === 201) {
        toast.success('Lote adicionado com sucesso!');
        setLoteModalOpen(false);
        await refreshDashboard();
      } else {
        toast.error(result.error || 'Erro ao adicionar lote');
      }
      return { status: response.status, data: result };
    } catch (error) {
      toast.error('Erro inesperado');
      console.error(error);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
        <span className="ml-3 text-gray-600 font-poppins">Carregando dashboard...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h2 className="text-2xl font-bold font-poppins text-gray-800 mb-2 flex items-center gap-2">
          <span className="text-3xl">Dashboard</span> Bom dia! Visão Geral do Estoque
        </h2>
        <p className="text-sm font-poppins text-gray-600">Atualizado em {format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold font-poppins text-gray-700 mb-4">Estoque por Gênero</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData.estoquePorGenero}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dashboardData.estoquePorGenero.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold font-poppins text-gray-700 mb-4">Top 5 Modelos em Estoque</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.topModelos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantidade" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setLoteModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-4 rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md font-poppins text-sm md:text-base"
        >
          <span className="text-xl">➕</span> Adicionar Lote
        </button>
        <button className="bg-purple-600 text-white px-6 py-4 rounded-xl font-medium hover:bg-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md font-poppins text-sm md:text-base">
          <span className="text-xl">📄</span> Gerar Relatório
        </button>
      </div>

      <ModalCadastroLoteCalçados
        isOpen={loteModalOpen}
        onClose={() => setLoteModalOpen(false)}
        onSubmit={handleSubmitLote}
      />
    </div>
  );
}