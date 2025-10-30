// src/components/modals/ModalGerenciarParcelas.js
'use client';
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function ModalGerenciarParcelas({ isOpen, venda, onClose, marcarParcelaComoPaga }) {
  const [taxasCartao, setTaxasCartao] = useState([]);
  const [formasPagamento, setFormasPagamento] = useState({});
  const [loadingTaxas, setLoadingTaxas] = useState(false);

  // CARREGA TAXAS UMA VEZ SÓ
  const carregarTaxas = useCallback(async () => {
    if (loadingTaxas || taxasCartao.length > 0) return;
    setLoadingTaxas(true);
    try {
      const res = await fetch('/api/taxas-cartao', { cache: 'no-store' });
      if (!res.ok) throw new Error('Erro ao carregar taxas');
      const data = await res.json();
      setTaxasCartao(data);
    } catch (error) {
      console.error('Erro ao carregar taxas:', error);
      toast.error('Erro ao carregar taxas de cartão');
    } finally {
      setLoadingTaxas(false);
    }
  }, [loadingTaxas, taxasCartao.length]);

  // INICIALIZA FORMAS DE PAGAMENTO
  useEffect(() => {
    if (!isOpen || !venda?.parcelas) {
      setFormasPagamento({});
      return;
    }

    const initial = {};
    venda.parcelas.forEach((parcela) => {
      const isCartao = parcela.formaPagamento?.startsWith('CARTAO_');
      if (isCartao) {
        const [_, bandeira, modalidade] = parcela.formaPagamento.split('_');
        const valorPendente = parcela.valorLiquido - (parcela.valorPago || 0);
        let taxa = 0;
        let valorLiquido = valorPendente;

        const taxaCartao = taxasCartao.find(t => t.bandeira === bandeira && t.modalidade === modalidade);
        if (taxaCartao) {
          const percentual = taxaCartao.taxaPercentual / 100;
          taxa = (valorPendente * percentual).toFixed(2);
          valorLiquido = (valorPendente - parseFloat(taxa)).toFixed(2);
        }

        initial[parcela.id] = { forma: 'CARTAO', bandeira, modalidade, taxa, valorLiquido };
      } else {
        initial[parcela.id] = { forma: 'PROMISSORIA', bandeira: '', modalidade: '', taxa: 0, valorLiquido: 0 };
      }
    });
    setFormasPagamento(initial);
  }, [isOpen, venda, taxasCartao]);

  // ABRE MODAL → CARREGA TAXAS (SÓ UMA VEZ)
  useEffect(() => {
    if (isOpen) {
      carregarTaxas();
    }
  }, [isOpen, carregarTaxas]);

  const handleFormaPagamentoChange = (parcelaId, forma, bandeira, modalidade, valorPago) => {
    setFormasPagamento(prev => {
      const valor = parseFloat(valorPago) || 0;
      let taxa = 0;
      let valorLiquido = valor;

      if (forma === 'CARTAO' && bandeira && modalidade) {
        const taxaCartao = taxasCartao.find(t => t.bandeira === bandeira && t.modalidade === modalidade);
        if (taxaCartao) {
          const percentual = taxaCartao.taxaPercentual / 100;
          taxa = (valor * percentual).toFixed(2);
          valorLiquido = (valor - parseFloat(taxa)).toFixed(2);
        }
      }

      return {
        ...prev,
        [parcelaId]: { forma, bandeira, modalidade, taxa, valorLiquido }
      };
    });
  };

  if (!isOpen || !venda) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-gray-600">
      <div className="bg-white rounded-xl p-4 w-11/12 max-w-lg max-h-[90vh] overflow-y-auto shadow-lg">
        <h2 className="text-xl font-bold font-poppins text-gray-900 mb-4">
          Parcelas da Venda #{venda.id}
        </h2>
        <p className="text-xs sm:text-sm font-poppins text-gray-500 mb-2">
          Entrada: R$ {venda.entrada.toFixed(2)} {venda.formaPagamentoEntrada ? `(${venda.formaPagamentoEntrada.toLowerCase()})` : ''}
        </p>
        <p className="text-xs sm:text-sm font-poppins text-gray-500 mb-4">
          Forma: {venda.formaPagamento?.replace('CARTAO_', '').replace('_', ' ').toLowerCase() || 'N/A'}
        </p>

        <div className="space-y-3">
          {venda.parcelas.map((parcela) => {
            const isCartao = parcela.formaPagamento?.startsWith('CARTAO_');
            const formaAtual = formasPagamento[parcela.id]?.forma || (isCartao ? 'CARTAO' : 'PROMISSORIA');
            const bandeira = isCartao ? parcela.formaPagamento.split('_')[1] : formasPagamento[parcela.id]?.bandeira || '';
            const modalidade = isCartao ? parcela.formaPagamento.split('_')[2] : formasPagamento[parcela.id]?.modalidade || '';

            return (
              <div key={parcela.id} className="border-b border-gray-200 pb-3">
                <p className="text-xs sm:text-sm font-semibold font-poppins text-gray-700">
                  Parcela {parcela.numeroParcela}: R$ {parcela.valor.toFixed(2)}
                  {' '}({new Date(parcela.dataVencimento).toLocaleDateString('pt-BR')})
                </p>
                <p className="text-xs sm:text-sm font-poppins text-gray-700">
                  Status: <span className={parcela.pago ? 'text-green-600' : 'text-red-600'}>
                    {parcela.pago ? 'Pago' : 'Pendente'}
                  </span>
                </p>

                {parcela.pago ? (
                  <>
                    <p className="text-xs sm:text-sm font-poppins text-gray-600">
                      Pago: R$ {parcela.valorPago.toFixed(2)}
                    </p>
                    <p className="text-xs sm:text-sm font-poppins text-gray-600">
                      Forma: {parcela.formaPagamento?.replace('CARTAO_', '').replace('_', ' ').toLowerCase() || 'N/A'}
                    </p>
                    {parcela.taxa > 0 && (
                      <p className="text-xs sm:text-sm font-poppins text-gray-600">
                        Taxa: R$ {parcela.taxa.toFixed(2)} | Líquido: R$ {parcela.valorLiquido.toFixed(2)}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="mt-2 space-y-2">
                    <p className="text-xs sm:text-sm font-semibold font-poppins text-gray-700">
                      Pendente bruto: R$ {(parcela.valor - (parcela.valorPago || 0)).toFixed(2)}
                    </p>
                    <p className="text-xs sm:text-sm font-poppins text-gray-600">
                      Pendente líquido: R$ {(parcela.valorLiquido - (parcela.valorPago || 0)).toFixed(2)}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="0.01"
                        defaultValue={(parcela.valorLiquido - (parcela.valorPago || 0)).toFixed(2)}
                        placeholder="Valor a pagar"
                        className="border border-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-poppins text-xs sm:text-sm w-full transition-all"
                        id={`valorPago-${parcela.id}`}
                        onChange={(e) => handleFormaPagamentoChange(
                          parcela.id,
                          formaAtual,
                          bandeira,
                          modalidade,
                          e.target.value
                        )}
                      />

                      {isCartao ? (
                        <p className="text-xs sm:text-sm font-poppins text-gray-600">
                          Cartão: {bandeira} {modalidade}
                        </p>
                      ) : (
                        <select
                          className="border border-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-poppins text-xs sm:text-sm w-full transition-all"
                          value={formaAtual}
                          onChange={(e) => handleFormaPagamentoChange(
                            parcela.id,
                            e.target.value,
                            formasPagamento[parcela.id]?.bandeira || '',
                            formasPagamento[parcela.id]?.modalidade || '',
                            document.getElementById(`valorPago-${parcela.id}`).value
                          )}
                        >
                          <option value="DINHEIRO">Dinheiro</option>
                          <option value="PIX">Pix</option>
                          <option value="CARTAO">Cartão</option>
                        </select>
                      )}
                    </div>

                    {formaAtual === 'CARTAO' && !isCartao && (
                      <>
                        <select
                          className="border border-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-poppins text-xs sm:text-sm w-full transition-all"
                          onChange={(e) => handleFormaPagamentoChange(
                            parcela.id,
                            'CARTAO',
                            e.target.value,
                            formasPagamento[parcela.id]?.modalidade || '',
                            document.getElementById(`valorPago-${parcela.id}`).value
                          )}
                        >
                          <option value="">Bandeira</option>
                          {[...new Set(taxasCartao.map(t => t.bandeira))].map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>

                        {formasPagamento[parcela.id]?.bandeira && (
                          <select
                            className="border border-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-poppins text-xs sm:text-sm w-full transition-all"
                            onChange={(e) => handleFormaPagamentoChange(
                              parcela.id,
                              'CARTAO',
                              formasPagamento[parcela.id]?.bandeira,
                              e.target.value,
                              document.getElementById(`valorPago-${parcela.id}`).value
                            )}
                          >
                            <option value="">Modalidade</option>
                            {taxasCartao
                              .filter(t => t.bandeira === formasPagamento[parcela.id]?.bandeira)
                              .map(t => (
                                <option key={t.modalidade} value={t.modalidade}>
                                  {t.modalidade.replace('_', ' ').toLowerCase()}
                                </option>
                              ))}
                          </select>
                        )}
                      </>
                    )}

                    {formasPagamento[parcela.id]?.taxa > 0 && (
                      <p className="text-xs sm:text-sm font-poppins text-gray-600">
                        Taxa: R$ {formasPagamento[parcela.id].taxa} | Líquido: R$ {formasPagamento[parcela.id].valorLiquido}
                      </p>
                    )}

                    <input
                      type="text"
                      placeholder="Observação"
                      className="border border-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-poppins text-xs sm:text-sm w-full transition-all"
                      id={`observacao-${parcela.id}`}
                    />
                    <input
                      type="date"
                      max={format(new Date(), 'yyyy-MM-dd')}
                      defaultValue={format(new Date(), 'yyyy-MM-dd')}
                      className="border border-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-poppins text-xs sm:text-sm w-full transition-all"
                      id={`dataPagamento-${parcela.id}`}
                    />

                    <button
                      onClick={() => {
                        const valorPago = document.getElementById(`valorPago-${parcela.id}`).value;
                        const observacao = document.getElementById(`observacao-${parcela.id}`).value;
                        const dataPagamento = document.getElementById(`dataPagamento-${parcela.id}`).value;
                        const forma = formaAtual;
                        const bandeiraFinal = isCartao ? bandeira : formasPagamento[parcela.id]?.bandeira;
                        const modalidadeFinal = isCartao ? modalidade : formasPagamento[parcela.id]?.modalidade;

                        if (!valorPago || parseFloat(valorPago) <= 0) return toast.error('Valor inválido');
                        if (parseFloat(valorPago) > (parcela.valorLiquido - (parcela.valorPago || 0))) {
                          return toast.error('Valor excede o pendente');
                        }
                        if (!forma) return toast.error('Selecione a forma');
                        if (forma === 'CARTAO' && (!bandeiraFinal || !modalidadeFinal)) {
                          return toast.error('Selecione bandeira e modalidade');
                        }
                        if (!dataPagamento) return toast.error('Selecione a data');

                        marcarParcelaComoPaga(
                          parcela.id,
                          parseFloat(valorPago),
                          observacao || null,
                          forma,
                          bandeiraFinal,
                          modalidadeFinal,
                          dataPagamento
                        );
                      }}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 font-poppins text-xs sm:text-sm w-full transition-all"
                    >
                      Confirmar Recebimento
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="sticky bottom-0 bg-white pt-4 flex justify-end">
          <button
            onClick={() => {
              onClose();
              setFormasPagamento({});
            }}
            className="bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 px-4 py-2 rounded-lg hover:from-gray-400 hover:to-gray-500 font-poppins text-xs sm:text-sm transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
