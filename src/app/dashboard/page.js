'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Registrar os componentes do Chart.js para gráfico de pizza
ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const [contagemPorGenero, setContagemPorGenero] = useState([]);
  const [contagemPorModelo, setContagemPorModelo] = useState([]);
  const [contagemPorMarca, setContagemPorMarca] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função genérica para buscar contagem por tipo
  const fetchContagem = async (tipo) => {
    try {
      const res = await fetch(`/api/estoque?tipo=${tipo}`);
      if (!res.ok) {
        throw new Error(`Erro ao buscar contagem por ${tipo}: ${res.statusText}`);
      }
      const data = await res.json();
      console.log(`Dados recebidos para ${tipo}:`, data); // Log para depuração
      return data;
    } catch (error) {
      console.error(`Erro ao buscar contagem por ${tipo}:`, error);
      setError(`Erro ao carregar dados de ${tipo}`);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const [generoData, modeloData, marcaData] = await Promise.all([
        fetchContagem('genero'),
        fetchContagem('modelo'),
        fetchContagem('marca'),
      ]);
      setContagemPorGenero(generoData);
      setContagemPorModelo(modeloData);
      setContagemPorMarca(marcaData);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Dados para o gráfico de pizza por gênero
  const generoChartData = {
    labels: contagemPorGenero.length > 0 ? contagemPorGenero.map((item) => item.genero) : ['Sem dados'],
    datasets: [
      {
        label: 'Estoque por Gênero',
        data: contagemPorGenero.length > 0 ? contagemPorGenero.map((item) => item.total) : [0],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 205, 86, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 205, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Dados para o gráfico de pizza por modelo
  const modeloChartData = {
    labels: contagemPorModelo.length > 0 ? contagemPorModelo.map((item) => item.modelo) : ['Sem dados'],
    datasets: [
      {
        label: 'Estoque por Modelo',
        data: contagemPorModelo.length > 0 ? contagemPorModelo.map((item) => item.total) : [0],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 205, 86, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(99, 99, 99, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 205, 86, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(99, 99, 99, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Dados para o gráfico de pizza por marca
  const marcaChartData = {
    labels: contagemPorMarca.length > 0 ? contagemPorMarca.map((item) => item.marca) : ['Sem dados'],
    datasets: [
      {
        label: 'Estoque por Marca',
        data: contagemPorMarca.length > 0 ? contagemPorMarca.map((item) => item.total) : [0],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 205, 86, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(99, 99, 99, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(99, 99, 99, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: 'Distribuição do Estoque',
        font: {
          size: 16,
        },
      },
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Gráfico de pizza por gênero */}
          <div className="bg-white p-3 rounded-lg shadow-md max-w-xs mx-auto">
            <h2 className="text-lg font-semibold text-gray-700 mb-2 text-center">Estoque por Gênero</h2>
            <div className="relative h-64">
              <Pie
                data={generoChartData}
                options={{
                  ...chartOptions,
                  plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Estoque por Gênero' } },
                }}
              />
            </div>
          </div>

          {/* Gráfico de pizza por modelo */}
          <div className="bg-white p-3 rounded-lg shadow-md max-w-xs mx-auto">
            <h2 className="text-lg font-semibold text-gray-700 mb-2 text-center">Estoque por Modelo</h2>
            <div className="relative h-64">
              <Pie
                data={modeloChartData}
                options={{
                  ...chartOptions,
                  plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Estoque por Modelo' } },
                }}
              />
            </div>
          </div>

          {/* Gráfico de pizza por marca */}
          <div className="bg-white p-3 rounded-lg shadow-md max-w-xs mx-auto">
            <h2 className="text-lg font-semibold text-gray-700 mb-2 text-center">Estoque por Marca</h2>
            <div className="relative h-64">
              <Pie
                data={marcaChartData}
                options={{
                  ...chartOptions,
                  plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Estoque por Marca' } },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}