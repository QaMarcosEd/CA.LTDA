// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { Pie } from 'react-chartjs-2';
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
// import ChartDataLabels from 'chartjs-plugin-datalabels';

// ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

// export default function Dashboard() {
//   const [contagemPorGenero, setContagemPorGenero] = useState([]);
//   const [contagemPorModelo, setContagemPorModelo] = useState([]);
//   const [contagemPorMarca, setContagemPorMarca] = useState([]);
//   const [generosDisponiveis, setGenerosDisponiveis] = useState([]);
//   const [modelosDisponiveis, setModelosDisponiveis] = useState([]);
//   const [produtos, setProdutos] = useState([]);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalProdutos, setTotalProdutos] = useState(0);
  
//   // Estados atualizados pros novos campos financeiros
//   const [valorTotalRevenda, setValorTotalRevenda] = useState(0);
//   const [custoTotalEstoque, setCustoTotalEstoque] = useState(0);
//   const [lucroProjetado, setLucroProjetado] = useState(0);
//   const [margemLucro, setMargemLucro] = useState('0%');
  
//   const [resumoVendas, setResumoVendas] = useState({ totalQuitado: 0, totalPendente: 0 });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [marcaFiltro, setMarcaFiltro] = useState('');
//   const [modeloFiltro, setModeloFiltro] = useState('');
//   const [generoFiltro, setGeneroFiltro] = useState('');
//   const [tamanhoFiltro, setTamanhoFiltro] = useState('');

//   const limit = 10;

//   // Busca contagem para os gráficos (sem mudanças)
//   const fetchContagem = async (tipo) => {
//     try {
//       const res = await fetch(`/api/produtos?tipo=${tipo}`);
//       if (!res.ok) {
//         console.error(`Erro no endpoint /api/produtos?tipo=${tipo}: ${res.statusText}`);
//         return [];
//       }
//       return await res.json();
//     } catch (err) {
//       console.error(err);
//       return [];
//     }
//   };

//   // Busca resumo de vendas (sem mudanças)
//   const fetchResumoVendas = async () => {
//     try {
//       const res = await fetch('/api/vendas?resumo=true');
//       if (!res.ok) throw new Error('Erro ao buscar resumo de vendas');
//       const data = await res.json();
//       setResumoVendas(data.resumo || { totalQuitado: 0, totalPendente: 0 });
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // Busca listas dinâmicas para selects (sem mudanças)
//   const fetchListasFiltros = async () => {
//     try {
//       const [generosRes, modelosRes] = await Promise.all([
//         fetch('/api/produtos?tipo=genero'),
//         fetch('/api/produtos?tipo=modelo'),
//       ]);
//       if (!generosRes.ok || !modelosRes.ok) {
//         console.error('Erro ao buscar listas de filtros');
//         return;
//       }
//       const generos = await generosRes.json();
//       const modelos = await modelosRes.json();
//       setGenerosDisponiveis(generos.map(item => item.genero));
//       setModelosDisponiveis(modelos.map(item => item.modelo));
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // Busca produtos - ATUALIZADO pra novos campos
//   const fetchProdutos = async (pg = 1) => {
//     setLoading(true);
//     setError(null);

//     try {
//       const query = new URLSearchParams();
//       if (marcaFiltro) query.append('marca', marcaFiltro);
//       if (modeloFiltro) query.append('modelo', modeloFiltro);
//       if (generoFiltro) query.append('genero', generoFiltro);
//       if (tamanhoFiltro) query.append('tamanho', tamanhoFiltro);
//       query.append('page', pg);
//       query.append('limit', limit);

//       const res = await fetch(`/api/produtos?${query.toString()}`);
//       if (!res.ok) throw new Error('Erro ao buscar produtos');

//       const data = await res.json();
//       setProdutos(data.data || []);
//       setTotalPages(Math.ceil(data.totalProdutos / limit) || 1);
//       setTotalProdutos(data.totalProdutos || 0);
      
//       // Novos sets pros campos financeiros
//       setValorTotalRevenda(data.valorTotalRevenda || 0);
//       setCustoTotalEstoque(data.custoTotalEstoque || 0);
//       setLucroProjetado(data.lucroProjetado || 0);
//       setMargemLucro(data.margemLucro || '0%');
      
//       // Mantém compatibilidade com o antigo (opcional)
//       // setValorTotalEstoque(data.valorTotalRevenda || 0);
//     } catch (err) {
//       console.error('Erro no fetchProdutos:', err);
//       setError('Erro ao carregar produtos');
//       setProdutos([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       const [generoData, modeloData, marcaData] = await Promise.all([
//         fetchContagem('genero'),
//         fetchContagem('modelo'),
//         fetchContagem('marca'),
//       ]);
//       setContagemPorGenero(generoData);
//       setContagemPorModelo(modeloData);
//       setContagemPorMarca(marcaData);

//       await fetchProdutos(page);
//       await fetchListasFiltros();
//       await fetchResumoVendas();
//     };

//     fetchData();
//   }, [page]);

//   const aplicarFiltro = () => {
//     setPage(1);
//     fetchProdutos(1);
//   };

//   // Função pra cor da margem (verde se boa, vermelho se ruim)
//   const getMargemColor = (margemStr) => {
//     const margemNum = parseFloat(margemStr.replace('%', ''));
//     if (margemNum >= 50) return 'text-green-600';
//     if (margemNum >= 30) return 'text-yellow-600';
//     return 'text-red-600';
//   };

//   // Resto dos gráficos sem mudanças...
//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: true,
//     plugins: {
//       legend: { display: false },
//       title: {
//         display: true,
//         text: 'Distribuição do Estoque',
//         font: { size: 16, family: 'Poppins' },
//         padding: { top: 10, bottom: 10 },
//       },
//       datalabels: {
//         formatter: (value, ctx) => {
//           const total = ctx.dataset.data.reduce((acc, val) => acc + val, 0);
//           const percentage = ((value / total) * 100).toFixed(1);
//           return percentage > 5 ? `${percentage}%` : '';
//         },
//         color: '#fff',
//         font: { size: 12, family: 'Poppins', weight: 'bold' },
//         textAlign: 'center',
//       },
//     },
//   };

//   const colors = [
//     'rgba(54,162,235,0.6)', 'rgba(255,99,132,0.6)', 'rgba(75,192,192,0.6)',
//     'rgba(255,205,86,0.6)', 'rgba(153,102,255,0.6)', 'rgba(255,159,64,0.6)',
//     'rgba(99,255,132,0.6)', 'rgba(201,203,207,0.6)', 'rgba(54,235,162,0.6)',
//     'rgba(255,99,235,0.6)', 'rgba(75,192,235,0.6)',
//   ];

//   const borderColors = colors.map(color => color.replace('0.6', '1'));

//   const agruparOutros = (data, labelKey, valueKey) => {
//     if (data.length > 10) {
//       const sorted = [...data].sort((a, b) => b[valueKey] - a[valueKey]);
//       const top10 = sorted.slice(0, 10);
//       const outrosTotal = sorted.slice(10).reduce((sum, item) => sum + item[valueKey], 0);
//       return [...top10, { [labelKey]: 'Outros', [valueKey]: outrosTotal }];
//     }
//     return data;
//   };

//   const contagemPorGeneroAgrupado = agruparOutros(contagemPorGenero, 'genero', 'total');
//   const contagemPorModeloAgrupado = agruparOutros(contagemPorModelo, 'modelo', 'total');
//   const contagemPorMarcaAgrupado = agruparOutros(contagemPorMarca, 'marca', 'total');

//   if (loading) return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
//       <div className="w-64 h-4 bg-gray-300 animate-pulse rounded"></div>
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
//         {[...Array(6)].map((_, i) => (
//           <div key={i} className="w-48 h-32 bg-gray-300 animate-pulse rounded"></div>
//         ))}
//       </div>
//       <div className="w-full h-64 bg-gray-300 animate-pulse rounded"></div>
//     </div>
//   );

//   if (error) return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <p className="text-lg font-medium font-poppins text-red-600">{error}</p>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-3xl font-bold font-poppins text-gray-900 mb-8 text-center">Dashboard de Estoque</h1>

//         <div className="mb-6">
//           <Link
//             href="/"
//             className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium font-poppins rounded-md hover:bg-blue-700 transition-colors duration-200"
//           >
//             <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
//             </svg>
//             Voltar para Estoque
//           </Link>
//         </div>

//         {/* GRID EXPANDIDO PRA 6 CARDS FINANCEIROS */}
//         <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
//           <div className="bg-white p-4 rounded-lg shadow-md">
//             <h3 className="text-sm font-poppins text-gray-600">Total Produtos</h3>
//             <p className="text-2xl font-bold font-poppins text-blue-600">{totalProdutos}</p>
//           </div>
          
//           <div className="bg-white p-4 rounded-lg shadow-md">
//             <h3 className="text-sm font-poppins text-gray-600">Valor Potencial Revenda</h3>
//             <p className="text-2xl font-bold font-poppins text-green-600">R$ {valorTotalRevenda}</p>
//           </div>
          
//           <div className="bg-white p-4 rounded-lg shadow-md">
//             <h3 className="text-sm font-poppins text-gray-600">Custo Total Estoque</h3>
//             <p className="text-2xl font-bold font-poppins text-orange-600">R$ {custoTotalEstoque}</p>
//           </div>
          
//           <div className="bg-white p-4 rounded-lg shadow-md">
//             <h3 className="text-sm font-poppins text-gray-600">Lucro Projetado</h3>
//             <p className="text-2xl font-bold font-poppins text-purple-600">R$ {lucroProjetado}</p>
//           </div>
          
//           <div className="bg-white p-4 rounded-lg shadow-md">
//             <h3 className="text-sm font-poppins text-gray-600">Margem Lucro</h3>
//             <p className={`text-2xl font-bold font-poppins ${getMargemColor(margemLucro)}`}>
//               {margemLucro}
//             </p>
//           </div>
          
//           <div className="bg-white p-4 rounded-lg shadow-md">
//             <h3 className="text-sm font-poppins text-gray-600">Vendas Quitadas</h3>
//             <p className="text-2xl font-bold font-poppins text-indigo-600">R$ {resumoVendas.totalQuitado}</p>
//           </div>
//         </div>

//         {/* Filtros (sem mudanças) */}
//         <div className="mb-8 bg-white p-4 rounded-lg shadow-md text-gray-600">
//           <h2 className="text-lg font-semibold font-poppins text-gray-700 mb-4">Filtros</h2>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
//             <input
//               placeholder="Marca"
//               value={marcaFiltro}
//               onChange={(e) => setMarcaFiltro(e.target.value)}
//               className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins"
//             />
//             <select value={modeloFiltro} onChange={(e) => setModeloFiltro(e.target.value)} className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins">
//               <option value="">Selecione Modelo</option>
//               {modelosDisponiveis.map((m) => <option key={m} value={m}>{m}</option>)}
//             </select>
//             <select value={generoFiltro} onChange={(e) => setGeneroFiltro(e.target.value)} className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins">
//               <option value="">Selecione Gênero</option>
//               {generosDisponiveis.map((g) => <option key={g} value={g}>{g}</option>)}
//             </select>
//             <input
//               placeholder="Tamanho"
//               type="number"
//               value={tamanhoFiltro}
//               onChange={(e) => setTamanhoFiltro(e.target.value)}
//               className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins"
//             />
//             <button onClick={aplicarFiltro} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-poppins">
//               Aplicar Filtro
//             </button>
//           </div>
//         </div>

//         {/* Gráficos (sem mudanças) */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//           {/* Seus 3 gráficos de Pie aqui - código igual ao original */}
//           <div className="bg-white p-4 rounded-lg shadow-md">
//             <h2 className="text-lg font-semibold font-poppins text-gray-700 mb-4 text-center">Estoque por Gênero</h2>
//             <div className="relative flex justify-center items-center h-56">
//               <div className="w-48 h-48">
//                 <Pie
//                   data={{
//                     labels: contagemPorGeneroAgrupado.map((item) => item.genero) || ['Sem dados'],
//                     datasets: [{ label: 'Estoque por Gênero', data: contagemPorGeneroAgrupado.map((item) => item.total) || [0], backgroundColor: colors, borderColor: borderColors, borderWidth: 1 }],
//                   }}
//                   options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: 'Estoque por Gênero' } } }}
//                 />
//               </div>
//             </div>
//             <div className="mt-4 max-h-32 overflow-y-auto">
//               <div className="grid grid-cols-2 gap-2 pr-1">
//                 {contagemPorGeneroAgrupado.map((item, i) => (
//                   <div key={i} className="flex items-center text-xs font-poppins text-gray-700">
//                     <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: colors[i % colors.length] }}></span>
//                     {item.genero}: {item.total}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//           {/* Repita pros outros 2 gráficos... */}
//         </div>

//         {/* LISTA DE PRODUTOS MELHORADA */}
//         <div className="bg-white p-6 rounded-lg shadow-md">
//           <h2 className="text-xl font-semibold font-poppins text-gray-700 mb-4">Produtos</h2>
//           {produtos.length > 0 ? (
//             <ul className="space-y-3">
//               {produtos.map((p) => {
//                 const lucroUnitario = (p.precoVenda || 0) - (p.precoCusto || 0);
//                 const valorTotalItem = (p.precoVenda || 0) * p.quantidade;
//                 return (
//                   <li key={p.id} className="p-4 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors">
//                     <div className="flex justify-between items-start">
//                       <div className="flex-1">
//                         <p className="font-medium font-poppins text-gray-900">{p.nome}</p>
//                         <p className="text-sm font-poppins text-gray-500">{p.modelo} | {p.genero} | {p.marca} | Tamanho: {p.tamanho}</p>
//                         <div className="mt-1 text-xs text-gray-500">
//                           <span>Custo: R$ {p.precoCusto?.toFixed(2) || '0,00'}</span>
//                           <span className="mx-2">|</span>
//                           <span>Venda: R$ {p.precoVenda?.toFixed(2) || '0,00'}</span>
//                           <span className="mx-2">|</span>
//                           <span className={`font-semibold ${lucroUnitario >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//                             Lucro Unit: R$ {lucroUnitario.toFixed(2)}
//                           </span>
//                         </div>
//                       </div>
//                       <div className="text-right">
//                         <p className="font-semibold font-poppins text-gray-900">Qtd: {p.quantidade}</p>
//                         <p className="text-sm text-green-600">Total: R$ {valorTotalItem.toFixed(2)}</p>
//                       </div>
//                     </div>
//                   </li>
//                 );
//               })}
//             </ul>
//           ) : (
//             <p className="text-gray-500 font-poppins text-center">Nenhum produto encontrado.</p>
//           )}

//           <div className="flex justify-center mt-6 space-x-3">
//             <button
//               disabled={page <= 1}
//               onClick={() => setPage((p) => Math.max(p - 1, 1))}
//               className="px-4 py-2 bg-blue-600 text-white font-poppins rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
//             >
//               Anterior
//             </button>
//             <span className="px-4 py-2 bg-gray-200 font-poppins rounded-md text-gray-700">Página {page} de {totalPages}</span>
//             <button
//               disabled={page >= totalPages}
//               onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
//               className="px-4 py-2 bg-blue-600 text-white font-poppins rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
//             >
//               Próxima
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export default function Dashboard() {
  const [contagemPorGenero, setContagemPorGenero] = useState([]);
  const [contagemPorModelo, setContagemPorModelo] = useState([]);
  const [contagemPorMarca, setContagemPorMarca] = useState([]);
  const [generosDisponiveis, setGenerosDisponiveis] = useState([]);
  const [modelosDisponiveis, setModelosDisponiveis] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProdutos, setTotalProdutos] = useState(0);

  const [referenciaFiltro, setReferenciaFiltro] = useState('');
  
  // Estados atualizados pros novos campos financeiros
  const [valorTotalRevenda, setValorTotalRevenda] = useState(0);
  const [custoTotalEstoque, setCustoTotalEstoque] = useState(0);
  const [lucroProjetado, setLucroProjetado] = useState(0);
  const [margemLucro, setMargemLucro] = useState('0%');
  
  const [resumoVendas, setResumoVendas] = useState({ totalQuitado: 0, totalPendente: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [marcaFiltro, setMarcaFiltro] = useState('');
  const [modeloFiltro, setModeloFiltro] = useState('');
  const [generoFiltro, setGeneroFiltro] = useState('');
  const [tamanhoFiltro, setTamanhoFiltro] = useState('');

  const limit = 10;

  // Busca contagem para os gráficos (sem mudanças)
  const fetchContagem = async (tipo) => {
    try {
      const res = await fetch(`/api/produtos?tipo=${tipo}`);
      if (!res.ok) {
        console.error(`Erro no endpoint /api/produtos?tipo=${tipo}: ${res.statusText}`);
        return [];
      }
      return await res.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  // Busca resumo de vendas (sem mudanças)
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

  // Busca listas dinâmicas para selects (sem mudanças)
  const fetchListasFiltros = async () => {
    try {
      const [generosRes, modelosRes] = await Promise.all([
        fetch('/api/produtos?tipo=genero'),
        fetch('/api/produtos?tipo=modelo'),
      ]);
      if (!generosRes.ok || !modelosRes.ok) {
        console.error('Erro ao buscar listas de filtros');
        return;
      }
      const generos = await generosRes.json();
      const modelos = await modelosRes.json();
      setGenerosDisponiveis(generos.map(item => item.genero));
      setModelosDisponiveis(modelos.map(item => item.modelo));
    } catch (err) {
      console.error(err);
    }
  };

// Busca produtos - ATUALIZADO pra incluir referencia
  const fetchProdutos = async (pg = 1) => {
    setLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams();
      if (marcaFiltro) query.append('marca', marcaFiltro);
      if (modeloFiltro) query.append('modelo', modeloFiltro);
      if (generoFiltro) query.append('genero', generoFiltro);
      if (tamanhoFiltro) query.append('tamanho', tamanhoFiltro);
      if (referenciaFiltro) query.append('referencia', referenciaFiltro); // Novo: passa referencia
      query.append('page', pg);
      query.append('limit', limit);

      const res = await fetch(`/api/produtos?${query.toString()}`);
      if (!res.ok) throw new Error('Erro ao buscar produtos');

      const data = await res.json();
      setProdutos(data.data || []);
      setTotalPages(Math.ceil(data.totalProdutos / limit) || 1);
      setTotalProdutos(data.totalProdutos || 0);
      
      setValorTotalRevenda(data.valorTotalRevenda || 0);
      setCustoTotalEstoque(data.custoTotalEstoque || 0);
      setLucroProjetado(data.lucroProjetado || 0);
      setMargemLucro(data.margemLucro || '0%');
    } catch (err) {
      console.error('Erro no fetchProdutos:', err);
      setError('Erro ao carregar produtos');
      setProdutos([]);
    } finally {
      setLoading(false);
    }
  };

  // Nova função pra limpar todos filtros
  const limparFiltros = () => {
    setMarcaFiltro('');
    setModeloFiltro('');
    setGeneroFiltro('');
    setTamanhoFiltro('');
    setReferenciaFiltro(''); // Limpa referencia
    setPage(1);
    fetchProdutos(1);
  };

  useEffect(() => {
    const fetchData = async () => {
      const [generoData, modeloData, marcaData] = await Promise.all([
        fetchContagem('genero'),
        fetchContagem('modelo'),
        fetchContagem('marca'),
      ]);
      setContagemPorGenero(generoData);
      setContagemPorModelo(modeloData);
      setContagemPorMarca(marcaData);

      await fetchProdutos(page);
      await fetchListasFiltros();
      await fetchResumoVendas();
    };

    fetchData();
  }, [page]);

  const aplicarFiltro = () => {
    setPage(1);
    fetchProdutos(1);
  };

  // Função pra cor da margem (verde se boa, vermelho se ruim)
  const getMargemColor = (margemStr) => {
    const margemNum = parseFloat(margemStr.replace('%', ''));
    if (margemNum >= 50) return 'text-green-600';
    if (margemNum >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Resto dos gráficos sem mudanças...
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Distribuição do Estoque',
        font: { size: 16, family: 'Poppins' },
        padding: { top: 10, bottom: 10 },
      },
      datalabels: {
        formatter: (value, ctx) => {
          const total = ctx.dataset.data.reduce((acc, val) => acc + val, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return percentage > 5 ? `${percentage}%` : '';
        },
        color: '#fff',
        font: { size: 12, family: 'Poppins', weight: 'bold' },
        textAlign: 'center',
      },
    },
  };

  const colors = [
    'rgba(54,162,235,0.6)', 'rgba(255,99,132,0.6)', 'rgba(75,192,192,0.6)',
    'rgba(255,205,86,0.6)', 'rgba(153,102,255,0.6)', 'rgba(255,159,64,0.6)',
    'rgba(99,255,132,0.6)', 'rgba(201,203,207,0.6)', 'rgba(54,235,162,0.6)',
    'rgba(255,99,235,0.6)', 'rgba(75,192,235,0.6)',
  ];

  const borderColors = colors.map(color => color.replace('0.6', '1'));

  const agruparOutros = (data, labelKey, valueKey) => {
    if (data.length > 10) {
      const sorted = [...data].sort((a, b) => b[valueKey] - a[valueKey]);
      const top10 = sorted.slice(0, 10);
      const outrosTotal = sorted.slice(10).reduce((sum, item) => sum + item[valueKey], 0);
      return [...top10, { [labelKey]: 'Outros', [valueKey]: outrosTotal }];
    }
    return data;
  };

  const contagemPorGeneroAgrupado = agruparOutros(contagemPorGenero, 'genero', 'total');
  const contagemPorModeloAgrupado = agruparOutros(contagemPorModelo, 'modelo', 'total');
  const contagemPorMarcaAgrupado = agruparOutros(contagemPorMarca, 'marca', 'total');

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
      <div className="w-64 h-4 bg-gray-300 animate-pulse rounded"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-48 h-32 bg-gray-300 animate-pulse rounded"></div>
        ))}
      </div>
      <div className="w-full h-64 bg-gray-300 animate-pulse rounded"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-lg font-medium font-poppins text-red-600">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold font-poppins text-gray-900 mb-8 text-center">Dashboard de Estoque</h1>

        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium font-poppins rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar para Estoque
          </Link>
        </div>

        {/* GRID EXPANDIDO PRA 6 CARDS FINANCEIROS */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-sm font-poppins text-gray-600">Total Produtos</h3>
            <p className="text-2xl font-bold font-poppins text-blue-600">{totalProdutos}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-sm font-poppins text-gray-600">Valor Potencial Revenda</h3>
            <p className="text-2xl font-bold font-poppins text-green-600">R$ {valorTotalRevenda}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-sm font-poppins text-gray-600">Custo Total Estoque</h3>
            <p className="text-2xl font-bold font-poppins text-orange-600">R$ {custoTotalEstoque}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-sm font-poppins text-gray-600">Lucro Projetado</h3>
            <p className="text-2xl font-bold font-poppins text-purple-600">R$ {lucroProjetado}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-sm font-poppins text-gray-600">Margem Lucro</h3>
            <p className={`text-2xl font-bold font-poppins ${getMargemColor(margemLucro)}`}>
              {margemLucro}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-sm font-poppins text-gray-600">Vendas Quitadas</h3>
            <p className="text-2xl font-bold font-poppins text-indigo-600">R$ {resumoVendas.totalQuitado}</p>
          </div>
        </div>

{/* FILTROS ATUALIZADOS: + input referencia e botão limpar */}
        <div className="mb-8 bg-white p-4 rounded-lg shadow-md text-gray-600">
          <h2 className="text-lg font-semibold font-poppins text-gray-700 mb-4">Filtros</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4"> {/* Ajustado pra 6 colunas */}
            <input
              placeholder="Marca"
              value={marcaFiltro}
              onChange={(e) => setMarcaFiltro(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins"
            />
            <select
              value={modeloFiltro}
              onChange={(e) => setModeloFiltro(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins"
            >
              <option value="">Selecione Modelo</option>
              {modelosDisponiveis.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select
              value={generoFiltro}
              onChange={(e) => setGeneroFiltro(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins"
            >
              <option value="">Selecione Gênero</option>
              {generosDisponiveis.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <input
              placeholder="Tamanho"
              type="number"
              value={tamanhoFiltro}
              onChange={(e) => setTamanhoFiltro(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins"
            />
            {/* Novo input pra referencia */}
            <input
              placeholder="Referência"
              value={referenciaFiltro}
              onChange={(e) => setReferenciaFiltro(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins"
            />
            <div className="flex space-x-2">
              <button
                onClick={aplicarFiltro}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-poppins flex-1"
              >
                Aplicar
              </button>
              <button
                onClick={limparFiltros}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-poppins flex-1"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>

        {/* Gráficos (sem mudanças) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Seus 3 gráficos de Pie aqui - código igual ao original */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold font-poppins text-gray-700 mb-4 text-center">Estoque por Gênero</h2>
            <div className="relative flex justify-center items-center h-56">
              <div className="w-48 h-48">
                <Pie
                  data={{
                    labels: contagemPorGeneroAgrupado.map((item) => item.genero) || ['Sem dados'],
                    datasets: [{ label: 'Estoque por Gênero', data: contagemPorGeneroAgrupado.map((item) => item.total) || [0], backgroundColor: colors, borderColor: borderColors, borderWidth: 1 }],
                  }}
                  options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { text: 'Estoque por Gênero' } } }}
                />
              </div>
            </div>
            <div className="mt-4 max-h-32 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2 pr-1">
                {contagemPorGeneroAgrupado.map((item, i) => (
                  <div key={i} className="flex items-center text-xs font-poppins text-gray-700">
                    <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: colors[i % colors.length] }}></span>
                    {item.genero}: {item.total}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Repita pros outros 2 gráficos... */}
        </div>

        {/* LISTA DE PRODUTOS MELHORADA */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold font-poppins text-gray-700 mb-4">Produtos</h2>
          {produtos.length > 0 ? (
            <ul className="space-y-3">
              {produtos.map((p) => {
                const lucroUnitario = (p.precoVenda || 0) - (p.precoCusto || 0);
                const valorTotalItem = (p.precoVenda || 0) * p.quantidade;
                return (
                  <li key={p.id} className="p-4 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium font-poppins text-gray-900">{p.nome}</p>
                        <p className="text-sm font-poppins text-gray-500">{p.modelo} | {p.genero} | {p.marca} | Tamanho: {p.tamanho}</p>
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
                        <p className="font-semibold font-poppins text-gray-900">Qtd: {p.quantidade}</p>
                        <p className="text-sm text-green-600">Total: R$ {valorTotalItem.toFixed(2)}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-500 font-poppins text-center">Nenhum produto encontrado.</p>
          )}

          <div className="flex justify-center mt-6 space-x-3">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-4 py-2 bg-blue-600 text-white font-poppins rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Anterior
            </button>
            <span className="px-4 py-2 bg-gray-200 font-poppins rounded-md text-gray-700">Página {page} de {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="px-4 py-2 bg-blue-600 text-white font-poppins rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}