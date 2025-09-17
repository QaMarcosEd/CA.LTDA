'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Vendas() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVendas = async () => {
      try {
        const res = await fetch('/api/vendas');
        if (!res.ok) throw new Error('Erro ao buscar vendas');
        const data = await res.json();
        setVendas(data);
      } catch (error) {
        console.error('Erro no fetchVendas:', error);
        setError('Erro ao carregar vendas');
      } finally {
        setLoading(false);
      }
    };
    fetchVendas();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-lg font-medium text-gray-600 animate-pulse">Carregando vendas...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-lg font-medium text-red-600">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Vendas Realizadas</h1>

        {/* Tabela de vendas */}
        <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {['ID', 'Produto', 'Quantidade', 'Valor Pago', 'Cliente', 'Data'].map((title) => (
                  <th
                    key={title}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vendas.length > 0 ? (
                vendas.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">{v.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{v.produto?.nome || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{v.quantidade}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">R$ {v.valorPago.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{v.nomeCliente}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(v.data).toLocaleString('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-4 text-center text-sm text-gray-500">
                    Nenhuma venda encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Botão Voltar */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </Link>
        </div>
      </div>
    </div>
  );
}
