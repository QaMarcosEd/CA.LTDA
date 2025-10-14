'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { formatPhoneNumber } from '../../../../utils/formatPhoneNumber';
import { format, subDays, parseISO } from 'date-fns';

export default function ModalRegistroBaixa({ isOpen, onClose, produto, onSubmit, onSubmitRefresh }) {
  const [quantidade, setQuantidade] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [apelido, setApelido] = useState('');
  const [telefone, setTelefone] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [dataVenda, setDataVenda] = useState(format(subDays(new Date(), 1), 'yyyy-MM-dd'));
  const [clientes, setClientes] = useState([]);
  const [isNewCliente, setIsNewCliente] = useState(false);
  const [isParcelado, setIsParcelado] = useState(false);
  const [numeroParcelas, setNumeroParcelas] = useState('1');
  const [entrada, setEntrada] = useState('0.00');
  const [formaPagamento, setFormaPagamento] = useState('');
  const [bandeira, setBandeira] = useState('');
  const [modalidade, setModalidade] = useState('');
  const [taxasCartao, setTaxasCartao] = useState([]);
  const [taxa, setTaxa] = useState(0);
  const [valorLiquido, setValorLiquido] = useState(0);
  const [formaPagamentoEntrada, setFormaPagamentoEntrada] = useState('DINHEIRO');

  useEffect(() => {
    if (produto) {
      setValorTotal(produto.precoVenda.toFixed(2));
    }
    if (isOpen) {
      fetch('/api/clientes', { cache: 'no-store' })
        .then((res) => {
          if (!res.ok) throw new Error('Erro ao carregar clientes');
          return res.json();
        })
        .then((data) => setClientes(data))
        .catch((error) => {
          console.error('Erro ao carregar clientes:', error);
          toast.error('Erro ao carregar clientes ❌');
        });
      fetch('/api/taxas-cartao', { cache: 'no-store' })
        .then((res) => {
          if (!res.ok) throw new Error('Erro ao carregar taxas de cartão');
          return res.json();
        })
        .then((data) => setTaxasCartao(data))
        .catch((error) => {
          console.error('Erro ao carregar taxas:', error);
          toast.error('Erro ao carregar taxas de cartão ❌');
        });
    }
  }, [produto, isOpen]);

  useEffect(() => {
    if (produto && quantidade) {
      const qty = parseInt(quantidade, 10);
      if (!isNaN(qty) && qty > 0) {
        const novoValorTotal = (produto.precoVenda * qty).toFixed(2);
        setValorTotal(novoValorTotal);
        if (formaPagamento === 'CARTAO' && bandeira && modalidade) {
          const taxaCartao = taxasCartao.find(
            (t) => t.bandeira === bandeira && t.modalidade === modalidade
          );
          if (taxaCartao) {
            const taxaPercentual = taxaCartao.taxaPercentual / 100;
            const novaTaxa = (parseFloat(novoValorTotal) * taxaPercentual).toFixed(2);
            setTaxa(novaTaxa);
            setValorLiquido((parseFloat(novoValorTotal) - parseFloat(novaTaxa)).toFixed(2));
          } else {
            setTaxa(0);
            setValorLiquido(novoValorTotal);
          }
        } else {
          setTaxa(0);
          setValorLiquido(novoValorTotal);
        }
      }
    }
    if (formaPagamento === 'CARTAO' && modalidade) {
      const isCredito = modalidade.match(/CREDITO_X(\d+)/);
      if (isCredito) {
        const numParcelas = parseInt(isCredito[1], 10) || 1;
        setIsParcelado(true);
        setNumeroParcelas(String(numParcelas));
        setEntrada('0.00');
      } else if (modalidade === 'AVISTA') {
        setIsParcelado(false);
        setNumeroParcelas('1');
        setEntrada(valorTotal || '0.00');
      }
    } else if (['PIX', 'DINHEIRO'].includes(formaPagamento)) {
      setIsParcelado(false);
      setNumeroParcelas('1');
      setEntrada(valorTotal || '0.00');
    } else {
      setNumeroParcelas('1');
      setEntrada('0.00');
    }
  }, [quantidade, produto, formaPagamento, bandeira, modalidade, taxasCartao, valorTotal]);

  const calcularValorParcela = () => {
    if (!valorTotal || !numeroParcelas || numeroParcelas <= 0) return 0;
    const valor = parseFloat(valorTotal) || 0;
    const entradaValor = parseFloat(entrada) || 0;
    if (numeroParcelas === 1) return (valor - entradaValor).toFixed(2);
    const valorRestante = valor - entradaValor;
    const valorBaseParcela = Math.floor((valorRestante / numeroParcelas) * 100) / 100;
    return valorBaseParcela.toFixed(2);
  };

  const handleConfirm = async () => {
    if (!quantidade || parseInt(quantidade) <= 0) {
      toast.error('Digite uma quantidade válida');
      return;
    }
    if (quantidade > produto.quantidade) {
      toast.error('Quantidade maior que o estoque disponível');
      return;
    }
    if (!clienteNome && !isNewCliente) {
      toast.error('Selecione ou digite o nome do cliente');
      return;
    }
    if (!valorTotal || parseFloat(valorTotal) <= 0) {
      toast.error('Digite o valor total');
      return;
    }
    if (!formaPagamento) {
      toast.error('Selecione uma forma de pagamento');
      return;
    }
    if (formaPagamento === 'CARTAO' && (!bandeira || !modalidade)) {
      toast.error('Selecione bandeira e modalidade para pagamento com cartão');
      return;
    }
    if (isParcelado) {
      if (formaPagamento !== 'PROMISSORIA' && !['CREDITO_X2', 'CREDITO_X3', 'CREDITO_X4_6'].includes(modalidade)) {
        toast.error('Parcelamento só é permitido com Promissória ou Cartão (2x, 3x, 4-6x)');
        return;
      }
      const entradaValor = parseFloat(entrada) || 0;
      if (entradaValor > parseFloat(valorTotal)) {
        toast.error('A entrada não pode ser maior que o valor total');
        return;
      }
      if (numeroParcelas < 1 || numeroParcelas > 12) {
        toast.error('Número de parcelas deve ser entre 1 e 12');
        return;
      }
      if (formaPagamento === 'PROMISSORIA' && entradaValor > 0 && !['PIX', 'DINHEIRO'].includes(formaPagamentoEntrada)) {
        toast.error('Forma de pagamento da entrada deve ser PIX ou Dinheiro');
        return;
      }
    } else if (formaPagamento === 'PROMISSORIA' || (formaPagamento === 'CARTAO' && ['CREDITO_X2', 'CREDITO_X3', 'CREDITO_X4_6'].includes(modalidade))) {
      toast.error('Formas Promissória ou Cartão parcelado exigem parcelamento');
      return;
    }

    const [year, month, day] = dataVenda.split('-');
    const selectedDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
    const today = new Date();
    if (selectedDate > today) {
      toast.error('Data de venda não pode ser futura');
      return;
    }

    try {
      let clienteId;
      if (isNewCliente) {
        if (!clienteNome) {
          toast.error('Digite o nome do novo cliente');
          return;
        }
        const res = await fetch('/api/clientes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: clienteNome, apelido, telefone }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Erro ao criar cliente');
        }
        const newCliente = await res.json();
        clienteId = newCliente.id;
      } else {
        const cliente = clientes.find((c) => c.nome === clienteNome);
        if (!cliente) {
          toast.error('Selecione um cliente válido');
          return;
        }
        clienteId = cliente.id;
      }

      const vendaData = {
        produtoId: produto.id,
        quantidade: parseInt(quantidade),
        clienteId,
        clienteNome,
        valorTotal: parseFloat(valorTotal),
        isParcelado,
        numeroParcelas: isParcelado ? parseInt(numeroParcelas) : 1,
        entrada: isParcelado ? parseFloat(entrada) || 0 : parseFloat(valorTotal),
        dataVenda: selectedDate,
        formaPagamento,
        bandeira: formaPagamento === 'CARTAO' ? bandeira : undefined,
        modalidade: formaPagamento === 'CARTAO' ? modalidade : undefined,
        formaPagamentoEntrada: formaPagamento === 'PROMISSORIA' && parseFloat(entrada) > 0 ? formaPagamentoEntrada : undefined,
      };
      console.log('Dados enviados pro onSubmit:', vendaData);
      const response = await onSubmit(vendaData);
      if (!response) {
        throw new Error('Nenhuma resposta recebida do servidor');
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao registrar venda');
      }

      setQuantidade('');
      setClienteNome('');
      setApelido('');
      setTelefone('');
      setValorTotal('');
      setDataVenda(format(subDays(new Date(), 1), 'yyyy-MM-dd'));
      setIsNewCliente(false);
      setIsParcelado(false);
      setNumeroParcelas('1');
      setEntrada('0.00');
      setFormaPagamento('');
      setBandeira('');
      setModalidade('');
      setTaxa(0);
      setValorLiquido(0);
      setFormaPagamentoEntrada('DINHEIRO');
      toast.success('Venda registrada com sucesso! ✅');
      // NOVO: Refetch clientes no pai se callback existir
      if (typeof onSubmitRefresh === 'function') {
        onSubmitRefresh();
      }
      onClose();
    } catch (error) {
      console.error('Erro ao registrar venda:', error);
      toast.error(error.message || 'Erro inesperado ao registrar venda');
    }
  };

  if (!isOpen || !produto) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300 text-gray-500">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full m-4 flex flex-col max-h-[90vh] overflow-hidden transform transition-all duration-300">
        {/* Header estilizado com emoji */}
        <div className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛒</span>
            <h2 className="text-2xl font-bold font-poppins">Registrar Venda - {produto.nome}</h2>
          </div>
          <button onClick={onClose} aria-label="Fechar modal" className="text-white hover:text-gray-200 transition text-2xl">
            ❌
          </button>
        </div>

        {/* Conteúdo com scroll - Labels flutuantes padronizados */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-6">
          {/* Infos produto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 font-poppins text-sm bg-white p-4 rounded-lg shadow-inner border border-gray-200">
            <p>Estoque atual: <span className="font-bold text-green-600">{produto.quantidade}</span></p>
            <p>Preço unitário: <span className="font-bold text-green-600">R$ {produto.precoVenda.toFixed(2)}</span></p>
          </div>

          {/* Quantidade */}
          <div className="relative">
            <input
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              placeholder=" "
              min="1"
              max={produto.quantidade}
              className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-transparent font-poppins text-sm"
            />
            <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-green-500">
              Quantidade <span className="text-red-500 ml-1">*</span>
            </label>
          </div>

          {/* Cliente - Com sub-inputs */}
          <div className="space-y-3">
            <div className="relative">
              {!isNewCliente ? (
                <select
                  value={clienteNome}
                  onChange={(e) => setClienteNome(e.target.value)}
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 font-poppins text-sm"
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.nome}>{cliente.nome}</option>
                  ))}
                </select>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={clienteNome}
                      onChange={(e) => setClienteNome(e.target.value)}
                      placeholder=" "
                      className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-transparent font-poppins text-sm"
                    />
                    <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-green-500">
                      Nome do novo cliente <span className="text-red-500 ml-1">*</span>
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={apelido}
                      onChange={(e) => setApelido(e.target.value)}
                      placeholder=" "
                      className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-transparent font-poppins text-sm"
                    />
                    <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-green-500">
                      Apelido (opcional)
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={telefone}
                      onChange={(e) => setTelefone(formatPhoneNumber(e.target.value))}
                      placeholder=" "
                      className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-transparent font-poppins text-sm"
                    />
                    <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-green-500">
                      (11) 99999-9999
                    </label>
                  </div>
                </div>
              )}
              <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-green-500">
                Cliente <span className="text-red-500 ml-1">*</span>
              </label>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsNewCliente(!isNewCliente);
                if (!isNewCliente) {
                  setClienteNome('');
                  setApelido('');
                  setTelefone('');
                }
              }}
              className="text-green-600 hover:text-green-800 font-poppins text-sm font-medium transition"
            >
              {isNewCliente ? 'Selecionar cliente existente' : 'Cadastrar novo cliente'}
            </button>
          </div>

          {/* Valor Total */}
          <div className="relative">
            <input
              type="number"
              step="0.01"
              value={valorTotal}
              onChange={(e) => setValorTotal(e.target.value)}
              placeholder=" "
              className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-transparent font-poppins text-sm"
            />
            <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-green-500">
              Valor Total (R$) <span className="text-red-500 ml-1">*</span>
            </label>
          </div>

          {/* Forma de Pagamento */}
          <div className="relative">
            <select
              value={formaPagamento}
              onChange={(e) => {
                setFormaPagamento(e.target.value);
                setBandeira('');
                setModalidade('');
                setTaxa(0);
                setValorLiquido(valorTotal || 0);
                setFormaPagamentoEntrada('DINHEIRO');
              }}
              className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 font-poppins text-sm"
            >
              <option value="">Selecione a forma</option>
              <option value="DINHEIRO">Dinheiro à vista</option>
              <option value="PIX">Pix à vista</option>
              <option value="CARTAO">Cartão</option>
              <option value="PROMISSORIA">Promissória</option>
            </select>
            <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-green-500">
              Forma de Pagamento <span className="text-red-500 ml-1">*</span>
            </label>
          </div>

          {/* Cartão */}
          {formaPagamento === 'CARTAO' && (
            <div className="space-y-5 bg-white p-4 rounded-lg shadow-inner border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="relative">
                  <select
                    value={bandeira}
                    onChange={(e) => {
                      setBandeira(e.target.value);
                      setModalidade('');
                      setTaxa(0);
                      setValorLiquido(valorTotal || 0);
                    }}
                    className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 font-poppins text-sm"
                  >
                    <option value="">Selecione a bandeira</option>
                    {[...new Set(taxasCartao.map((t) => t.bandeira))].map((band) => (
                      <option key={band} value={band}>{band}</option>
                    ))}
                  </select>
                  <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-green-500">
                    Bandeira <span className="text-red-500 ml-1">*</span>
                  </label>
                </div>
                {bandeira && (
                  <div className="relative">
                    <select
                      value={modalidade}
                      onChange={(e) => {
                        setModalidade(e.target.value);
                        const taxaCartao = taxasCartao.find(
                          (t) => t.bandeira === bandeira && t.modalidade === e.target.value
                        );
                        if (taxaCartao && valorTotal) {
                          const taxaPercentual = taxaCartao.taxaPercentual / 100;
                          const novaTaxa = (parseFloat(valorTotal) * taxaPercentual).toFixed(2);
                          setTaxa(novaTaxa);
                          setValorLiquido((parseFloat(valorTotal) - parseFloat(novaTaxa)).toFixed(2));
                        } else {
                          setTaxa(0);
                          setValorLiquido(valorTotal || 0);
                        }
                      }}
                      className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 font-poppins text-sm"
                    >
                      <option value="">Selecione a modalidade</option>
                      {taxasCartao
                        .filter((t) => t.bandeira === bandeira)
                        .map((t) => (
                          <option key={t.modalidade} value={t.modalidade}>
                            {t.modalidade.replace('_', ' ').toLowerCase()}
                          </option>
                        ))}
                    </select>
                    <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-green-500">
                      Modalidade <span className="text-red-500 ml-1">*</span>
                    </label>
                  </div>
                )}
              </div>
              {taxa > 0 && (
                <p className="text-sm font-poppins text-gray-600">
                  Taxa: <span className="font-bold">R$ {taxa}</span> | Valor Líquido: <span className="font-bold">R$ {valorLiquido}</span>
                </p>
              )}
            </div>
          )}

          {/* Data da Venda */}
          <div className="relative">
            <input
              type="date"
              value={dataVenda}
              onChange={(e) => setDataVenda(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 font-poppins text-sm"
            />
            <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-green-500">
              Data da Venda <span className="text-red-500 ml-1">*</span>
            </label>
            <p className="text-sm font-poppins text-gray-600 mt-3">
              Data selecionada: <span className="font-medium">{format(parseISO(dataVenda), 'dd/MM/yyyy')}</span>
            </p>
          </div>

          {/* Promissória */}
          {formaPagamento === 'PROMISSORIA' && (
            <div className="space-y-5 bg-white p-4 rounded-lg shadow-inner border border-gray-200">
              <label className="flex items-center text-sm font-medium font-poppins text-gray-700">
                <input
                  type="checkbox"
                  checked={isParcelado}
                  onChange={(e) => setIsParcelado(e.target.checked)}
                  className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                Pagar em parcelas
              </label>
              {isParcelado && (
                <div className="space-y-5">
                  <div className="relative">
                    <select
                      value={numeroParcelas}
                      onChange={(e) => setNumeroParcelas(e.target.value)}
                      className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 font-poppins text-sm"
                    >
                      {[...Array(12).keys()].map((i) => (
                        <option key={i + 1} value={String(i + 1)}>{i + 1}</option>
                      ))}
                    </select>
                    <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-green-500">
                      Número de Parcelas <span className="text-red-500 ml-1">*</span>
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={entrada}
                      onChange={(e) => setEntrada(e.target.value)}
                      placeholder=" "
                      className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-transparent font-poppins text-sm"
                    />
                    <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-green-500">
                      Entrada (R$)
                    </label>
                  </div>
                  {parseFloat(entrada) > 0 && (
                    <div className="relative">
                      <select
                        value={formaPagamentoEntrada}
                        onChange={(e) => setFormaPagamentoEntrada(e.target.value)}
                        className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 font-poppins text-sm"
                      >
                        <option value="DINHEIRO">Dinheiro</option>
                        <option value="PIX">Pix</option>
                      </select>
                      <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-green-500">
                        Forma de Pagamento da Entrada
                      </label>
                      <p className="text-xs font-poppins text-gray-500 mt-3">Entrada deve ser paga em PIX ou Dinheiro</p>
                    </div>
                  )}
                  <p className="text-sm font-poppins text-gray-600">
                    Valor por parcela: <span className="font-bold">R$ {calcularValorParcela()}</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer com botões e emojis */}
        <div className="p-6 bg-white border-t border-gray-200 flex gap-4">
          <button
            onClick={onClose}
            aria-label="Cancelar venda"
            className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-400 transition-all duration-200 flex items-center justify-center gap-2 shadow-md text-sm md:text-base font-poppins"
          >
            ❌ Cancelar
          </button>
          <button
            onClick={handleConfirm}
            aria-label="Confirmar venda"
            className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-md text-sm md:text-base font-poppins"
          >
            ✅ Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}


