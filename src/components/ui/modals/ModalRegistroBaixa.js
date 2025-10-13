// 'use client';

// import { useState, useEffect } from 'react';
// import toast from 'react-hot-toast';
// import { formatPhoneNumber } from '../../../../utils/formatPhoneNumber';
// import { format, subDays, parseISO } from 'date-fns';

// export default function ModalRegistroBaixa({ isOpen, onClose, produto, onSubmit }) {
//   const [quantidade, setQuantidade] = useState('');
//   const [clienteNome, setClienteNome] = useState('');
//   const [apelido, setApelido] = useState('');
//   const [telefone, setTelefone] = useState('');
//   const [valorTotal, setValorTotal] = useState('');
//   const [dataVenda, setDataVenda] = useState(format(subDays(new Date(), 1), 'yyyy-MM-dd'));
//   const [clientes, setClientes] = useState([]);
//   const [isNewCliente, setIsNewCliente] = useState(false);
//   const [isParcelado, setIsParcelado] = useState(false);
//   const [numeroParcelas, setNumeroParcelas] = useState('1');
//   const [entrada, setEntrada] = useState('0.00');
//   const [formaPagamento, setFormaPagamento] = useState('');
//   const [bandeira, setBandeira] = useState('');
//   const [modalidade, setModalidade] = useState('');
//   const [taxasCartao, setTaxasCartao] = useState([]);
//   const [taxa, setTaxa] = useState(0);
//   const [valorLiquido, setValorLiquido] = useState(0);
//   const [formaPagamentoEntrada, setFormaPagamentoEntrada] = useState('DINHEIRO');

//   useEffect(() => {
//     if (produto) {
//       setValorTotal(produto.precoVenda.toFixed(2));
//     }
//     if (isOpen) {
//       fetch('/api/clientes', { cache: 'no-store' })
//         .then((res) => {
//           if (!res.ok) throw new Error('Erro ao carregar clientes');
//           return res.json();
//         })
//         .then((data) => setClientes(data))
//         .catch((error) => {
//           console.error('Erro ao carregar clientes:', error);
//           toast.error('Erro ao carregar clientes ❌');
//         });
//       fetch('/api/taxas-cartao', { cache: 'no-store' })
//         .then((res) => {
//           if (!res.ok) throw new Error('Erro ao carregar taxas de cartão');
//           return res.json();
//         })
//         .then((data) => setTaxasCartao(data))
//         .catch((error) => {
//           console.error('Erro ao carregar taxas:', error);
//           toast.error('Erro ao carregar taxas de cartão ❌');
//         });
//     }
//   }, [produto, isOpen]);

//   useEffect(() => {
//     if (produto && quantidade) {
//       const qty = parseInt(quantidade, 10);
//       if (!isNaN(qty) && qty > 0) {
//         const novoValorTotal = (produto.precoVenda * qty).toFixed(2);
//         setValorTotal(novoValorTotal);
//         if (formaPagamento === 'CARTAO' && bandeira && modalidade) {
//           const taxaCartao = taxasCartao.find(
//             (t) => t.bandeira === bandeira && t.modalidade === modalidade
//           );
//           if (taxaCartao) {
//             const taxaPercentual = taxaCartao.taxaPercentual / 100;
//             const novaTaxa = (parseFloat(novoValorTotal) * taxaPercentual).toFixed(2);
//             setTaxa(novaTaxa);
//             setValorLiquido((parseFloat(novoValorTotal) - parseFloat(novaTaxa)).toFixed(2));
//           } else {
//             setTaxa(0);
//             setValorLiquido(novoValorTotal);
//           }
//         } else {
//           setTaxa(0);
//           setValorLiquido(novoValorTotal);
//         }
//       }
//     }
//     if (formaPagamento === 'CARTAO' && modalidade) {
//       const isCredito = modalidade.match(/CREDITO_X(\d+)/);
//       if (isCredito) {
//         const numParcelas = parseInt(isCredito[1], 10) || 1;
//         setIsParcelado(true);
//         setNumeroParcelas(String(numParcelas));
//         setEntrada('0.00');
//       } else if (modalidade === 'AVISTA') {
//         setIsParcelado(false);
//         setNumeroParcelas('1');
//         setEntrada(valorTotal || '0.00');
//       }
//     } else if (['PIX', 'DINHEIRO'].includes(formaPagamento)) {
//       setIsParcelado(false);
//       setNumeroParcelas('1');
//       setEntrada(valorTotal || '0.00');
//     } else {
//       setNumeroParcelas('1');
//       setEntrada('0.00');
//     }
//   }, [quantidade, produto, formaPagamento, bandeira, modalidade, taxasCartao, valorTotal]);

//   const calcularValorParcela = () => {
//     if (!valorTotal || !numeroParcelas || numeroParcelas <= 0) return 0;
//     const valor = parseFloat(valorTotal) || 0;
//     const entradaValor = parseFloat(entrada) || 0;
//     if (numeroParcelas === 1) return (valor - entradaValor).toFixed(2);
//     const valorRestante = valor - entradaValor;
//     const valorBaseParcela = Math.floor((valorRestante / numeroParcelas) * 100) / 100;
//     return valorBaseParcela.toFixed(2);
//   };

//   const handleConfirm = async () => {
//     if (!quantidade || parseInt(quantidade) <= 0) {
//       toast.error('Digite uma quantidade válida');
//       return;
//     }
//     if (quantidade > produto.quantidade) {
//       toast.error('Quantidade maior que o estoque disponível');
//       return;
//     }
//     if (!clienteNome && !isNewCliente) {
//       toast.error('Selecione ou digite o nome do cliente');
//       return;
//     }
//     if (!valorTotal || parseFloat(valorTotal) <= 0) {
//       toast.error('Digite o valor total');
//       return;
//     }
//     if (!formaPagamento) {
//       toast.error('Selecione uma forma de pagamento');
//       return;
//     }
//     if (formaPagamento === 'CARTAO' && (!bandeira || !modalidade)) {
//       toast.error('Selecione bandeira e modalidade para pagamento com cartão');
//       return;
//     }
//     if (isParcelado) {
//       if (formaPagamento !== 'PROMISSORIA' && !['CREDITO_X2', 'CREDITO_X3', 'CREDITO_X4_6'].includes(modalidade)) {
//         toast.error('Parcelamento só é permitido com Promissória ou Cartão (2x, 3x, 4-6x)');
//         return;
//       }
//       const entradaValor = parseFloat(entrada) || 0;
//       if (entradaValor > parseFloat(valorTotal)) {
//         toast.error('A entrada não pode ser maior que o valor total');
//         return;
//       }
//       if (numeroParcelas < 1 || numeroParcelas > 12) {
//         toast.error('Número de parcelas deve ser entre 1 e 12');
//         return;
//       }
//       if (formaPagamento === 'PROMISSORIA' && entradaValor > 0 && !['PIX', 'DINHEIRO'].includes(formaPagamentoEntrada)) {
//         toast.error('Forma de pagamento da entrada deve ser PIX ou Dinheiro');
//         return;
//       }
//     } else if (formaPagamento === 'PROMISSORIA' || (formaPagamento === 'CARTAO' && ['CREDITO_X2', 'CREDITO_X3', 'CREDITO_X4_6'].includes(modalidade))) {
//       toast.error('Formas Promissória ou Cartão parcelado exigem parcelamento');
//       return;
//     }

//     const [year, month, day] = dataVenda.split('-');
//     const selectedDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
//     const today = new Date();
//     if (selectedDate > today) {
//       toast.error('Data de venda não pode ser futura');
//       return;
//     }

//     try {
//       let clienteId;
//       if (isNewCliente) {
//         if (!clienteNome) {
//           toast.error('Digite o nome do novo cliente');
//           return;
//         }
//         const res = await fetch('/api/clientes', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ nome: clienteNome, apelido, telefone }), // Não inclui ultimaCompra ou frequenciaCompras
//         });
//         if (!res.ok) {
//           const errorData = await res.json();
//           throw new Error(errorData.error || 'Erro ao criar cliente');
//         }
//         const newCliente = await res.json();
//         clienteId = newCliente.id;
//       } else {
//         const cliente = clientes.find((c) => c.nome === clienteNome);
//         if (!cliente) {
//           toast.error('Selecione um cliente válido');
//           return;
//         }
//         clienteId = cliente.id;
//       }

//       const vendaData = {
//         produtoId: produto.id,
//         quantidade: parseInt(quantidade),
//         clienteId,
//         clienteNome,
//         valorTotal: parseFloat(valorTotal),
//         isParcelado,
//         numeroParcelas: isParcelado ? parseInt(numeroParcelas) : 1,
//         entrada: isParcelado ? parseFloat(entrada) || 0 : parseFloat(valorTotal),
//         dataVenda: selectedDate,
//         formaPagamento,
//         bandeira: formaPagamento === 'CARTAO' ? bandeira : undefined,
//         modalidade: formaPagamento === 'CARTAO' ? modalidade : undefined,
//         formaPagamentoEntrada: formaPagamento === 'PROMISSORIA' && parseFloat(entrada) > 0 ? formaPagamentoEntrada : undefined,
//       };
//       console.log('Dados enviados pro onSubmit:', vendaData);
//       const response = await onSubmit(vendaData);
//       if (!response) {
//         throw new Error('Nenhuma resposta recebida do servidor');
//       }
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Erro ao registrar venda');
//       }

//       setQuantidade('');
//       setClienteNome('');
//       setApelido('');
//       setTelefone('');
//       setValorTotal('');
//       setDataVenda(format(subDays(new Date(), 1), 'yyyy-MM-dd'));
//       setIsNewCliente(false);
//       setIsParcelado(false);
//       setNumeroParcelas('1');
//       setEntrada('0.00');
//       setFormaPagamento('');
//       setBandeira('');
//       setModalidade('');
//       setTaxa(0);
//       setValorLiquido(0);
//       setFormaPagamentoEntrada('DINHEIRO');
//       toast.success('Venda registrada com sucesso! ✅');
//       onClose();
//     } catch (error) {
//       console.error('Erro ao registrar venda:', error);
//       toast.error(error.message || 'Erro inesperado ao registrar venda');
//     }
//   };

//   if (!isOpen || !produto) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-gray-600">
//       <div className="bg-white rounded-lg p-4 w-11/12 max-w-md max-h-[90vh] overflow-y-auto relative">
//         <h2 className="text-xl font-bold font-poppins text-gray-900 mb-4">
//           Registrar Venda - {produto.nome}
//         </h2>
//         <p className="text-gray-600 font-poppins text-sm mb-2">
//           Estoque atual: {produto.quantidade}
//         </p>
//         <p className="text-gray-600 font-poppins text-sm mb-4">
//           Preço do produto: R$ {produto.precoVenda.toFixed(2)}
//         </p>

//         <div className="mb-4">
//           <label className="block text-sm font-medium font-poppins text-gray-700">
//             Quantidade
//           </label>
//           <input
//             type="number"
//             value={quantidade}
//             onChange={(e) => setQuantidade(e.target.value)}
//             placeholder="Quantidade a vender"
//             min="1"
//             max={produto.quantidade}
//             className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
//           />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm font-medium font-poppins text-gray-700">
//             Cliente
//           </label>
//           {!isNewCliente ? (
//             <select
//               value={clienteNome}
//               onChange={(e) => setClienteNome(e.target.value)}
//               className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
//             >
//               <option value="">Selecione um cliente</option>
//               {clientes.map((cliente) => (
//                 <option key={cliente.id} value={cliente.nome}>
//                   {cliente.nome}
//                 </option>
//               ))}
//             </select>
//           ) : (
//             <div className="space-y-2">
//               <input
//                 type="text"
//                 value={clienteNome}
//                 onChange={(e) => setClienteNome(e.target.value)}
//                 placeholder="Nome do novo cliente"
//                 className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
//               />
//               <input
//                 type="text"
//                 value={apelido}
//                 onChange={(e) => setApelido(e.target.value)}
//                 placeholder="Apelido (opcional)"
//                 className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
//               />
//               <input
//                 type="text"
//                 value={telefone}
//                 onChange={(e) => setTelefone(formatPhoneNumber(e.target.value))}
//                 placeholder="(11) 99999-9999"
//                 className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
//               />
//             </div>
//           )}
//           <button
//             type="button"
//             onClick={() => {
//               setIsNewCliente(!isNewCliente);
//               if (!isNewCliente) {
//                 setClienteNome('');
//                 setApelido('');
//                 setTelefone('');
//               }
//             }}
//             className="mt-2 text-blue-600 hover:text-blue-800 font-poppins text-sm"
//           >
//             {isNewCliente ? 'Selecionar cliente existente' : 'Cadastrar novo cliente'}
//           </button>
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm font-medium font-poppins text-gray-700">
//             Valor Total
//           </label>
//           <input
//             type="number"
//             step="0.01"
//             value={valorTotal}
//             onChange={(e) => setValorTotal(e.target.value)}
//             placeholder="Valor total (R$)"
//             className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
//           />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm font-medium font-poppins text-gray-700">
//             Forma de Pagamento
//           </label>
//           <select
//             value={formaPagamento}
//             onChange={(e) => {
//               setFormaPagamento(e.target.value);
//               setBandeira('');
//               setModalidade('');
//               setTaxa(0);
//               setValorLiquido(valorTotal || 0);
//               setFormaPagamentoEntrada('DINHEIRO');
//             }}
//             className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
//           >
//             <option value="">Selecione a forma</option>
//             <option value="DINHEIRO">Dinheiro à vista</option>
//             <option value="PIX">Pix à vista</option>
//             <option value="CARTAO">Cartão</option>
//             <option value="PROMISSORIA">Promissória</option>
//           </select>
//         </div>

//         {formaPagamento === 'CARTAO' && (
//           <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium font-poppins text-gray-700">
//                 Bandeira
//               </label>
//               <select
//                 value={bandeira}
//                 onChange={(e) => {
//                   setBandeira(e.target.value);
//                   setModalidade('');
//                   setTaxa(0);
//                   setValorLiquido(valorTotal || 0);
//                 }}
//                 className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
//               >
//                 <option value="">Selecione a bandeira</option>
//                 {[...new Set(taxasCartao.map((t) => t.bandeira))].map((band) => (
//                   <option key={band} value={band}>{band}</option>
//                 ))}
//               </select>
//             </div>
//             {bandeira && (
//               <div>
//                 <label className="block text-sm font-medium font-poppins text-gray-700">
//                   Modalidade
//                 </label>
//                 <select
//                   value={modalidade}
//                   onChange={(e) => {
//                     setModalidade(e.target.value);
//                     const taxaCartao = taxasCartao.find(
//                       (t) => t.bandeira === bandeira && t.modalidade === e.target.value
//                     );
//                     if (taxaCartao && valorTotal) {
//                       const taxaPercentual = taxaCartao.taxaPercentual / 100;
//                       const novaTaxa = (parseFloat(valorTotal) * taxaPercentual).toFixed(2);
//                       setTaxa(novaTaxa);
//                       setValorLiquido((parseFloat(valorTotal) - parseFloat(novaTaxa)).toFixed(2));
//                     } else {
//                       setTaxa(0);
//                       setValorLiquido(valorTotal || 0);
//                     }
//                   }}
//                   className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
//                 >
//                   <option value="">Selecione a modalidade</option>
//                   {taxasCartao
//                     .filter((t) => t.bandeira === bandeira)
//                     .map((t) => (
//                       <option key={t.modalidade} value={t.modalidade}>
//                         {t.modalidade.replace('_', ' ').toLowerCase()}
//                       </option>
//                     ))}
//                 </select>
//               </div>
//             )}
//             {taxa > 0 && (
//               <p className="text-sm font-poppins text-gray-600 col-span-2">
//                 Taxa: R$ {taxa} | Valor Líquido: R$ {valorLiquido}
//               </p>
//             )}
//           </div>
//         )}

//         <div className="mb-4">
//           <label className="block text-sm font-medium font-poppins text-gray-700">
//             Data da Venda
//           </label>
//           <input
//             type="date"
//             value={dataVenda}
//             onChange={(e) => setDataVenda(e.target.value)}
//             max={format(new Date(), 'yyyy-MM-dd')}
//             className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
//           />
//           <p className="text-sm font-poppins text-gray-600 mt-1">
//             Data selecionada: {format(parseISO(dataVenda), 'dd/MM/yyyy')}
//           </p>
//         </div>

//         {formaPagamento === 'PROMISSORIA' && (
//           <div className="mb-4">
//             <label className="flex items-center text-sm font-medium font-poppins text-gray-700">
//               <input
//                 type="checkbox"
//                 checked={isParcelado}
//                 onChange={(e) => setIsParcelado(e.target.checked)}
//                 className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//               />
//               Pagar em parcelas
//             </label>
//             {isParcelado && (
//               <div className="mt-2 space-y-2">
//                 <div>
//                   <label className="block text-sm font-medium font-poppins text-gray-700">
//                     Número de Parcelas
//                   </label>
//                   <select
//                     value={numeroParcelas}
//                     onChange={(e) => setNumeroParcelas(e.target.value)}
//                     className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
//                   >
//                     {[...Array(12).keys()].map((i) => (
//                       <option key={i + 1} value={String(i + 1)}>
//                         {i + 1}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium font-poppins text-gray-700">
//                     Entrada (R$)
//                   </label>
//                   <input
//                     type="number"
//                     step="0.01"
//                     value={entrada}
//                     onChange={(e) => setEntrada(e.target.value)}
//                     placeholder="0.00"
//                     className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
//                   />
//                 </div>
//                 {parseFloat(entrada) > 0 && (
//                   <div>
//                     <label className="block text-sm font-medium font-poppins text-gray-700">
//                       Forma de Pagamento da Entrada
//                     </label>
//                     <select
//                       value={formaPagamentoEntrada}
//                       onChange={(e) => setFormaPagamentoEntrada(e.target.value)}
//                       className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
//                     >
//                       <option value="DINHEIRO">Dinheiro</option>
//                       <option value="PIX">Pix</option>
//                     </select>
//                     <p className="text-xs font-poppins text-gray-500 mt-1">
//                       Entrada deve ser paga em PIX ou Dinheiro
//                     </p>
//                   </div>
//                 )}
//                 <p className="text-sm font-poppins text-gray-600">
//                   Valor por parcela: R$ {calcularValorParcela()}
//                 </p>
//               </div>
//             )}
//           </div>
//         )}

//         <div className="sticky bottom-0 bg-white pt-4 flex justify-end space-x-2">
//           <button
//             onClick={onClose}
//             className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 font-poppins text-sm"
//           >
//             Cancelar
//           </button>
//           <button
//             onClick={handleConfirm}
//             className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-poppins text-sm"
//           >
//             Confirmar
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-gray-600">
      <div className="bg-white rounded-lg p-4 w-11/12 max-w-md max-h-[90vh] overflow-y-auto relative">
        <h2 className="text-xl font-bold font-poppins text-gray-900 mb-4">
          Registrar Venda - {produto.nome}
        </h2>
        <p className="text-gray-600 font-poppins text-sm mb-2">
          Estoque atual: {produto.quantidade}
        </p>
        <p className="text-gray-600 font-poppins text-sm mb-4">
          Preço do produto: R$ {produto.precoVenda.toFixed(2)}
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium font-poppins text-gray-700">
            Quantidade
          </label>
          <input
            type="number"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            placeholder="Quantidade a vender"
            min="1"
            max={produto.quantidade}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium font-poppins text-gray-700">
            Cliente
          </label>
          {!isNewCliente ? (
            <select
              value={clienteNome}
              onChange={(e) => setClienteNome(e.target.value)}
              className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
            >
              <option value="">Selecione um cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.nome}>
                  {cliente.nome}
                </option>
              ))}
            </select>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value)}
                placeholder="Nome do novo cliente"
                className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
              />
              <input
                type="text"
                value={apelido}
                onChange={(e) => setApelido(e.target.value)}
                placeholder="Apelido (opcional)"
                className="border border-gray-300 p-3 w-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
              />
              <input
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(formatPhoneNumber(e.target.value))}
                placeholder="(11) 99999-9999"
                className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
              />
            </div>
          )}
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
            className="mt-2 text-blue-600 hover:text-blue-800 font-poppins text-sm"
          >
            {isNewCliente ? 'Selecionar cliente existente' : 'Cadastrar novo cliente'}
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium font-poppins text-gray-700">
            Valor Total
          </label>
          <input
            type="number"
            step="0.01"
            value={valorTotal}
            onChange={(e) => setValorTotal(e.target.value)}
            placeholder="Valor total (R$)"
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium font-poppins text-gray-700">
            Forma de Pagamento
          </label>
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
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
          >
            <option value="">Selecione a forma</option>
            <option value="DINHEIRO">Dinheiro à vista</option>
            <option value="PIX">Pix à vista</option>
            <option value="CARTAO">Cartão</option>
            <option value="PROMISSORIA">Promissória</option>
          </select>
        </div>

        {formaPagamento === 'CARTAO' && (
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium font-poppins text-gray-700">
                Bandeira
              </label>
              <select
                value={bandeira}
                onChange={(e) => {
                  setBandeira(e.target.value);
                  setModalidade('');
                  setTaxa(0);
                  setValorLiquido(valorTotal || 0);
                }}
                className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
              >
                <option value="">Selecione a bandeira</option>
                {[...new Set(taxasCartao.map((t) => t.bandeira))].map((band) => (
                  <option key={band} value={band}>{band}</option>
                ))}
              </select>
            </div>
            {bandeira && (
              <div>
                <label className="block text-sm font-medium font-poppins text-gray-700">
                  Modalidade
                </label>
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
                  className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
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
              </div>
            )}
            {taxa > 0 && (
              <p className="text-sm font-poppins text-gray-600 col-span-2">
                Taxa: R$ {taxa} | Valor Líquido: R$ {valorLiquido}
              </p>
            )}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium font-poppins text-gray-700">
            Data da Venda
          </label>
          <input
            type="date"
            value={dataVenda}
            onChange={(e) => setDataVenda(e.target.value)}
            max={format(new Date(), 'yyyy-MM-dd')}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
          />
          <p className="text-sm font-poppins text-gray-600 mt-1">
            Data selecionada: {format(parseISO(dataVenda), 'dd/MM/yyyy')}
          </p>
        </div>

        {formaPagamento === 'PROMISSORIA' && (
          <div className="mb-4">
            <label className="flex items-center text-sm font-medium font-poppins text-gray-700">
              <input
                type="checkbox"
                checked={isParcelado}
                onChange={(e) => setIsParcelado(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              Pagar em parcelas
            </label>
            {isParcelado && (
              <div className="mt-2 space-y-2">
                <div>
                  <label className="block text-sm font-medium font-poppins text-gray-700">
                    Número de Parcelas
                  </label>
                  <select
                    value={numeroParcelas}
                    onChange={(e) => setNumeroParcelas(e.target.value)}
                    className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
                  >
                    {[...Array(12).keys()].map((i) => (
                      <option key={i + 1} value={String(i + 1)}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium font-poppins text-gray-700">
                    Entrada (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={entrada}
                    onChange={(e) => setEntrada(e.target.value)}
                    placeholder="0.00"
                    className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
                  />
                </div>
                {parseFloat(entrada) > 0 && (
                  <div>
                    <label className="block text-sm font-medium font-poppins text-gray-700">
                      Forma de Pagamento da Entrada
                    </label>
                    <select
                      value={formaPagamentoEntrada}
                      onChange={(e) => setFormaPagamentoEntrada(e.target.value)}
                      className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
                    >
                      <option value="DINHEIRO">Dinheiro</option>
                      <option value="PIX">Pix</option>
                    </select>
                    <p className="text-xs font-poppins text-gray-500 mt-1">
                      Entrada deve ser paga em PIX ou Dinheiro
                    </p>
                  </div>
                )}
                <p className="text-sm font-poppins text-gray-600">
                  Valor por parcela: R$ {calcularValorParcela()}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="sticky bottom-0 bg-white pt-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 font-poppins text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-poppins text-sm"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}


