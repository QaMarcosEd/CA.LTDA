// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { Pie } from 'react-chartjs-2';
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// // Registrar os componentes do Chart.js para gráfico de pizza
// ChartJS.register(ArcElement, Tooltip, Legend);

// export default function Dashboard() {
//   const [contagemPorGenero, setContagemPorGenero] = useState([]);
//   const [contagemPorModelo, setContagemPorModelo] = useState([]);
//   const [contagemPorMarca, setContagemPorMarca] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Função genérica para buscar contagem por tipo
//   const fetchContagem = async (tipo) => {
//     try {
//       const res = await fetch(`/api/estoque?tipo=${tipo}`);
//       if (!res.ok) {
//         throw new Error(`Erro ao buscar contagem por ${tipo}: ${res.statusText}`);
//       }
//       const data = await res.json();
//       console.log(`Dados recebidos para ${tipo}:`, data); // Log para depuração
//       return data;
//     } catch (error) {
//       console.error(`Erro ao buscar contagem por ${tipo}:`, error);
//       setError(`Erro ao carregar dados de ${tipo}`);
//       return [];
//     }
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       setError(null);
//       const [generoData, modeloData, marcaData] = await Promise.all([
//         fetchContagem('genero'),
//         fetchContagem('modelo'),
//         fetchContagem('marca'),
//       ]);
//       setContagemPorGenero(generoData);
//       setContagemPorModelo(modeloData);
//       setContagemPorMarca(marcaData);
//       setLoading(false);
//     };
//     fetchData();
//   }, []);

//   // Dados para o gráfico de pizza por gênero
//   const generoChartData = {
//     labels: contagemPorGenero.length > 0 ? contagemPorGenero.map((item) => item.genero) : ['Sem dados'],
//     datasets: [
//       {
//         label: 'Estoque por Gênero',
//         data: contagemPorGenero.length > 0 ? contagemPorGenero.map((item) => item.total) : [0],
//         backgroundColor: [
//           'rgba(54, 162, 235, 0.6)',
//           'rgba(255, 99, 132, 0.6)',
//           'rgba(75, 192, 192, 0.6)',
//           'rgba(255, 205, 86, 0.6)',
//         ],
//         borderColor: [
//           'rgba(54, 162, 235, 1)',
//           'rgba(255, 99, 132, 1)',
//           'rgba(75, 192, 192, 1)',
//           'rgba(255, 205, 86, 1)',
//         ],
//         borderWidth: 1,
//       },
//     ],
//   };

//   // Dados para o gráfico de pizza por modelo
//   const modeloChartData = {
//     labels: contagemPorModelo.length > 0 ? contagemPorModelo.map((item) => item.modelo) : ['Sem dados'],
//     datasets: [
//       {
//         label: 'Estoque por Modelo',
//         data: contagemPorModelo.length > 0 ? contagemPorModelo.map((item) => item.total) : [0],
//         backgroundColor: [
//           'rgba(54, 162, 235, 0.6)',
//           'rgba(255, 99, 132, 0.6)',
//           'rgba(75, 192, 192, 0.6)',
//           'rgba(255, 205, 86, 0.6)',
//           'rgba(153, 102, 255, 0.6)',
//           'rgba(255, 159, 64, 0.6)',
//           'rgba(99, 99, 99, 0.6)',
//           'rgba(54, 162, 235, 0.6)',
//           'rgba(255, 99, 132, 0.6)',
//           'rgba(75, 192, 192, 0.6)',
//           'rgba(255, 205, 86, 0.6)',
//           'rgba(153, 102, 255, 0.6)',
//           'rgba(255, 159, 64, 0.6)',
//         ],
//         borderColor: [
//           'rgba(54, 162, 235, 1)',
//           'rgba(255, 99, 132, 1)',
//           'rgba(75, 192, 192, 1)',
//           'rgba(255, 205, 86, 1)',
//           'rgba(153, 102, 255, 1)',
//           'rgba(255, 159, 64, 1)',
//           'rgba(99, 99, 99, 1)',
//           'rgba(54, 162, 235, 1)',
//           'rgba(255, 99, 132, 1)',
//           'rgba(75, 192, 192, 1)',
//           'rgba(255, 205, 86, 1)',
//           'rgba(153, 102, 255, 1)',
//           'rgba(255, 159, 64, 1)',
//         ],
//         borderWidth: 1,
//       },
//     ],
//   };

//   // Dados para o gráfico de pizza por marca
//   const marcaChartData = {
//     labels: contagemPorMarca.length > 0 ? contagemPorMarca.map((item) => item.marca) : ['Sem dados'],
//     datasets: [
//       {
//         label: 'Estoque por Marca',
//         data: contagemPorMarca.length > 0 ? contagemPorMarca.map((item) => item.total) : [0],
//         backgroundColor: [
//           'rgba(54, 162, 235, 0.6)',
//           'rgba(255, 99, 132, 0.6)',
//           'rgba(75, 192, 192, 0.6)',
//           'rgba(255, 205, 86, 0.6)',
//           'rgba(153, 102, 255, 0.6)',
//           'rgba(255, 159, 64, 0.6)',
//           'rgba(99, 99, 99, 0.6)',
//         ],
//         borderColor: [
//           'rgba(54, 162, 235, 1)',
//           'rgba(255, 99, 132, 1)',
//           'rgba(75, 192, 192, 1)',
//           'rgba(255, 205, 86, 1)',
//           'rgba(153, 102, 255, 1)',
//           'rgba(255, 159, 64, 1)',
//           'rgba(99, 99, 99, 1)',
//         ],
//         borderWidth: 1,
//       },
//     ],
//   };

//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: true,
//     plugins: {
//       legend: {
//         position: 'bottom',
//         labels: {
//           font: {
//             size: 12,
//           },
//         },
//       },
//       title: {
//         display: true,
//         text: 'Distribuição do Estoque',
//         font: {
//           size: 16,
//         },
//       },
//     },
//   };

//   if (loading) return <p className="text-center text-lg text-gray-700">Carregando...</p>;

//   if (error) return <p className="text-center text-lg text-red-600">{error}</p>;

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Dashboard de Estoque</h1>

//         <Link
//           href="/"
//           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mb-6 inline-block text-center font-medium transition duration-200"
//         >
//           Voltar para Estoque
//         </Link>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {/* Gráfico de pizza por gênero */}
//           <div className="bg-white p-3 rounded-lg shadow-md max-w-xs mx-auto">
//             <h2 className="text-lg font-semibold text-gray-700 mb-2 text-center">Estoque por Gênero</h2>
//             <div className="relative h-64">
//               <Pie
//                 data={generoChartData}
//                 options={{
//                   ...chartOptions,
//                   plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Estoque por Gênero' } },
//                 }}
//               />
//             </div>
//           </div>

//           {/* Gráfico de pizza por modelo */}
//           <div className="bg-white p-3 rounded-lg shadow-md max-w-xs mx-auto">
//             <h2 className="text-lg font-semibold text-gray-700 mb-2 text-center">Estoque por Modelo</h2>
//             <div className="relative h-64">
//               <Pie
//                 data={modeloChartData}
//                 options={{
//                   ...chartOptions,
//                   plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Estoque por Modelo' } },
//                 }}
//               />
//             </div>
//           </div>

//           {/* Gráfico de pizza por marca */}
//           <div className="bg-white p-3 rounded-lg shadow-md max-w-xs mx-auto">
//             <h2 className="text-lg font-semibold text-gray-700 mb-2 text-center">Estoque por Marca</h2>
//             <div className="relative h-64">
//               <Pie
//                 data={marcaChartData}
//                 options={{
//                   ...chartOptions,
//                   plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Estoque por Marca' } },
//                 }}
//               />
//             </div>
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

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const [contagemPorGenero, setContagemPorGenero] = useState([]);
  const [contagemPorModelo, setContagemPorModelo] = useState([]);
  const [contagemPorMarca, setContagemPorMarca] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [marcaFiltro, setMarcaFiltro] = useState('');
  const [modeloFiltro, setModeloFiltro] = useState('');
  const [generoFiltro, setGeneroFiltro] = useState('');
  const [tamanhoFiltro, setTamanhoFiltro] = useState('');

  const limit = 10;

  // Busca contagem para os gráficos
  const fetchContagem = async (tipo) => {
    try {
      const res = await fetch(`/api/estoque?tipo=${tipo}`);
      if (!res.ok) throw new Error(`Erro ao buscar contagem por ${tipo}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  // Busca produtos com filtros e paginação
  const fetchProdutos = async (pg = 1) => {
    setLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams();
      if (marcaFiltro) query.append('marca', marcaFiltro);
      if (modeloFiltro) query.append('modelo', modeloFiltro);
      if (generoFiltro) query.append('genero', generoFiltro);
      if (tamanhoFiltro) query.append('tamanho', tamanhoFiltro);
      query.append('page', pg);
      query.append('limit', limit);

      const res = await fetch(`/api/produtos?${query.toString()}`);
      if (!res.ok) throw new Error('Erro ao buscar produtos');

      const data = await res.json();
      setProdutos(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
      setError('Erro ao buscar produtos');
      setProdutos([]);
    } finally {
      setLoading(false);
    }
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
    };

    fetchData();
  }, [page]);

  const aplicarFiltro = () => {
    setPage(1);
    fetchProdutos(1);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 12 } } },
      title: { display: true, text: 'Distribuição do Estoque', font: { size: 16 } },
    },
  };

  if (loading) return <p className="text-center text-lg text-gray-700">Carregando...</p>;
  if (error) return <p className="text-center text-lg text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Dashboard de Estoque</h1>

        <Link
          href="/"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mb-6 inline-block text-center font-medium transition duration-200"
        >
          Voltar para Estoque
        </Link>

        {/* Filtros */}
        <div className="flex gap-2 mb-4 text-gray-700">
          <input
            placeholder="Marca"
            value={marcaFiltro}
            onChange={(e) => setMarcaFiltro(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            placeholder="Modelo"
            value={modeloFiltro}
            onChange={(e) => setModeloFiltro(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            placeholder="Gênero"
            value={generoFiltro}
            onChange={(e) => setGeneroFiltro(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            placeholder="Tamanho"
            type="number"
            value={tamanhoFiltro}
            onChange={(e) => setTamanhoFiltro(e.target.value)}
            className="border p-2 rounded"
          />
          <button onClick={aplicarFiltro} className="bg-blue-600 text-white px-4 py-2 rounded">
            Aplicar Filtro
          </button>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Gráfico por Gênero */}
          <div className="bg-white p-3 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-2 text-center">Estoque por Gênero</h2>
            <div className="relative h-64">
              <Pie
                data={{
                  labels: contagemPorGenero.map((item) => item.genero) || ['Sem dados'],
                  datasets: [{
                    label: 'Estoque por Gênero',
                    data: contagemPorGenero.map((item) => item.total) || [0],
                    backgroundColor: ['rgba(54,162,235,0.6)','rgba(255,99,132,0.6)','rgba(75,192,192,0.6)','rgba(255,205,86,0.6)'],
                    borderColor: ['rgba(54,162,235,1)','rgba(255,99,132,1)','rgba(75,192,192,1)','rgba(255,205,86,1)'],
                    borderWidth: 1,
                  }]
                }}
                options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Estoque por Gênero' } } }}
              />
            </div>
          </div>

          {/* Gráfico por Modelo */}
          <div className="bg-white p-3 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-2 text-center">Estoque por Modelo</h2>
            <div className="relative h-64">
              <Pie
                data={{
                  labels: contagemPorModelo.map((item) => item.modelo) || ['Sem dados'],
                  datasets: [{
                    label: 'Estoque por Modelo',
                    data: contagemPorModelo.map((item) => item.total) || [0],
                    backgroundColor: ['rgba(54,162,235,0.6)','rgba(255,99,132,0.6)','rgba(75,192,192,0.6)','rgba(255,205,86,0.6)'],
                    borderColor: ['rgba(54,162,235,1)','rgba(255,99,132,1)','rgba(75,192,192,1)','rgba(255,205,86,1)'],
                    borderWidth: 1,
                  }]
                }}
                options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Estoque por Modelo' } } }}
              />
            </div>
          </div>

          {/* Gráfico por Marca */}
          <div className="bg-white p-3 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-2 text-center">Estoque por Marca</h2>
            <div className="relative h-64">
              <Pie
                data={{
                  labels: contagemPorMarca.map((item) => item.marca) || ['Sem dados'],
                  datasets: [{
                    label: 'Estoque por Marca',
                    data: contagemPorMarca.map((item) => item.total) || [0],
                    backgroundColor: ['rgba(54,162,235,0.6)','rgba(255,99,132,0.6)','rgba(75,192,192,0.6)','rgba(255,205,86,0.6)'],
                    borderColor: ['rgba(54,162,235,1)','rgba(255,99,132,1)','rgba(75,192,192,1)','rgba(255,205,86,1)'],
                    borderWidth: 1,
                  }]
                }}
                options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Estoque por Marca' } } }}
              />
            </div>
          </div>
        </div>

        {/* Lista de produtos */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Produtos</h2>
          <ul className="space-y-2">
            {produtos.length > 0 ? produtos.map((p) => (
              <li key={p.id} className="flex justify-between items-center p-3 bg-gray-50 border rounded-md">
                <div>
                  <p className="font-medium">{p.nome}</p>
                  <p className="text-sm text-gray-500">{p.modelo} | {p.genero} | {p.marca} | Tamanho: {p.tamanho}</p>
                </div>
                <p className="font-semibold">Qtd: {p.quantidade}</p>
              </li>
            )) : <p className="text-gray-500">Nenhum produto encontrado.</p>}
          </ul>

          {/* Paginação */}
          <div className="flex justify-center mt-4 space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="px-3 py-1 bg-gray-200 rounded">Página {page} de {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
