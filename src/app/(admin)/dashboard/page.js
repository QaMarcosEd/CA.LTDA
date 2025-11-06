// src/app/dashboard/page.js
'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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
            className="text-gray-500 border border-[#394189]/20 rounded-lg p-2 focus:ring-2 focus:ring-[#394189] bg-white"
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
                <Pie
                  data={data.estoquePorGenero}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`} // só %
                >
                  {data.estoquePorGenero.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="middle" layout="vertical" align="right" />
              </PieChart>
            </ResponsiveContainer>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-[#394189] mb-4">Top 5 Modelos em Estoque</h3>
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
