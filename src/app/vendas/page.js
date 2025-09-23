// pages/vendas.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import ParcelasModal from '@/components/ui/modals/ParcelasModal';

export default function Vendas() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVenda, setSelectedVenda] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchVendas = async () => {
      try {
        const res = await fetch('/api/vendas');
        if (!res.ok) throw new Error('Erro ao buscar vendas');
        const data = await res.json();
        console.log('Dados recebidos de /api/vendas:', data); // Depuração
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

  const getStatusVenda = (venda) => {
    console.log('Verificando status da venda:', venda); // Depuração
    if (!venda.parcelas || venda.parcelas.length === 0) return 'Quitado';
    const parcelasPagas = venda.parcelas.filter((p) => p.pago).length;
    return `Parcelado (${parcelasPagas}/${venda.parcelas.length} pagas)`;
  };

  const getValorPago = (venda) => {
    const entrada = parseFloat(venda.entrada) || 0;
    if (!venda.parcelas || venda.parcelas.length === 0) return entrada.toFixed(2);
    return (entrada + venda.parcelas.reduce((sum, p) => sum + parseFloat(p.valorPago || 0), 0)).toFixed(2);
  };

  const openParcelasModal = (venda) => {
    setSelectedVenda(venda);
    setIsModalOpen(true);
  };

  const closeParcelasModal = () => {
    setSelectedVenda(null);
    setIsModalOpen(false);
  };

  const marcarParcelaComoPaga = async (parcelaId, novoValorPago, observacao) => {
    try {
      const valor = parseFloat(novoValorPago);
      const parcela = selectedVenda.parcelas.find((p) => p.id === parcelaId);
      if (!parcela) throw new Error('Parcela não encontrada');
      if (valor <= 0) throw new Error('Valor pago deve ser maior que zero');

      const valorPagoExistente = parseFloat(parcela.valorPago || 0);
      const valorPendente = parseFloat(parcela.valor) - valorPagoExistente;
      if (valor > valorPendente) {
        throw new Error(`Valor pago (R$ ${valor.toFixed(2)}) não pode exceder o valor pendente (R$ ${valorPendente.toFixed(2)})`);
      }

      const novoValorPagoTotal = valorPagoExistente + valor;
      const isPago = novoValorPagoTotal >= parseFloat(parcela.valor) - 0.01; // Tolerância pra erros de arredondamento

      const res = await fetch(`/api/parcelas/${parcelaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incrementoValorPago: valor.toFixed(2), // Enviar como incremento
          observacao,
          pago: isPago,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erro ao marcar parcela como paga');
      }

      const updatedParcela = await res.json();
      // Atualizar vendas
      setVendas((prevVendas) =>
        prevVendas.map((venda) =>
          venda.id === selectedVenda.id
            ? {
                ...venda,
                parcelas: venda.parcelas.map((p) =>
                  p.id === parcelaId ? { ...p, ...updatedParcela } : p
                ),
              }
            : venda
        )
      );
      // Atualizar selectedVenda pra refletir no modal
      setSelectedVenda((prev) => ({
        ...prev,
        parcelas: prev.parcelas.map((p) =>
          p.id === parcelaId ? { ...p, ...updatedParcela } : p
        ),
      }));
      toast.success('Parcela atualizada com sucesso! ✅');
    } catch (error) {
      console.error('Erro ao marcar parcela:', error);
      toast.error(error.message || 'Erro ao marcar parcela');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-lg font-medium font-poppins text-gray-600 animate-pulse">Carregando vendas...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-lg font-medium font-poppins text-red-600">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold font-poppins text-gray-900 mb-8 text-center">Vendas Realizadas</h1>

        {/* Tabela de vendas */}
        <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {['ID', 'Produto', 'Quantidade', 'Valor Pago', 'Valor Total', 'Cliente', 'Data', 'Status', 'Ações'].map((title) => (
                  <th
                    key={title}
                    className="px-4 py-3 text-left text-xs font-semibold font-poppins text-gray-600 uppercase tracking-wider"
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
                    <td className="px-4 py-3 text-sm font-poppins text-gray-900">{v.id}</td>
                    <td className="px-4 py-3 text-sm font-poppins text-gray-900">{v.produto?.nome || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm font-poppins text-gray-900">{v.quantidade}</td>
                    <td className="px-4 py-3 text-sm font-poppins text-gray-900">R$ {getValorPago(v)}</td>
                    <td className="px-4 py-3 text-sm font-poppins text-gray-900">R$ {v.valorTotal.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm font-poppins text-gray-900">{v.cliente?.nome || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm font-poppins text-gray-900">
                      {v.dataVenda ? format(new Date(v.dataVenda), 'dd/MM/yyyy') : 'N/A'}
                    </td>
                    {/* <td className="px-4 py-3 text-sm font-poppins text-gray-900">
                      {new Date(v.createdAt).toLocaleString('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td> */}
                    <td className="px-4 py-3 text-sm font-poppins text-gray-900">{getStatusVenda(v)}</td>
                    <td className="px-4 py-3 text-sm font-poppins text-gray-900">
                      {v.parcelas && v.parcelas.length > 0 && (
                        <button
                          onClick={() => openParcelasModal(v)}
                          className="text-blue-600 hover:text-blue-800 font-poppins text-sm"
                        >
                          Ver Parcelas
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-4 py-4 text-center text-sm font-poppins text-gray-500">
                    Nenhuma venda encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal de Parcelas */}
        <ParcelasModal
          isOpen={isModalOpen}
          venda={selectedVenda}
          onClose={closeParcelasModal}
          marcarParcelaComoPaga={marcarParcelaComoPaga}
        />

        {/* Botão Voltar */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium font-poppins rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md"
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




