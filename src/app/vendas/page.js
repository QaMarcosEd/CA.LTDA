// src/app/vendas/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { formatDateToBrazil } from '../../../utils/formatDate';
import ModalGerenciarParcelas from '@/components/ui/modals/ModalGerenciarParcelas';

export default function Vendas() {
  const [vendas, setVendas] = useState([]);
  const [resumo, setResumo] = useState({ totalQuitado: '0.00', totalPendente: '0.00', porForma: { PIX: 0, DINHEIRO: 0, CARTAO: 0, PROMISSORIA: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVenda, setSelectedVenda] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtros, setFiltros] = useState({
    formaPagamento: 'TODAS',
    dataInicio: '',
    dataFim: '',
    status: 'TODAS',
  });

  const getValorPago = (venda) => {
    const entrada = parseFloat(venda.entrada || 0);
    const parcelasPagas = venda.parcelas?.reduce((sum, p) => sum + parseFloat(p.valorPago || 0), 0) || 0;
    return (entrada + parcelasPagas).toFixed(2);
  };

  const getStatusVenda = (venda) => {
    if (venda.status === 'QUITADO') return 'Quitado';
    if (venda.status === 'ABERTO' && venda.parcelas?.length > 0) {
      const parcelasPagas = venda.parcelas.filter((p) => p.pago).length;
      if (venda.parcelas.length === 1) {
        return parcelasPagas === 0 ? 'Pendente (cai em ~30 dias)' : 'Quitado';
      }
      return `Parcelado (${parcelasPagas}/${venda.parcelas.length} pagas)`;
    }
    return venda.status;
  };

  const formatFormaPagamento = (venda) => {
    if (venda.formaPagamento === 'PROMISSORIA' && venda.entrada > 0 && venda.formaPagamentoEntrada) {
      return `${venda.formaPagamentoEntrada} (entrada) + Promissória`;
    }
    return venda.formaPagamento?.replace('CARTAO_', '').replace('_', ' ').toLowerCase() || 'N/A';
  };

  useEffect(() => {
    fetchVendas();
  }, [filtros]);

  const fetchVendas = async () => {
    try {
      const params = new URLSearchParams();
      if (filtros.formaPagamento !== 'TODAS') params.append('formaPagamento', filtros.formaPagamento);
      if (filtros.dataInicio) params.append('dataInicio', filtros.dataInicio);
      if (filtros.dataFim) params.append('dataFim', filtros.dataFim);
      if (filtros.status !== 'TODAS') params.append('status', filtros.status);

      console.log('Filtros enviados:', filtros); // Depuração
      console.log('Parâmetros da URL:', params.toString()); // Depuração

      const res = await fetch(`/api/vendas?${params.toString()}`);
      if (!res.ok) {
        console.error('Erro na requisição:', {
          status: res.status,
          statusText: res.statusText,
          url: res.url,
        });
        try {
          const errorData = await res.json();
          console.error('Detalhes do erro:', errorData);
        } catch (e) {
          console.error('Não foi possível parsear a resposta:', e);
        }
        throw new Error('Erro ao buscar vendas');
      }
      const data = await res.json();
      console.log('Dados recebidos:', data); // Depuração
      setVendas(data.vendas || []);
      setResumo(data.resumo || { totalQuitado: '0.00', totalPendente: '0.00', porForma: { PIX: 0, DINHEIRO: 0, CARTAO: 0, PROMISSORIA: 0 } });
    } catch (error) {
      console.error('Erro no fetchVendas:', error);
      setError('Erro ao carregar vendas');
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    fetchVendas();
  };

  const limparFiltros = () => {
    setFiltros({ formaPagamento: 'TODAS', dataInicio: '', dataFim: '', status: 'TODAS' });
  };

  const openParcelasModal = (venda) => {
    setSelectedVenda(venda);
    setIsModalOpen(true);
  };

  const closeParcelasModal = () => {
    setIsModalOpen(false);
    setSelectedVenda(null);
    fetchVendas();
  };

  const marcarParcelaComoPaga = async (
    parcelaId,
    incrementoValorPago,
    observacao,
    formaPagamentoParcela,
    bandeira,
    modalidade,
    dataPagamento
  ) => {
    try {
      const res = await fetch(`/api/parcelas/${parcelaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incrementoValorPago,
          observacao,
          pago: true,
          formaPagamentoParcela,
          bandeira,
          modalidade,
          dataPagamento,
        }),
      });
      if (!res.ok) throw new Error('Erro ao marcar parcela como paga');
      closeParcelasModal();
      toast.success('Parcela marcada como paga!');
    } catch (error) {
      console.error('Erro ao marcar parcela:', error);
      toast.error('Erro ao marcar parcela');
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
        <h1 className="text-4xl font-bold font-poppins text-gray-900 mb-8 text-center">Gerenciador de Vendas</h1>

        {/* Seção de Resumo */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-600">Resumo Geral</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-gray-600">Total Quitado</p>
              <p className="text-2xl font-bold text-blue-600">R$ {resumo.totalQuitado}</p>
            </div>
            <div className="bg-red-50 p-4 rounded">
              <p className="text-sm text-gray-600">Total Pendente</p>
              <p className="text-2xl font-bold text-red-600">R$ {resumo.totalPendente}</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-sm text-gray-600">PIX/Dinheiro</p>
              <p className="text-2xl font-bold text-green-600">R$ {((resumo.porForma?.PIX || 0) + (resumo.porForma?.DINHEIRO || 0)).toFixed(2)}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <p className="text-sm text-gray-600">Cartão de Crédito/Débito</p>
              <p className="text-2xl font-bold text-purple-600">R$ {((resumo.porForma?.CARTAO || 0) + (resumo.porForma?.PROMISSORIA || 0)).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Seção de Filtros */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow">
          <h2 className="text-xl font-bold mb-4 text-gray-600">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-gray-500">
            <div>
              <label className="block text-sm font-medium mb-1">Forma de Pagamento</label>
              <select
                value={filtros.formaPagamento}
                onChange={(e) => setFiltros({ ...filtros, formaPagamento: e.target.value })}
                className="border p-2 w-full rounded"
              >
                <option value="TODAS">Todas</option>
                <option value="DINHEIRO">Dinheiro à vista</option>
                <option value="PIX">PIX à vista</option>
                <option value="CARTAO">Cartão</option>
                <option value="PROMISSORIA">Promissória</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data Inicial</label>
              <input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
                className="border p-2 w-full rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data Final</label>
              <input
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
                className="border p-2 w-full rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={filtros.status}
                onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                className="border p-2 w-full rounded"
              >
                <option value="TODAS">Todas</option>
                <option value="QUITADO">Quitado</option>
                <option value="ABERTO">Aberto</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-4">
            <button
              onClick={aplicarFiltros}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Aplicar Filtros
            </button>
            <button
              onClick={limparFiltros}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Tabela de Vendas */}
        <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {['ID', 'Produto', 'Quantidade', 'Valor Pago', 'Valor Pendente', 'Valor Total', 'Forma Pagamento', 'Cliente', 'Data', 'Status', 'Ações'].map((title) => (
                  <th key={title} className="px-4 py-3 text-left text-xs font-semibold font-poppins text-gray-600 uppercase tracking-wider">
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vendas.length > 0 ? (
                vendas.map((v) => {
                  const valorPago = getValorPago(v);
                  const valorPendente = (parseFloat(v.valorTotal) - parseFloat(valorPago)).toFixed(2);
                  return (
                    <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-poppins text-gray-900">{v.id}</td>
                      <td className="px-4 py-3 text-sm font-poppins text-gray-900">{v.produto?.nome || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm font-poppins text-gray-900">{v.quantidade}</td>
                      <td className="px-4 py-3 text-sm font-poppins text-gray-900">R$ {valorPago}</td>
                      <td className="px-4 py-3 text-sm font-poppins text-red-600">R$ {valorPendente}</td>
                      <td className="px-4 py-3 text-sm font-poppins text-gray-900">R$ {v.valorTotal.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm font-poppins text-gray-900">{formatFormaPagamento(v)}</td>
                      <td className="px-4 py-3 text-sm font-poppins text-gray-900">{v.cliente?.nome || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm font-poppins text-gray-900">{formatDateToBrazil(v.dataVenda)}</td>
                      <td className="px-4 py-3 text-sm font-poppins text-gray-900">{getStatusVenda(v)}</td>
                      <td className="px-4 py-3 text-sm font-poppins text-gray-900">
                        {v.parcelas && v.parcelas.length > 0 && (
                          <button onClick={() => openParcelasModal(v)} className="text-blue-600 hover:text-blue-800 font-poppins text-sm">
                            Ver Parcelas
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="11" className="px-4 py-4 text-center text-sm font-poppins text-gray-500">
                    Nenhuma venda encontrada. {filtros.formaPagamento !== 'TODAS' || filtros.dataInicio || filtros.dataFim || filtros.status !== 'TODAS' ? 'Tente ajustar os filtros.' : ''}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <ModalGerenciarParcelas
          isOpen={isModalOpen}
          venda={selectedVenda}
          onClose={closeParcelasModal}
          marcarParcelaComoPaga={marcarParcelaComoPaga}
        />

        <div className="mt-8 flex justify-center">
          <Link href="/" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium font-poppins rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md">
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