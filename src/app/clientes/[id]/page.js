// app/clientes/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDateToBrazil } from '../../../../utils/formatDate';

export default function DetalhesCliente() {
  const params = useParams();
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchDetalhes();
    }
  }, [params.id]);

  const fetchDetalhes = async () => {
    try {
      const res = await fetch(`/api/clientes/${params.id}`, { cache: 'no-store' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Erro ao buscar cliente: ${res.status} - ${errorData.error || 'Sem detalhes'}`);
      }
      const data = await res.json();
      console.log('Cliente retornado:', data); // Depuração
      setCliente(data);
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
      setError(`Erro ao carregar detalhes do cliente: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getValorPago = (venda) => {
    const entrada = parseFloat(venda.entrada) || 0;
    if (!venda.parcelas || venda.parcelas.length === 0) return entrada.toFixed(2);
    return (entrada + venda.parcelas.reduce((sum, p) => sum + parseFloat(p.valorPago || 0), 0)).toFixed(2);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-lg font-medium font-poppins text-gray-600 animate-pulse">Carregando detalhes...</p>
    </div>
  );

  if (error || !cliente) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-lg font-medium font-poppins text-red-600">{error || 'Cliente não encontrado'}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold font-poppins text-gray-900 mb-8">Detalhes do Cliente: {cliente.nome}</h1>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8 text-gray-600">
          <h2 className="text-xl font-semibold font-poppins text-gray-900 mb-4">Informações do Cliente</h2>
          <p><strong>Nome:</strong> {cliente.nome}</p>
          <p><strong>Apelido:</strong> {cliente.apelido || 'N/A'}</p>
          <p><strong>Telefone:</strong> {cliente.telefone || 'N/A'}</p>
          <p><strong>Criado em:</strong> {new Date(cliente.criadoEm).toLocaleDateString('pt-BR')}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold font-poppins text-gray-900 mb-4">Vendas Realizadas</h2>
          {cliente.vendas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold font-poppins text-gray-700">Produto</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold font-poppins text-gray-700">Quantidade</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold font-poppins text-gray-700">Valor Pago</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold font-poppins text-gray-700">Valor Total</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold font-poppins text-gray-700">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {cliente.vendas.map((v) => (
                    <tr key={v.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-poppins text-gray-800">{v.produto.nome}</td>
                      <td className="py-3 px-4 text-sm font-poppins text-gray-800">{v.quantidade}</td>
                      <td className="py-3 px-4 text-sm font-poppins text-gray-800">R$ {getValorPago(v)}</td>
                      <td className="py-3 px-4 text-sm font-poppins text-gray-800">R$ {v.valorTotal.toFixed(2)}</td>
                      <td className="py-3 px-4 text-sm font-poppins text-gray-800">
                        {formatDateToBrazil(v.dataVenda)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 font-poppins text-sm">Nenhuma venda registrada para este cliente.</p>
          )}
        </div>

        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/clientes"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-poppins text-sm"
          >
            Voltar à Lista
          </Link>
          <Link
            href="/"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-poppins text-sm"
          >
            Voltar ao Estoque
          </Link>
        </div>
      </div>
    </div>
  );
}