// // src/app/dashboard/page.js
// 'use client';

// import { useState, useEffect } from 'react';
// import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import { Package, AlertTriangle, DollarSign, Box, TrendingUp, CreditCard, Zap, Edit2, Save, X } from 'lucide-react';
// import PageHeader from '@/components/layout/Header';
// import toast from 'react-hot-toast';
// import LoadingSkeleton from '@/components/common/LoadingSkeleton';

// export default function Dashboard() {
//   const [produtos, setProdutos] = useState([]);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalProdutos, setTotalProdutos] = useState(0);
//   const [valorTotalRevenda, setValorTotalRevenda] = useState(0);
//   const [custoTotalEstoque, setCustoTotalEstoque] = useState(0);
//   const [lucroProjetado, setLucroProjetado] = useState(0);
//   const [margemLucro, setMargemLucro] = useState('0%');
//   const [resumoVendas, setResumoVendas] = useState({ totalQuitado: 0, totalPendente: 0 });
//   const [dashboardData, setDashboardData] = useState({
//     lowStockCount: 0,
//     lotesHoje: 0,
//     modelosAtivos: 0,
//     alerts: [],
//     estoquePorGenero: [],
//     topModelos: [],
//   });
//   const [rankingVendidos, setRankingVendidos] = useState([]);
//   const [taxasCartao, setTaxasCartao] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [epoca, setEpoca] = useState('normal');
//   const [editingTaxa, setEditingTaxa] = useState(null);
//   const [novaTaxa, setNovaTaxa] = useState('');

//   const limit = 10;

//   const formatCurrency = function (value) {
//     const num = parseFloat(value) || 0;
//     return `R$ ${num.toFixed(2).replace('.', ',')}`;
//   };

//   // Funções fetch (mantidas iguais)
//   const fetchResumoVendas = async function () {
//     try {
//       const res = await fetch('/api/vendas?resumo=true');
//       if (!res.ok) throw new Error('Erro ao buscar resumo de vendas');
//       const data = await res.json();
//       setResumoVendas(data.resumo || { totalQuitado: 0, totalPendente: 0 });
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const fetchProdutos = async function (pg = 1) {
//     setLoading(true);
//     setError(null);
//     try {
//       const query = new URLSearchParams();
//       query.append('page', pg);
//       query.append('limit', limit);

//       const res = await fetch(`/api/produtos?${query.toString()}`);
//       if (!res.ok) throw new Error('Erro ao buscar produtos');
//       const data = await res.json();
//       setProdutos(data.data || []);
//       setTotalPages(data.totalPages || 1);
//       setTotalProdutos(data.totalProdutos || 0);
//       setValorTotalRevenda(parseFloat(data.valorTotalRevenda) || 0);
//       setCustoTotalEstoque(parseFloat(data.custoTotalEstoque) || 0);
//       setLucroProjetado(parseFloat(data.lucroProjetado) || 0);
//       setMargemLucro(data.margemLucro || '0%');
//     } catch (err) {
//       console.error('Erro no fetchProdutos:', err);
//       setError('Erro ao carregar produtos');
//       setProdutos([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchDashboardData = async function () {
//     try {
//       const url = epoca === 'pico' ? '/api/home?epoca=pico' : '/api/home';
//       const homeRes = await fetch(url);
//       if (!homeRes.ok) {
//         const errorText = await homeRes.text();
//         console.error('Erro ao buscar home:', homeRes.status, errorText);
//         throw new Error('Erro ao buscar dados do dashboard');
//       }
//       const homeData = await homeRes.json();
//       setDashboardData({
//         lowStockCount: homeData.lowStockCount || 0,
//         lotesHoje: homeData.lotesHoje || 0,
//         modelosAtivos: homeData.modelosAtivos || 0,
//         alerts: homeData.alerts || [],
//         estoquePorGenero: homeData.estoquePorGenero || [],
//         topModelos: homeData.topModelos || [],
//       });
//     } catch (err) {
//       console.error('Erro geral:', err);
//       toast.error('Erro ao carregar dados do dashboard');
//       setDashboardData({
//         lowStockCount: 0,
//         lotesHoje: 0,
//         modelosAtivos: 0,
//         alerts: [],
//         estoquePorGenero: [],
//         topModelos: [],
//       });
//     }
//   };

//   const fetchRankingVendidos = async function () {
//     try {
//       const res = await fetch('/api/vendas');
//       if (!res.ok) throw new Error('Erro ao buscar ranking');
//       const data = await res.json();
//       setRankingVendidos(data.rankingModelos || []);
//     } catch (err) {
//       console.error('Erro ao carregar ranking de vendas:', err);
//       toast.error('Erro ao carregar ranking de vendas');
//     }
//   };

//   const fetchTaxasCartao = async function () {
//     try {
//       const res = await fetch('/api/taxas-cartao');
//       if (!res.ok) throw new Error('Erro ao buscar taxas de cartão');
//       const data = await res.json();
//       setTaxasCartao(data);
//     } catch (err) {
//       console.error('Erro ao carregar taxas de cartão:', err);
//       setTaxasCartao([]);
//     }
//   };

//   // Função pra atualizar taxa
//   const handleUpdateTaxa = async function (bandeira, modalidade) {
//     if (!novaTaxa || isNaN(novaTaxa) || parseFloat(novaTaxa) <= 0) {
//       toast.error('Digite uma taxa válida (ex: 2.49)');
//       return;
//     }

//     try {
//       const res = await fetch('/api/taxas-cartao', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           bandeira: bandeira,
//           modalidade: modalidade,
//           taxaPercentual: parseFloat(novaTaxa)
//         })
//       });

//       if (!res.ok) {
//         const error = await res.json();
//         throw new Error(error.error || 'Erro ao atualizar taxa');
//       }

//       const updatedTaxa = await res.json();
//       setTaxasCartao(taxasCartao.map(function (t) {
//         return t.bandeira === bandeira && t.modalidade === modalidade ? updatedTaxa : t;
//       }));
//       setEditingTaxa(null);
//       setNovaTaxa('');
//       toast.success('Taxa atualizada com sucesso!');
//     } catch (err) {
//       toast.error(err.message);
//     }
//   };

//   useEffect(function () {
//     const fetchData = async function () {
//       await Promise.all([fetchProdutos(page), fetchResumoVendas(), fetchDashboardData(), fetchRankingVendidos(), fetchTaxasCartao()]);
//     };
//     fetchData();
//   }, [page, epoca]);

//   const COLORS = ['#394189', '#c33638', '#10B981', '#F59E0B'];

//   if (loading) return <LoadingSkeleton type="dashboard" />;

//   if (error) return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <p className="text-lg font-medium text-red-600">{error}</p>
//     </div>
//   );

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <PageHeader title="Dashboard" greeting="👟 Visão Geral - Calçados Araújo" />

//       <div className="mb-4">
//         <label className="text-sm font-semibold text-[#394189] mr-2">Época:</label>
//         <select
//           value={epoca}
//           onChange={function (e) { setEpoca(e.target.value) }}
//           className="border border-[#394189]/20 rounded-lg p-2 focus:ring-2 focus:ring-[#394189] bg-white text-gray-500"
//         >
//           <option value="normal">Normal</option>
//           <option value="pico">🔥 Pico de Vendas</option>
//         </select>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-8">
//         {[
//           { icon: Package, label: 'Pares Totais', value: totalProdutos.toLocaleString('pt-BR'), color: '#394189' },
//           { icon: DollarSign, label: 'Valor Estoque', value: formatCurrency(valorTotalRevenda), color: '#c33638' },
//           { icon: AlertTriangle, label: 'Baixo Estoque', value: dashboardData.lowStockCount, color: '#F59E0B' },
//           { icon: Box, label: 'Lotes Hoje', value: dashboardData.lotesHoje, color: '#10B981' },
//           { icon: TrendingUp, label: 'Modelos Ativos', value: dashboardData.modelosAtivos, color: '#8B5CF6' },
//         ].map(function (card, i) {
//           return (
//             <div 
//               key={i}
//               className="group relative bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden h-20 flex items-center justify-between"
//             >
//               <div 
//                 className="absolute left-0 top-0 h-full w-1 rounded-l-xl"
//                 style={{ backgroundColor: card.color }}
//               ></div>
//               <div className="relative flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-white to-gray-50 flex items-center justify-center shadow-sm border border-gray-100 ml-1">
//                 <card.icon className="w-5 h-5" style={{ color: card.color }} />
//               </div>
//               <div className="flex-1 ml-3 pr-2">
//                 <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
//                   {card.label}
//                 </p>
//                 <p className="text-lg font-bold text-gray-900 truncate">
//                   {card.value}
//                 </p>
//               </div>
//               <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                 <TrendingUp className="w-3.5 h-3.5" style={{ color: card.color }} />
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {dashboardData.alerts.length > 0 && (
//         <div className="bg-red-50 border border-red-200 p-5 rounded-xl shadow-md mb-8">
//           <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
//             <AlertTriangle className="w-5 h-5" /> Ações Urgentes
//           </h3>
//           <ul className="space-y-2">
//             {dashboardData.alerts.map(function (alert, i) {
//               return (
//                 <li key={i} className="text-sm text-red-700 flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
//                   <span className={alert.message.includes('Sandálias Infantil') ? 'font-bold' : ''}>
//                     {alert.message.includes('Sandálias Infantil') && '🔥 '}
//                     {alert.message}
//                   </span>
//                   <button className="text-xs underline hover:text-red-900 font-medium">Ver Detalhes</button>
//                 </li>
//               );
//             })}
//           </ul>
//         </div>
//       )}

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//         <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200">
//           <h3 className="text-lg font-semibold text-[#394189] mb-4">Estoque por Gênero</h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <PieChart>
//               <Pie
//                 data={dashboardData.estoquePorGenero}
//                 cx="50%"
//                 cy="50%"
//                 labelLine={false}
//                 label={function ({ name, percent }) { return `${name} ${(percent * 100).toFixed(0)}%`; }}
//                 outerRadius={80}
//                 fill="#8884d8"
//                 dataKey="value"
//               >
//                 {dashboardData.estoquePorGenero.map(function (entry, index) {
//                   return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
//                 })}
//               </Pie>
//               <Tooltip />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>

//         <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200">
//           <h3 className="text-lg font-semibold text-[#c33638] mb-4">Top 5 Modelos em Estoque</h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={dashboardData.topModelos}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="name" />
//               <YAxis />
//               <Tooltip />
//               <Bar dataKey="quantidade" fill="#394189" />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200 mb-8">
//         <h3 className="text-lg font-semibold text-[#394189] mb-4">Ranking de Modelos Mais Vendidos</h3>
//         {rankingVendidos.length > 0 ? (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-100">
//                 <tr>
//                   <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Modelo</th>
//                   <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Unidades Vendidas</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {rankingVendidos.map(function (item, index) {
//                   return (
//                     <tr key={index} className="hover:bg-gray-50 transition-colors">
//                       <td className="px-4 py-3 text-sm text-gray-900">{item.modelo}</td>
//                       <td className="px-4 py-3 text-sm text-gray-900">{item.qtyVendida}</td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <p className="text-sm text-gray-500 text-center">Nenhum dado de vendas disponível.</p>
//         )}
//       </div>

//       <div className="bg-white p-6 rounded-lg shadow-md mb-8">
//         <h2 className="text-xl font-semibold text-[#394189] mb-4 flex items-center gap-2">
//           <CreditCard className="w-5 h-5" /> Taxas de Cartão Ativas
//         </h2>
//         {taxasCartao.length > 0 ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//             {['VISA', 'MASTERCARD', 'ELO'].map(function (bandeira) {
//               const taxasBandeira = taxasCartao.filter(function (t) { return t.bandeira === bandeira; });
//               return (
//                 <div key={bandeira} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
//                   <h3 className="text-md font-semibold text-[#394189] mb-2">{bandeira}</h3>
//                   <ul className="space-y-2">
//                     {taxasBandeira.map(function (taxa) {
//                       return (
//                         <li key={taxa.id} className="flex justify-between items-center text-sm text-gray-700">
//                           <span>{taxa.modalidade.replace('CREDITO_X', 'Crédito x')}</span>
//                           {editingTaxa && editingTaxa.id === taxa.id ? (
//                             <div className="flex items-center gap-2">
//                               <input
//                                 type="number"
//                                 step="0.01"
//                                 value={novaTaxa}
//                                 onChange={function (e) { setNovaTaxa(e.target.value); }}
//                                 className="w-20 px-2 py-1 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#394189] text-gray-700"
//                                 placeholder="Ex: 2.49"
//                               />
//                               <button
//                                 onClick={function () { handleUpdateTaxa(taxa.bandeira, taxa.modalidade); }}
//                                 className="p-1 bg-[#394189] text-white rounded-md hover:bg-[#c33638]"
//                               >
//                                 <Save className="w-4 h-4" />
//                               </button>
//                               <button
//                                 onClick={function () { setEditingTaxa(null); setNovaTaxa(''); }}
//                                 className="p-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
//                               >
//                                 <X className="w-4 h-4" />
//                               </button>
//                             </div>
//                           ) : (
//                             <div className="flex items-center gap-2">
//                               <span className="font-semibold text-[#c33638]">{taxa.taxaPercentual}%</span>
//                               <button
//                                 onClick={function () { setEditingTaxa(taxa); setNovaTaxa(taxa.taxaPercentual.toString()); }}
//                                 className="p-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
//                               >
//                                 <Edit2 className="w-4 h-4" />
//                               </button>
//                             </div>
//                           )}
//                         </li>
//                       );
//                     })}
//                   </ul>
//                 </div>
//               );
//             })}
//           </div>
//         ) : (
//           <p className="text-sm text-gray-500">Nenhuma taxa de cartão encontrada.</p>
//         )}
//       </div>

//       <div className="bg-white p-6 rounded-lg shadow-md mb-8">
//         <h2 className="text-xl font-semibold text-[#394189] mb-4">Produtos</h2>
//         {produtos.length > 0 ? (
//           <ul className="space-y-3">
//             {produtos.map(function (p) {
//               const lucroUnitario = (p.precoVenda || 0) - (p.precoCusto || 0);
//               const valorTotalItem = (p.precoVenda || 0) * p.quantidade;
//               return (
//                 <li key={p.id} className="p-4 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors">
//                   <div className="flex justify-between items-start">
//                     <div className="flex-1">
//                       <p className="font-medium text-gray-900">{p.nome}</p>
//                       <p className="text-sm text-gray-500">{p.modelo} | {p.genero} | {p.marca} | Tamanho: {p.tamanho}</p>
//                       <div className="mt-1 text-xs text-gray-500">
//                         <span>Custo: R$ {p.precoCusto?.toFixed(2) || '0,00'}</span>
//                         <span className="mx-2">|</span>
//                         <span>Venda: R$ {p.precoVenda?.toFixed(2) || '0,00'}</span>
//                         <span className="mx-2">|</span>
//                         <span className={lucroUnitario >= 0 ? 'text-green-600' : 'text-red-600'}>
//                           Lucro Unit: R$ {lucroUnitario.toFixed(2)}
//                         </span>
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <p className="font-semibold text-gray-900">Qtd: {p.quantidade}</p>
//                       <p className="text-sm text-green-600">Total: R$ {valorTotalItem.toFixed(2)}</p>
//                     </div>
//                   </div>
//                 </li>
//               );
//             })}
//           </ul>
//         ) : (
//           <p className="text-gray-500 text-center">Nenhum produto encontrado.</p>
//         )}

//         {totalPages > 1 && (
//           <div className="flex justify-center mt-6 space-x-3">
//             <button
//               disabled={page <= 1}
//               onClick={function () { setPage(function (p) { return Math.max(p - 1, 1); }); }}
//               className="px-4 py-2 bg-[#394189] text-white font-semibold rounded-md hover:bg-[#c33638] disabled:opacity-50 transition-colors"
//             >
//               Anterior
//             </button>
//             <span className="px-4 py-2 bg-gray-200 font-semibold rounded-md text-gray-700">Página {page} de {totalPages}</span>
//             <button
//               disabled={page >= totalPages}
//               onClick={function () { setPage(function (p) { return Math.min(p + 1, totalPages); }); }}
//               className="px-4 py-2 bg-[#394189] text-white font-semibold rounded-md hover:bg-[#c33638] disabled:opacity-50 transition-colors"
//             >
//               Próxima
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// src/app/dashboard/page.js
'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, AlertTriangle, DollarSign, Box, TrendingUp } from 'lucide-react';
import PageHeader from '@/components/layout/Header';
import toast from 'react-hot-toast';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import { jsPDF } from 'jspdf';
import { CSVLink } from 'react-csv';
import { FileText, Download } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [epoca, setEpoca] = useState('normal');
  const [loading, setLoading] = useState(true);

  const formatCurrency = (value) => `R$ ${(parseFloat(value) || 0).toFixed(2).replace('.', ',')}`;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/dashboard?epoca=${epoca}`);
        if (!res.ok) throw new Error('Erro ao carregar');
        const json = await res.json();
        setData(json);
      } catch (err) {
        toast.error('Erro ao carregar dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [epoca]);

  const gerarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Relatório - Calçados Araújo', 14, 20);
    doc.setFontSize(12);
    doc.text(`Época: ${epoca === 'pico' ? 'Pico' : 'Normal'}`, 14, 30);
    doc.text(`Pares: ${data.totalPares}`, 14, 40);
    doc.text(`Valor Estoque: ${formatCurrency(data.valorTotal)}`, 14, 50);
    doc.text(`Lucro Projetado: ${formatCurrency(data.lucroProjetado)}`, 14, 60);

    let y = 80;
    doc.text('Top 10 Vendidos', 14, y);
    y += 10;
    data.rankingVendidos.forEach((item, i) => {
      doc.text(`${i + 1}. ${item.modelo} - ${item.qtyVendida} unid`, 14, y);
      y += 7;
    });

    doc.save('relatorio_dashboard.pdf');
  };

  if (loading) return <LoadingSkeleton type="dashboard" />;
  if (!data) return <div>Erro ao carregar</div>;

  const COLORS = ['#394189', '#c33638', '#10B981', '#F59E0B'];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader title="Dashboard" greeting="Visão Geral - Calçados Araújo" />

      <div className="flex justify-between items-center mb-6">
        <div>
          <label className="text-sm font-semibold text-[#394189] mr-2">Época:</label>
          <select
            value={epoca}
            onChange={(e) => setEpoca(e.target.value)}
            className="border border-[#394189]/20 rounded-lg p-2 focus:ring-2 focus:ring-[#394189] bg-white"
          >
            <option value="normal">Normal</option>
            <option value="pico">Pico de Vendas</option>
          </select>
        </div>

        <div className="flex gap-3">
          <CSVLink
            data={data.rankingVendidos}
            headers={[
              { label: 'Modelo', key: 'modelo' },
              { label: 'Unidades', key: 'qtyVendida' },
            ]}
            filename="ranking_vendas.csv"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" /> CSV
          </CSVLink>
          <button
            onClick={gerarPDF}
            className="flex items-center gap-2 px-4 py-2 bg-[#394189] text-white rounded-lg hover:bg-[#c33638]"
          >
            <FileText className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-8">
        {[
          { icon: Package, label: 'Pares Totais', value: data.totalPares.toLocaleString('pt-BR'), color: '#394189' },
          { icon: DollarSign, label: 'Valor Estoque', value: formatCurrency(data.valorTotal), color: '#c33638' },
          { icon: AlertTriangle, label: 'Baixo Estoque', value: data.lowStockCount, color: '#F59E0B' },
          { icon: Box, label: 'Lotes Hoje', value: data.lotesHoje, color: '#10B981' },
          { icon: TrendingUp, label: 'Modelos Ativos', value: data.modelosAtivos, color: '#8B5CF6' },
        ].map((card, i) => (
          <div key={i} className="group relative bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-20 flex items-center justify-between">
            <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl" style={{ backgroundColor: card.color }}></div>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white to-gray-50 flex items-center justify-center shadow-sm border border-gray-100">
              <card.icon className="w-5 h-5" style={{ color: card.color }} />
            </div>
            <div className="flex-1 ml-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{card.label}</p>
              <p className="text-lg font-bold text-gray-900 truncate">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-[#394189] mb-4">Estoque por Gênero</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data.estoquePorGenero} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                {data.estoquePorGenero.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-[#c33638] mb-4">Top 5 Modelos em Estoque</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.topModelos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantidade" fill="#394189" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RANKING */}
      <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold text-[#394189] mb-4">Ranking de Modelos Mais Vendidos</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Modelo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Unidades Vendidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.rankingVendidos.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{item.modelo}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.qtyVendida}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
