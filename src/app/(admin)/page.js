// // src/app/(admin)/page.js
// 'use client';

// import { useState, useEffect } from 'react';
// import toast from 'react-hot-toast';
// import { Package, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';
// import PageHeader from '@/components/layout/Header';
// import LoadingSkeleton from '@/components/common/LoadingSkeleton';

// const formatCurrency = (value) => {
//   const num = parseFloat(value) || 0;
//   return `R$ ${num.toFixed(2).replace('.', ',')}`;
// };

// export default function Home() {
//   const [totalPares, setTotalPares] = useState(0);
//   const [valorTotal, setValorTotal] = useState(0);
//   const [dashboardData, setDashboardData] = useState({
//     lowStockCount: 0,
//     lotesHoje: 0,
//     modelosAtivos: 0,
//     alerts: [],
//   });
//   const [rankingVendidos, setRankingVendidos] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [epoca, setEpoca] = useState('normal');

//   const fetchTotaisEOutros = async () => {
//     setLoading(true);
//     try {
//       const produtosRes = await fetch('/api/produtos');
//       if (!produtosRes.ok) {
//         const errorText = await produtosRes.text();
//         console.error('Erro ao buscar produtos:', produtosRes.status, errorText);
//         throw new Error('Erro ao buscar totais');
//       }
//       const prodData = await produtosRes.json();
//       setTotalPares(prodData.totalProdutos || 0);
//       setValorTotal(prodData.valorTotalRevenda || 0);

//       const url = epoca === 'pico' ? '/api/home?epoca=pico' : '/api/home';
//       const homeRes = await fetch(url);
//       if (!homeRes.ok) {
//         const errorText = await homeRes.text();
//         console.error('Erro ao buscar home:', homeRes.status, errorText);
//         toast.error('Erro ao carregar dados da página inicial');
//         setDashboardData({
//           lowStockCount: 0,
//           lotesHoje: 0,
//           modelosAtivos: 0,
//           alerts: [],
//         });
//         return;
//       }
//       const homeData = await homeRes.json();
//       setDashboardData({
//         lowStockCount: homeData.lowStockCount || 0,
//         lotesHoje: homeData.lotesHoje || 0,
//         modelosAtivos: homeData.modelosAtivos || 0,
//         alerts: homeData.alerts || [],
//       });
//     } catch (err) {
//       console.error('Erro geral:', err);
//       toast.error('Erro ao carregar página inicial');
//       setDashboardData({
//         lowStockCount: 0,
//         lotesHoje: 0,
//         modelosAtivos: 0,
//         alerts: [],
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchRankingVendidos = async () => {
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

//   useEffect(() => {
//     fetchTotaisEOutros();
//     fetchRankingVendidos();
//   }, [epoca]);

//   if (loading) return <LoadingSkeleton type="home" />;

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <PageHeader title="Home" greeting="Bom dia! Visão Geral da Home" />

//       {/* Toggle para época */}
//       <div className="mb-4 text-gray-500">
//         <label className="text-sm font-poppins text-gray-600 mr-2">Época:</label>
//         <select
//           value={epoca}
//           onChange={(e) => setEpoca(e.target.value)}
//           className="border border-gray-300 rounded-md p-2 font-poppins text-sm"
//         >
//           <option value="normal">Normal</option>
//           <option value="pico">Pico (ex.: verão, volta às aulas)</option>
//         </select>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-8">
//         <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 flex items-center gap-4 hover:shadow-lg transition-shadow">
//           <div className="text-3xl">📦</div>
//           <div>
//             <p className="text-xs font-poppins text-gray-500">Pares Totais</p>
//             <p className="text-2xl font-bold font-poppins text-gray-800">{totalPares.toLocaleString('pt-BR')}</p>
//           </div>
//         </div>
//         <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 flex items-center gap-4 hover:shadow-lg transition-shadow">
//           <DollarSign className="w-8 h-8 text-green-500" />
//           <div>
//             <p className="text-xs font-poppins text-gray-500">Valor Estoque</p>
//             <p className="text-2xl font-bold font-poppins text-gray-800">{formatCurrency(valorTotal)}</p>
//           </div>
//         </div>
//         <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 flex items-center gap-4 hover:shadow-lg transition-shadow">
//           <AlertTriangle className="w-8 h-8 text-yellow-500" />
//           <div>
//             <p className="text-xs font-poppins text-gray-500">Baixo Estoque</p>
//             <p className="text-2xl font-bold font-poppins text-gray-800">{dashboardData.lowStockCount}</p>
//           </div>
//         </div>
//         <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 flex items-center gap-4 hover:shadow-lg transition-shadow">
//           <Package className="w-8 h-8 text-blue-500" />
//           <div>
//             <p className="text-xs font-poppins text-gray-500">Lotes Hoje</p>
//             <p className="text-2xl font-bold font-poppins text-gray-800">{dashboardData.lotesHoje}</p>
//           </div>
//         </div>
//         <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 flex items-center gap-4 hover:shadow-lg transition-shadow">
//           <TrendingUp className="w-8 h-8 text-purple-500" />
//           <div>
//             <p className="text-xs font-poppins text-gray-500">Modelos Ativos</p>
//             <p className="text-2xl font-bold font-poppins text-gray-800">{dashboardData.modelosAtivos}</p>
//           </div>
//         </div>
//       </div>

//       {dashboardData.alerts.length > 0 && (
//         <div className="bg-red-50 border border-red-200 p-5 rounded-xl shadow-md mb-8">
//           <h3 className="text-lg font-semibold font-poppins text-red-800 mb-3 flex items-center gap-2">
//             <AlertTriangle className="w-5 h-5" /> Ações Urgentes
//           </h3>
//           <ul className="space-y-2">
//             {dashboardData.alerts.map((alert, i) => (
//               <li key={i} className="text-sm font-poppins text-red-700 flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
//                 <span className={alert.message.includes('Sandálias Infantil') ? 'font-bold' : ''}>
//                   {alert.message.includes('Sandálias Infantil') && '🔥 '}
//                   {alert.message}
//                 </span>
//                 <button
//                   onClick={() => toast.error('Funcionalidade "Ver Detalhes" ainda não implementada')}
//                   className="text-xs underline hover:text-red-900 font-medium"
//                 >
//                   Ver Detalhes
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200 mb-8">
//         <h3 className="text-lg font-semibold font-poppins text-gray-700 mb-4">Ranking de Modelos Mais Vendidos (Geral)</h3>
//         {rankingVendidos.length > 0 ? (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-100">
//                 <tr>
//                   <th className="px-4 py-3 text-left text-xs font-semibold font-poppins text-gray-600 uppercase tracking-wider">Modelo</th>
//                   <th className="px-4 py-3 text-left text-xs font-semibold font-poppins text-gray-600 uppercase tracking-wider">Unidades Vendidas</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {rankingVendidos.map((item, index) => (
//                   <tr key={index} className="hover:bg-gray-50 transition-colors">
//                     <td className="px-4 py-3 text-sm font-poppins text-gray-900">{item.modelo}</td>
//                     <td className="px-4 py-3 text-sm font-poppins text-gray-900">{item.qtyVendida}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <p className="text-sm text-gray-500 font-poppins">Nenhum dado de vendas disponível.</p>
//         )}
//       </div>
//     </div>
//   );
// }

// src/app/(admin)/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Package, AlertTriangle, DollarSign, TrendingUp, ChevronRight,
  Box, ShoppingBag
} from 'lucide-react';
import PageHeader from '@/components/layout/Header';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';

const formatCurrency = (value) => `R$ ${(parseFloat(value) || 0).toFixed(2).replace('.', ',')}`;

const COLORS = ['#394189', '#c33638', '#F59E0B', '#10B981', '#8B5CF6'];

export default function Home() {
  const router = useRouter();
  const [epoca, setEpoca] = useState('normal');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalPares: 0,
    valorTotal: 0,
    lowStockCount: 0,
    lotesHoje: 0,
    modelosAtivos: 0,
    alerts: [],
    topSemana: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const url = new URL('/api/home', window.location.origin);
        url.searchParams.set('semana', 'true');  // muda de 'hoje' pra 'semana'
        url.searchParams.set('limit', '3');
        if (epoca === 'pico') url.searchParams.set('epoca', 'pico');

        const res = await fetch(url);
        if (!res.ok) throw new Error('Erro ao carregar dados');
        const result = await res.json();
        setData(result);
      } catch (err) {
        toast.error('Erro ao carregar visão geral');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [epoca]);

  const handleVerDetalhes = (alert) => {
    const modelo = alert.message.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '-');
    router.push(`/dashboard?alerta=${modelo}`);
  };

  if (loading) return <LoadingSkeleton type="home" />;

  const cards = [
    { icon: Package, label: 'Pares Totais', value: data.totalPares.toLocaleString('pt-BR'), color: '#394189' },
    { icon: DollarSign, label: 'Valor Estoque', value: formatCurrency(data.valorTotal), color: '#c33638' },
    { icon: AlertTriangle, label: 'Baixo Estoque', value: data.lowStockCount, color: '#F59E0B' },
    { icon: Box, label: 'Lotes Hoje', value: data.lotesHoje, color: '#10B981' },
    { icon: TrendingUp, label: 'Modelos Ativos', value: data.modelosAtivos, color: '#8B5CF6' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader title="Home" greeting="Visão Geral Rápida" />

      {/* Toggle Época */}
      <div className="mb-6 flex justify-end">
        <label className="text-sm font-semibold text-[#394189] mr-3">Época:</label>
        <select
          value={epoca}
          onChange={(e) => setEpoca(e.target.value)}
          className="border border-[#394189]/20 rounded-lg p-2.5 focus:ring-2 focus:ring-[#394189] bg-white text-gray-700 shadow-sm text-sm font-medium"
        >
          <option value="normal">Normal</option>
          <option value="pico">Pico de Vendas</option>
        </select>
      </div>

      {/* Cards com Hover + Barra Colorida */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-8">
        {cards.map((card, i) => (
          <div
            key={i}
            className="group relative bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden h-24 flex items-center justify-between"
          >
            {/* Barra lateral colorida */}
            <div
              className="absolute left-0 top-0 h-full w-1.5 rounded-l-xl"
              style={{ backgroundColor: card.color }}
            />

            {/* Ícone */}
            <div className="relative flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-white to-gray-50 flex items-center justify-center shadow-sm border border-gray-100 ml-1.5">
              <card.icon className="w-6 h-6" style={{ color: card.color }} />
            </div>

            {/* Texto */}
            <div className="flex-1 ml-3 pr-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                {card.label}
              </p>
              <p className="text-xl font-bold text-gray-900 truncate">
                {card.value}
              </p>
            </div>

            {/* Ícone de crescimento no hover */}
            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <TrendingUp className="w-4 h-4" style={{ color: card.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Alertas Urgentes */}
      {data.alerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-xl shadow-md mb-8">
          <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Ações Urgentes
          </h3>
          <ul className="space-y-3">
            {data.alerts.map((a, i) => (
              <li
                key={i}
                className="text-sm bg-white p-4 rounded-lg shadow-sm border border-red-100 flex items-center justify-between hover:shadow transition-shadow"
              >
                <span className={`font-medium text-red-700 ${a.urgente ? 'font-bold' : ''}`}>
                  {a.urgente && 'Prioridade '}
                  {a.message}
                </span>
                <button
                  onClick={() => handleVerDetalhes(a)}
                  className="text-sm font-medium text-[#394189] hover:text-[#c33638] flex items-center gap-1 transition-colors"
                >
                  Ver <ChevronRight className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Top 3 da Semana */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-[#394189] flex items-center gap-2">
            <ShoppingBag className="w-6 h-6" /> Top 3 da Semana
          </h3>
          <button
            onClick={() => router.push('/dashboard?vendas=semana')}
            className="text-sm font-medium text-[#394189] hover:text-[#c33638] hover:underline"
          >
            Ver tudo →
          </button>
        </div>

        {data.topSemana.length > 0 ? (
          <ol className="space-y-4">
            {data.topSemana.map((item, i) => (
              <li key={i} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg hover:from-gray-100 transition-all">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[#394189] to-[#c33638] text-white font-bold text-sm shadow-md">
                    {i + 1}
                  </span>
                  <span className="font-semibold text-gray-800">{item.modelo}</span>
                </div>
                <span className="font-bold text-xl text-[#c33638]">{item.qtd} unid</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-center text-gray-500 py-6">Nenhuma venda na semana.</p>
        )}
      </div>
    </div>
  );
}