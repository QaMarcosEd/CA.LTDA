'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function VendasPorProduto() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { produtoId } = useParams();
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/vendas?produtoId=${produtoId}`)
      .then(res => res.json())
      .then(data => {
        setVendas(data);
        setLoading(false);
      });
  }, [produtoId]);

  if (loading) return <p className="text-center text-lg text-gray-700">Carregando...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Histórico de Vendas - Produto ID {produtoId}</h1>
        <button
          onClick={() => router.push('/')}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg mb-6"
        >
          Voltar
        </button>
        <div className="overflow-x-auto">
          <table className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-3 px-4 text-left text-gray-700 font-semibold">Data</th>
                <th className="py-3 px-4 text-left text-gray-700 font-semibold">Quantidade Vendida</th>
                <th className="py-3 px-4 text-left text-gray-700 font-semibold">Preço da Venda</th>
                <th className="py-3 px-4 text-left text-gray-700 font-semibold">Observação</th>
              </tr>
            </thead>
            <tbody>
              {vendas.map(v => (
                <tr key={v.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-800">{new Date(v.data).toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-800">{v.quantidade}</td>
                  <td className="py-3 px-4 text-gray-800">R$ {v.precoVenda.toFixed(2)}</td>
                  <td className="py-3 px-4 text-gray-800">{v.observacao || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}