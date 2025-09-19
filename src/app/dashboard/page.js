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
      legend: { display: false }, // Desativa a legenda padrão
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
    'rgba(54,162,235,0.6)',
    'rgba(255,99,132,0.6)',
    'rgba(75,192,192,0.6)',
    'rgba(255,205,86,0.6)',
    'rgba(153,102,255,0.6)',
    'rgba(255,159,64,0.6)',
    'rgba(99,255,132,0.6)',
    'rgba(201,203,207,0.6)',
    'rgba(54,235,162,0.6)',
    'rgba(255,99,235,0.6)',
    'rgba(75,192,235,0.6)',
  ];

  const borderColors = colors.map(color => color.replace('0.6', '1'));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-lg font-medium font-poppins text-gray-600 animate-pulse">Carregando dashboard...</p>
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

        {/* Botão Voltar */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium font-poppins rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar para Estoque
          </Link>
        </div>

        {/* Filtros */}
        <div className="mb-8 bg-white p-4 rounded-lg shadow-md text-gray-600">
          <h2 className="text-lg font-semibold font-poppins text-gray-700 mb-4">Filtros</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
              <option value="TENIS">Tênis</option>
              <option value="SAPATENIS">Sapatênis</option>
              <option value="SANDALIA">Sandália</option>
              <option value="RASTEIRA">Rasteira</option>
              <option value="TAMANCO">Tamanco</option>
              <option value="SCARPIN">Scarpin</option>
              <option value="BOTA">Bota</option>
              <option value="CHINELO">Chinelo</option>
              <option value="MOCASSIM">Mocassim</option>
              <option value="PAPETE">Papete</option>
              <option value="CHUTEIRA">Chuteira</option>
            </select>
            <select
              value={generoFiltro}
              onChange={(e) => setGeneroFiltro(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins"
            >
              <option value="">Selecione Gênero</option>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMININO">Feminino</option>
              <option value="INFANTIL_MASCULINO">Infantil Masculino</option>
              <option value="INFANTIL_FEMININO">Infantil Feminino</option>
            </select>
            <input
              placeholder="Tamanho"
              type="number"
              value={tamanhoFiltro}
              onChange={(e) => setTamanhoFiltro(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins"
            />
            <button
              onClick={aplicarFiltro}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-poppins"
            >
              Aplicar Filtro
            </button>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Gráfico por Gênero */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold font-poppins text-gray-700 mb-4 text-center">Estoque por Gênero</h2>
            <div className="relative flex justify-center items-center h-56">
              <div className="w-48 h-48">
                <Pie
                  data={{
                    labels: contagemPorGenero.map((item) => item.genero) || ['Sem dados'],
                    datasets: [{
                      label: 'Estoque por Gênero',
                      data: contagemPorGenero.map((item) => item.total) || [0],
                      backgroundColor: colors,
                      borderColor: borderColors,
                      borderWidth: 1,
                    }],
                  }}
                  options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Estoque por Gênero' } } }}
                />
              </div>
            </div>
            <div className="mt-4 max-h-32 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2 pr-1">
                {contagemPorGenero.map((item, i) => (
                  <div key={i} className="flex items-center text-xs font-poppins text-gray-700">
                    <span
                      className="w-2 h-2 rounded-full mr-1"
                      style={{ backgroundColor: colors[i % colors.length] }}
                    ></span>
                    {item.genero}: {item.total}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Gráfico por Modelo */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold font-poppins text-gray-700 mb-4 text-center">Estoque por Modelo</h2>
            <div className="relative flex justify-center items-center h-56">
              <div className="w-48 h-48">
                <Pie
                  data={{
                    labels: contagemPorModelo.map((item) => item.modelo) || ['Sem dados'],
                    datasets: [{
                      label: 'Estoque por Modelo',
                      data: contagemPorModelo.map((item) => item.total) || [0],
                      backgroundColor: colors,
                      borderColor: borderColors,
                      borderWidth: 1,
                    }],
                  }}
                  options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Estoque por Modelo' } } }}
                />
              </div>
            </div>
            <div className="mt-4 max-h-32 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2 pr-1">
                {contagemPorModelo.map((item, i) => (
                  <div key={i} className="flex items-center text-xs font-poppins text-gray-700">
                    <span
                      className="w-2 h-2 rounded-full mr-1"
                      style={{ backgroundColor: colors[i % colors.length] }}
                    ></span>
                    {item.modelo}: {item.total}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Gráfico por Marca */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold font-poppins text-gray-700 mb-4 text-center">Estoque por Marca</h2>
            <div className="relative flex justify-center items-center h-56">
              <div className="w-48 h-48">
                <Pie
                  data={{
                    labels: contagemPorMarca.map((item) => item.marca) || ['Sem dados'],
                    datasets: [{
                      label: 'Estoque por Marca',
                      data: contagemPorMarca.map((item) => item.total) || [0],
                      backgroundColor: colors,
                      borderColor: borderColors,
                      borderWidth: 1,
                    }],
                  }}
                  options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Estoque por Marca' } } }}
                />
              </div>
            </div>
            <div className="mt-4 max-h-32 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2 pr-1">
                {contagemPorMarca.map((item, i) => (
                  <div key={i} className="flex items-center text-xs font-poppins text-gray-700">
                    <span
                      className="w-2 h-2 rounded-full mr-1"
                      style={{ backgroundColor: colors[i % colors.length] }}
                    ></span>
                    {item.marca}: {item.total}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Lista de produtos */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold font-poppins text-gray-700 mb-4">Produtos</h2>
          {produtos.length > 0 ? (
            <ul className="space-y-3">
              {produtos.map((p) => (
                <li key={p.id} className="flex justify-between items-center p-4 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-medium font-poppins text-gray-900">{p.nome}</p>
                    <p className="text-sm font-poppins text-gray-500">{p.modelo} | {p.genero} | {p.marca} | Tamanho: {p.tamanho}</p>
                  </div>
                  <p className="font-semibold font-poppins text-gray-900">Qtd: {p.quantidade}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 font-poppins text-center">Nenhum produto encontrado.</p>
          )}

          {/* Paginação */}
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