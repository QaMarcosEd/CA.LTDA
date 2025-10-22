'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, AlertTriangle, DollarSign, Box, TrendingUp, CreditCard, Zap } from 'lucide-react';
import PageHeader from '@/components/Header';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [produtos, setProdutos] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProdutos, setTotalProdutos] = useState(0);
  const [valorTotalRevenda, setValorTotalRevenda] = useState(0);
  const [custoTotalEstoque, setCustoTotalEstoque] = useState(0);
  const [lucroProjetado, setLucroProjetado] = useState(0);
  const [margemLucro, setMargemLucro] = useState('0%');
  const [resumoVendas, setResumoVendas] = useState({ totalQuitado: 0, totalPendente: 0 });
  const [dashboardData, setDashboardData] = useState({
    lowStockCount: 0,
    lotesHoje: 0,
    modelosAtivos: 0,
    alerts: [],
    estoquePorGenero: [],
    topModelos: [],
  });
  const [rankingVendidos, setRankingVendidos] = useState([]);
  const [taxasCartao, setTaxasCartao] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [epoca, setEpoca] = useState('normal');

  const limit = 10;

  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return `R$ ${num.toFixed(2).replace('.', ',')}`;
  };

  // TODAS AS FUNÇÕES FETCH - IGUAIS ÀS SUAS
  const fetchResumoVendas = async () => {
    try {
      const res = await fetch('/api/vendas?resumo=true');
      if (!res.ok) throw new Error('Erro ao buscar resumo de vendas');
      const data = await res.json();
      setResumoVendas(data.resumo || { totalQuitado: 0, totalPendente: 0 });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProdutos = async (pg = 1) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      query.append('page', pg);
      query.append('limit', limit);

      const res = await fetch(`/api/produtos?${query.toString()}`);
      if (!res.ok) throw new Error('Erro ao buscar produtos');
      const data = await res.json();
      setProdutos(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotalProdutos(data.totalProdutos || 0);
      setValorTotalRevenda(parseFloat(data.valorTotalRevenda) || 0);
      setCustoTotalEstoque(parseFloat(data.custoTotalEstoque) || 0);
      setLucroProjetado(parseFloat(data.lucroProjetado) || 0);
      setMargemLucro(data.margemLucro || '0%');
    } catch (err) {
      console.error('Erro no fetchProdutos:', err);
      setError('Erro ao carregar produtos');
      setProdutos([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const url = epoca === 'pico' ? '/api/home?epoca=pico' : '/api/home';
      const homeRes = await fetch(url);
      if (!homeRes.ok) {
        const errorText = await homeRes.text();
        console.error('Erro ao buscar home:', homeRes.status, errorText);
        throw new Error('Erro ao buscar dados do dashboard');
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
      toast.error('Erro ao carregar dados do dashboard');
      setDashboardData({
        lowStockCount: 0,
        lotesHoje: 0,
        modelosAtivos: 0,
        alerts: [],
        estoquePorGenero: [],
        topModelos: [],
      });
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

  const fetchTaxasCartao = async () => {
    try {
      const res = await fetch('/api/taxas-cartao');
      if (!res.ok) throw new Error('Erro ao buscar taxas de cartão');
      const data = await res.json();
      setTaxasCartao(data);
    } catch (err) {
      console.error('Erro ao carregar taxas de cartão:', err);
      setTaxasCartao([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchProdutos(page), fetchResumoVendas(), fetchDashboardData(), fetchRankingVendidos(), fetchTaxasCartao()]);
    };
    fetchData();
  }, [page, epoca]);

  const COLORS = ['#394189', '#c33638', '#10B981', '#F59E0B'];

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
      <div className="w-64 h-4 bg-gray-300 animate-pulse rounded"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-48 h-32 bg-gray-300 animate-pulse rounded"></div>
        ))}
      </div>
      <div className="w-full h-64 bg-gray-300 animate-pulse rounded"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-lg font-medium text-red-600">{error}</p>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader title="Dashboard" greeting="👟 Visão Geral - Calçados Araújo" />

      {/* TOGGLE ÉPOCA - SIMPLES */}
      <div className="mb-4">
        <label className="text-sm font-semibold text-[#394189] mr-2">Época:</label>
        <select
          value={epoca}
          onChange={(e) => setEpoca(e.target.value)}
          className="border border-[#394189]/20 rounded-lg p-2 focus:ring-2 focus:ring-[#394189] bg-white text-gray-500"
        >
          <option value="normal">Normal</option>
          <option value="pico">🔥 Pico de Vendas</option>
        </select>
      </div>

      {/* CARDS - SUA ESTRUTURA ORIGINAL */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-8">
  {[
    { icon: Package, label: 'Pares Totais', value: totalProdutos.toLocaleString('pt-BR'), color: '#394189' },
    { icon: DollarSign, label: 'Valor Estoque', value: formatCurrency(valorTotalRevenda), color: '#c33638' },
    { icon: AlertTriangle, label: 'Baixo Estoque', value: dashboardData.lowStockCount, color: '#F59E0B' },
    { icon: Box, label: 'Lotes Hoje', value: dashboardData.lotesHoje, color: '#10B981' },
    { icon: TrendingUp, label: 'Modelos Ativos', value: dashboardData.modelosAtivos, color: '#8B5CF6' },
  ].map((card, i) => (
    <div 
      key={i}
      className="group relative bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden h-24 flex items-center justify-between"
    >
      {/* BARRA LATERAL SUBTIL */}
      <div 
        className="absolute left-0 top-0 h-full w-0.5"
        style={{ backgroundColor: card.color }}
      ></div>
      
      {/* ÍCONE COMPACTO */}
      <div className="relative flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-white to-gray-50 flex items-center justify-center shadow-sm border border-gray-100">
        <card.icon className={`w-5 h-5`} style={{ color: card.color }} />
      </div>
      
      {/* INFORMAÇÕES ALINHADAS */}
      <div className="flex-1 ml-3 pr-2">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          {card.label}
        </p>
        <p className="text-lg font-bold text-gray-900 truncate">
          {card.value}
        </p>
      </div>
      
      {/* ÍCONE SETA PEQUENO */}
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <TrendingUp className={`w-3.5 h-3.5`} style={{ color: card.color }} />
      </div>
    </div>
  ))}
</div>

      {/* ALERTS - SUA ESTRUTURA */}
      {dashboardData.alerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-5 rounded-xl shadow-md mb-8">
          <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Ações Urgentes
          </h3>
          <ul className="space-y-2">
            {dashboardData.alerts.map((alert, i) => (
              <li key={i} className="text-sm text-red-700 flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                <span className={alert.message.includes('Sandálias Infantil') ? 'font-bold' : ''}>
                  {alert.message.includes('Sandálias Infantil') && '🔥 '}
                  {alert.message}
                </span>
                <button className="text-xs underline hover:text-red-900 font-medium">Ver Detalhes</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* GRÁFICOS - SUA ESTRUTURA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-[#394189] mb-4">Estoque por Gênero</h3>
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
          <h3 className="text-lg font-semibold text-[#c33638] mb-4">Top 5 Modelos em Estoque</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.topModelos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantidade" fill="#394189" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RANKING VENDIDOS - SUA ESTRUTURA */}
      <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-[#394189] mb-4">Ranking de Modelos Mais Vendidos</h3>
        {rankingVendidos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Modelo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Unidades Vendidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rankingVendidos.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">{item.modelo}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.qtyVendida}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center">Nenhum dado de vendas disponível.</p>
        )}
      </div>

      {/* TAXAS CARTÃO - SUA ESTRUTURA */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-[#394189] mb-4">Taxas de Cartão Ativas</h2>
        {taxasCartao.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {['VISA', 'MASTERCARD', 'ELO'].map((bandeira) => {
              const taxasBandeira = taxasCartao.filter((t) => t.bandeira === bandeira);
              return (
                <div key={bandeira} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-md font-semibold text-[#394189] mb-2">{bandeira}</h3>
                  <ul className="space-y-2">
                    {taxasBandeira.map((taxa) => (
                      <li key={taxa.id} className="flex justify-between text-sm text-gray-700">
                        <span>{taxa.modalidade.replace('CREDITO_X', 'Crédito x')}</span>
                        <span className="font-semibold text-[#c33638]">{taxa.taxaPercentual}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Nenhuma taxa de cartão encontrada.</p>
        )}
      </div>

      {/* PRODUTOS - SUA ESTRUTURA ORIGINAL 100% */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-[#394189] mb-4">Produtos</h2>
        {produtos.length > 0 ? (
          <ul className="space-y-3">
            {produtos.map((p) => {
              const lucroUnitario = (p.precoVenda || 0) - (p.precoCusto || 0);
              const valorTotalItem = (p.precoVenda || 0) * p.quantidade;
              return (
                <li key={p.id} className="p-4 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{p.nome}</p>
                      <p className="text-sm text-gray-500">{p.modelo} | {p.genero} | {p.marca} | Tamanho: {p.tamanho}</p>
                      <div className="mt-1 text-xs text-gray-500">
                        <span>Custo: R$ {p.precoCusto?.toFixed(2) || '0,00'}</span>
                        <span className="mx-2">|</span>
                        <span>Venda: R$ {p.precoVenda?.toFixed(2) || '0,00'}</span>
                        <span className="mx-2">|</span>
                        <span className={`font-semibold ${lucroUnitario >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Lucro Unit: R$ {lucroUnitario.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">Qtd: {p.quantidade}</p>
                      <p className="text-sm text-green-600">Total: R$ {valorTotalItem.toFixed(2)}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-500 text-center">Nenhum produto encontrado.</p>
        )}
        
        {/* PAGINAÇÃO - SUA ESTRUTURA */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-3">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-4 py-2 bg-[#394189] text-white font-semibold rounded-md hover:bg-[#c33638] disabled:opacity-50 transition-colors"
            >
              Anterior
            </button>
            <span className="px-4 py-2 bg-gray-200 font-semibold rounded-md text-gray-700">Página {page} de {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="px-4 py-2 bg-[#394189] text-white font-semibold rounded-md hover:bg-[#c33638] disabled:opacity-50 transition-colors"
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </div>
  );
}