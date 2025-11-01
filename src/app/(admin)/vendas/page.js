// src/app/(admin)/vendas/page.js
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Package, Zap, TrendingUp, CreditCard, User, ShoppingCart, Filter } from 'lucide-react';
import { formatDateToBrazil } from '../../../utils/formatDate';
import ModalGerenciarParcelas from '@/components/modals/ModalGerenciarParcelas';
import PageHeader from '@/components/layout/Header';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';

export default function Vendas() {
  const [vendas, setVendas] = useState([]);
  const [resumo, setResumo] = useState({ totalQuitado: '0.00', totalPendente: '0.00', porForma: { PIX: 0, DINHEIRO: 0, CARTAO: 0, PROMISSORIA: 0 } });
  const [rankingModelos, setRankingModelos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVenda, setSelectedVenda] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtros, setFiltros] = useState({
    formaPagamento: 'TODAS',
    dataInicio: '',
    dataFim: '',
    status: 'TODAS',
  });

  const getValorPago = (venda) => {
    return parseFloat(venda.valorPagoTotal || 0).toFixed(2);
  };

  const getStatusVenda = (venda) => {
    if (venda.status === 'QUITADO') return '✅ Quitado';
    if (venda.status === 'ABERTO' && venda.parcelas?.length > 0) {
      const parcelasPagas = venda.parcelas.filter((p) => p.pago).length;
      if (venda.parcelas.length === 1) {
        return parcelasPagas === 0 ? '⏳ Pendente' : '✅ Quitado';
      }
      return `📦 ${parcelasPagas}/${venda.parcelas.length}`;
    }
    return '⏳ Pendente';
  };

  const formatFormaPagamento = (venda) => {
    if (venda.formaPagamento === 'PROMISSORIA' && venda.entrada > 0 && venda.formaPagamentoEntrada) {
      return `${venda.formaPagamentoEntrada} + 📜`;
    }
    return venda.formaPagamento?.replace('CARTAO_', '').replace('_', ' ').toLowerCase() || 'N/A';
  };

  useEffect(() => {
    fetchVendas();
  }, [filtros]);

  const fetchVendas = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtros.formaPagamento !== 'TODAS') params.append('formaPagamento', filtros.formaPagamento);
      if (filtros.dataInicio) params.append('dataInicio', filtros.dataInicio);
      if (filtros.dataFim) params.append('dataFim', filtros.dataFim);
      if (filtros.status !== 'TODAS') params.append('status', filtros.status);

      const res = await fetch(`/api/vendas?${params.toString()}`);
      if (!res.ok) throw new Error('Erro ao buscar vendas');
      
      const data = await res.json();
      setVendas(data.vendas || []);
      setResumo(data.resumo || { totalQuitado: '0.00', totalPendente: '0.00', porForma: { PIX: 0, DINHEIRO: 0, CARTAO: 0, PROMISSORIA: 0 } });
      setRankingModelos(data.rankingModelos || []);
    } catch (error) {
      console.error('Erro no fetchVendas:', error);
      toast.error('Erro ao carregar vendas');
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => fetchVendas();
  const limparFiltros = () => setFiltros({ formaPagamento: 'TODAS', dataInicio: '', dataFim: '', status: 'TODAS' });

  const openParcelasModal = (venda) => {
    setSelectedVenda(venda);
    setIsModalOpen(true);
  };

  const closeParcelasModal = () => {
    setIsModalOpen(false);
    setSelectedVenda(null);
    fetchVendas();
  };

  const marcarParcelaComoPaga = async (parcelaId, valorPago, observacao, forma, bandeira, modalidade, dataPagamento) => {
    try {
      const res = await fetch(`/api/parcelas/${parcelaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incrementoValorPago: valorPago,
          observacao,
          formaPagamentoParcela: forma,
          bandeira,
          modalidade,
          dataPagamento,
        }),
      });

      if (!res.ok) throw new Error('Erro na API');
      toast.success('Parcela paga com sucesso! ✅');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <LoadingSkeleton type="vendas" />;

  return (
    <div className="p-3 sm:p-4 bg-gray-50 min-h-screen">
      <PageHeader title="Vendas" greeting="💰 Gerenciamento Completo - Calçados Araújo" />

      <div className="max-w-7xl mx-auto w-full">
        {/* CARDS RESUMO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4">
          {[
            { icon: Package, label: 'Total Vendas', value: vendas.length.toLocaleString('pt-BR'), color: '#394189' },
            { icon: Zap, label: 'Quitadas', value: `R$ ${resumo.totalQuitado}`, color: '#10B981' },
            { icon: TrendingUp, label: 'Pendentes', value: `R$ ${resumo.totalPendente}`, color: '#F59E0B' },
            { icon: CreditCard, label: 'Modelos Vendidos', value: rankingModelos.length.toLocaleString('pt-BR'), color: '#c33638' },
          ].map((card, i) => (
            <div 
              key={i}
              className="group relative bg-white rounded-lg p-2 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden h-18 flex items-center justify-between"
            >
              <div className="absolute left-0 top-0 h-full w-0.5" style={{ backgroundColor: card.color }}></div>
              <div className="w-7 h-7 rounded bg-gradient-to-br from-white to-gray-50 flex items-center justify-center shadow-sm">
                <card.icon className="w-3.5 h-3.5" style={{ color: card.color }} />
              </div>
              <div className="flex-1 ml-1.5 pr-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 truncate">{card.label}</p>
                <p className="text-sm font-bold text-gray-900 truncate">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* FILTROS */}
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-[#394189] mb-3 flex items-center gap-1.5">
            <Filter className="w-4 h-4" />
            Filtros Rápidos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <select
              value={filtros.formaPagamento}
              onChange={(e) => setFiltros({ ...filtros, formaPagamento: e.target.value })}
              className="border border-[#394189]/20 rounded-lg p-2.5 focus:ring-2 focus:ring-[#394189] bg-white text-gray-500 text-sm"
            >
              <option value="TODAS">Todas Formas</option>
              <option value="DINHEIRO">💵 Dinheiro</option>
              <option value="PIX">⚡ PIX</option>
              <option value="CARTAO">💳 Cartão</option>
              <option value="PROMISSORIA">📜 Promissória</option>
            </select>
            <input
              type="date"
              value={filtros.dataInicio}
              onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
              className="border border-[#394189]/20 rounded-lg p-2.5 focus:ring-2 focus:ring-[#394189] bg-white text-gray-500 text-sm"
            />
            <input
              type="date"
              value={filtros.dataFim}
              onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
              className="border border-[#394189]/20 rounded-lg p-2.5 focus:ring-2 focus:ring-[#394189] bg-white text-gray-500 text-sm"
            />
            <select
              value={filtros.status}
              onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
              className="border border-[#394189]/20 rounded-lg p-2.5 focus:ring-2 focus:ring-[#394189] bg-white text-gray-500 text-sm"
            >
              <option value="TODAS">Todos Status</option>
              <option value="QUITADO">✅ Quitado</option>
              <option value="ABERTO">⏳ Aberto</option>
            </select>
          </div>
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <button
              onClick={aplicarFiltros}
              className="flex-1 bg-gradient-to-r from-[#394189] to-[#c33638] text-white font-semibold rounded-lg p-2.5 hover:from-[#c33638] hover:to-[#394189] transition-all text-sm flex items-center justify-center"
            >
              🔍 Aplicar
            </button>
            <button
              onClick={limparFiltros}
              className="flex-1 bg-gray-200 text-gray-700 font-semibold rounded-lg p-2.5 hover:bg-gray-300 transition-all text-sm flex items-center justify-center"
            >
              🧹 Limpar
            </button>
          </div>
        </div>

        {/* RANKING */}
        {rankingModelos.length > 0 ? (
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 mb-4 overflow-hidden">
            <h3 className="text-base font-semibold text-[#394189] mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              Top Modelos Vendidos
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 sm:px-3 py-2 text-left text-xs font-semibold text-gray-600">Modelo</th>
                    <th className="px-2 sm:px-3 py-2 text-left text-xs font-semibold text-gray-600">Qtd Vendida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rankingModelos.slice(0, 5).map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-2 sm:px-3 py-2 text-xs text-gray-900">{item.modelo}</td>
                      <td className="px-2 sm:px-3 py-2 text-xs font-semibold text-[#10B981]">{item.qtyVendida.toLocaleString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 mb-4 text-center text-gray-500 text-sm">
            Nenhum modelo vendido encontrado para os filtros aplicados.
          </div>
        )}

        {/* TABELA */}
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 mb-4 overflow-hidden">
          <h2 className="text-base sm:text-lg font-semibold text-[#394189] mb-3 flex items-center gap-1.5">
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            Lista Completa de Vendas
          </h2>
          
          {vendas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-1.5 sm:px-2 lg:px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                    <th className="px-1 sm:px-1.5 lg:px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Produto</th>
                    <th className="px-1 sm:px-1.5 lg:px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Qtd</th>
                    <th className="px-1 sm:px-1.5 lg:px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pago</th>
                    <th className="px-1 sm:px-1.5 lg:px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Pendente</th>
                    <th className="px-1 sm:px-1.5 lg:px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Total</th>
                    <th className="px-1 sm:px-1.5 lg:px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Forma</th>
                    <th className="px-1 sm:px-1.5 lg:px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Cliente</th>
                    <th className="px-1 sm:px-1.5 lg:px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Data</th>
                    <th className="px-1 sm:px-1.5 lg:px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-1 sm:px-1.5 lg:px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vendas.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-1.5 sm:px-2 lg:px-3 py-2.5 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                        #{v.id}
                      </td>
                      <td className="px-1 sm:px-1.5 lg:px-3 py-2.5 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                        {v.produto?.nome || 'N/A'}
                      </td>
                      <td className="px-1 sm:px-1.5 lg:px-3 py-2.5 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                        {v.quantidade}
                      </td>
                      <td className="px-1 sm:px-1.5 lg:px-3 py-2.5 whitespace-nowrap text-xs sm:text-sm font-semibold text-[#10B981]">
                        R$ {getValorPago(v)}
                      </td>
                      <td className="px-1 sm:px-1.5 lg:px-3 py-2.5 whitespace-nowrap text-xs sm:text-sm font-semibold text-[#c33638] hidden sm:table-cell">
                        R$ {v.valorEmAberto || '0.00'}
                      </td>
                      <td className="px-1 sm:px-1.5 lg:px-3 py-2.5 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden md:table-cell">
                        R$ {v.totalExibicao?.toFixed(2) || v.valorTotal.toFixed(2)}
                      </td>
                      <td className="px-1 sm:px-1.5 lg:px-3 py-2.5 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden lg:table-cell">
                        {formatFormaPagamento(v)}
                      </td>
                      <td className="px-1 sm:px-1.5 lg:px-3 py-2.5 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                        {v.cliente?.nome || 'N/A'}
                      </td>
                      <td className="px-1 sm:px-1.5 lg:px-3 py-2.5 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                        {formatDateToBrazil(v.dataVenda)}
                      </td>
                      <td className="px-1 sm:px-1.5 lg:px-3 py-2.5 whitespace-nowrap text-xs">
                        <span className="inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {getStatusVenda(v)}
                        </span>
                      </td>
                      <td className="px-1 sm:px-1.5 lg:px-3 py-2.5 whitespace-nowrap text-xs font-medium space-x-0.5">
                        {v.parcelas && v.parcelas.length > 0 && (
                          <button 
                            onClick={() => openParcelasModal(v)} 
                            className="text-[#394189] hover:text-blue-700 transition-colors"
                            title="Ver Parcelas"
                          >
                            📋
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8 text-sm">Nenhuma venda encontrada. 😔</p>
          )}
        </div>

        {/* MODAL */}
        <ModalGerenciarParcelas
          isOpen={isModalOpen}
          venda={selectedVenda}
          onClose={closeParcelasModal}
          marcarParcelaComoPaga={marcarParcelaComoPaga}
        />
      </div>
    </div>
  );
}
