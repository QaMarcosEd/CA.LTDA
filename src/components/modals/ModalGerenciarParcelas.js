// //src/components/modals/ModalGerenciarParcelas.js
// 'use client';

// import { useState, useEffect } from 'react';
// import toast from 'react-hot-toast';
// import { format } from 'date-fns';

// export default function ModalGerenciarParcelas({ isOpen, venda, onClose, marcarParcelaComoPaga }) {
//   const [taxasCartao, setTaxasCartao] = useState([]);
//   const [formasPagamento, setFormasPagamento] = useState({}); // { [parcelaId]: { forma, bandeira, modalidade, taxa, valorLiquido } }

//   useEffect(() => {
//     if (isOpen) {
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
//     setFormasPagamento({});
//   }, [isOpen]);

//   const handleFormaPagamentoChange = (parcelaId, forma, bandeira, modalidade, valorPago) => {
//     setFormasPagamento((prev) => {
//       const newState = { ...prev };
//       const valor = parseFloat(valorPago) || 0;
//       let taxa = 0;
//       let valorLiquido = valor;
//       if (forma === 'CARTAO' && bandeira && modalidade) {
//         const taxaCartao = taxasCartao.find((t) => t.bandeira === bandeira && t.modalidade === modalidade);
//         if (taxaCartao) {
//           const taxaPercentual = taxaCartao.taxaPercentual / 100;
//           taxa = (valor * taxaPercentual).toFixed(2);
//           valorLiquido = (valor - parseFloat(taxa)).toFixed(2);
//         }
//       }
//       newState[parcelaId] = { forma, bandeira, modalidade, taxa, valorLiquido };
//       return newState;
//     });
//   };

//   if (!isOpen || !venda) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-gray-600">
//       <div className="bg-white rounded-xl p-4 w-11/12 max-w-lg max-h-[90vh] overflow-y-auto shadow-lg">
//         <h2 className="text-xl font-bold font-poppins text-gray-900 mb-4">
//           Parcelas da Venda #{venda.id}
//         </h2>
//         <p className="text-xs sm:text-sm font-poppins text-gray-500 mb-2">
//           Entrada: R$ {venda.entrada.toFixed(2)} {venda.formaPagamentoEntrada ? `(${venda.formaPagamentoEntrada.toLowerCase()})` : ''}
//         </p>
//         <p className="text-xs sm:text-sm font-poppins text-gray-500 mb-4">
//           Forma de Pagamento: {venda.formaPagamento?.replace('CARTAO_', '').replace('_', ' ').toLowerCase() || 'N/A'}
//         </p>

//         <div className="space-y-3">
//           {venda.parcelas.map((parcela) => {
//             const isCartao = parcela.formaPagamento?.startsWith('CARTAO_');
//             const formaParts = parcela.formaPagamento?.split('_') || [];
//             const bandeira = isCartao && formaParts.length === 3 ? formaParts[1] : '';
//             const modalidade = isCartao && formaParts.length === 3 ? formaParts[2] : '';
//             return (
//               <div key={parcela.id} className="border-b border-gray-200 pb-3">
//                 <p className="text-xs sm:text-sm font-semibold font-poppins text-gray-700">
//                   Parcela {parcela.numeroParcela}: R$ {parcela.valor.toFixed(2)} 
//                   (Previsão: {new Date(parcela.dataVencimento).toLocaleDateString('pt-BR')})
//                 </p>
//                 <p className="text-xs sm:text-sm font-poppins text-gray-700">
//                   Status: <span className={parcela.pago ? 'text-green-600' : 'text-red-600'}>{parcela.pago ? 'Pago' : 'Pendente'}</span>
//                 </p>
//                 {parcela.pago && (
//                   <>
//                     <p className="text-xs sm:text-sm font-poppins text-gray-600">
//                       Valor Pago: R$ {parcela.valorPago.toFixed(2)}
//                     </p>
//                     <p className="text-xs sm:text-sm font-poppins text-gray-600">
//                       Forma: {parcela.formaPagamento?.replace('CARTAO_', '').replace('_', ' ').toLowerCase() || 'N/A'}
//                     </p>
//                     {parcela.taxa > 0 && (
//                       <p className="text-xs sm:text-sm font-poppins text-gray-600">
//                         Taxa: R$ {parcela.taxa.toFixed(2)} | Líquido: R$ {parcela.valorLiquido.toFixed(2)}
//                       </p>
//                     )}
//                     {parcela.dataPagamento && (
//                       <p className="text-xs sm:text-sm font-poppins text-gray-600">
//                         Pago em: {new Date(parcela.dataPagamento).toLocaleDateString('pt-BR')}
//                       </p>
//                     )}
//                   </>
//                 )}
// {/* -------------------------------------------------------------- */}
//                 {/* {!parcela.pago && (
//                   <div className="mt-2 space-y-2">
//                     <p className="text-xs sm:text-sm font-semibold font-poppins text-gray-700">
//                       Pendente: R$ {(parcela.valor - (parcela.valorPago || 0)).toFixed(2)}
//                     </p>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//                       <div>
//                         <input
//                           type="number"
//                           step="0.01"
//                           defaultValue={(parcela.valor - (parcela.valorPago || 0)).toFixed(2)}
//                           placeholder="Valor a pagar"
//                           className="border border-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-poppins text-xs sm:text-sm w-full transition-all"
//                           id={`valorPago-${parcela.id}`}
//                           onChange={(e) => {
//                             handleFormaPagamentoChange(
//                               parcela.id,
//                               isCartao ? 'CARTAO' : formasPagamento[parcela.id]?.forma || 'PROMISSORIA',
//                               bandeira,
//                               modalidade,
//                               e.target.value
//                             );
//                           }}
//                         />
//                       </div>
//                       {isCartao ? (
//                         <p className="text-xs sm:text-sm font-poppins text-gray-600">
//                           Forma: {parcela.formaPagamento.replace('CARTAO_', '').replace('_', ' ').toLowerCase()}
//                         </p>
//                       ) : (
//                         <div>
//                           <select
//                             className="border border-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-poppins text-xs sm:text-sm w-full transition-all"
//                             id={`formaPagamento-${parcela.id}`}
//                             onChange={(e) => handleFormaPagamentoChange(
//                               parcela.id,
//                               e.target.value,
//                               formasPagamento[parcela.id]?.bandeira || '',
//                               formasPagamento[parcela.id]?.modalidade || '',
//                               document.getElementById(`valorPago-${parcela.id}`).value
//                             )}
//                           >
//                             <option value="">Selecione a forma</option>
//                             <option value="DINHEIRO">Dinheiro</option>
//                             <option value="PIX">Pix</option>
//                             <option value="CARTAO">Cartão</option>
//                           </select>
//                         </div>
//                       )}
//                       {formasPagamento[parcela.id]?.forma === 'CARTAO' && (
//                         <>
//                           <div>
//                             <select
//                               className="border border-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-poppins text-xs sm:text-sm w-full transition-all"
//                               id={`bandeira-${parcela.id}`}
//                               onChange={(e) => handleFormaPagamentoChange(
//                                 parcela.id,
//                                 formasPagamento[parcela.id]?.forma || 'CARTAO',
//                                 e.target.value,
//                                 formasPagamento[parcela.id]?.modalidade || '',
//                                 document.getElementById(`valorPago-${parcela.id}`).value
//                               )}
//                             >
//                               <option value="">Selecione a bandeira</option>
//                               {[...new Set(taxasCartao.map((t) => t.bandeira))].map((band) => (
//                                 <option key={band} value={band}>{band}</option>
//                               ))}
//                             </select>
//                           </div>
//                           {formasPagamento[parcela.id]?.bandeira && (
//                             <div>
//                               <select
//                                 className="border border-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-poppins text-xs sm:text-sm w-full transition-all"
//                                 id={`modalidade-${parcela.id}`}
//                                 onChange={(e) => handleFormaPagamentoChange(
//                                   parcela.id,
//                                   formasPagamento[parcela.id]?.forma || 'CARTAO',
//                                   formasPagamento[parcela.id]?.bandeira,
//                                   e.target.value,
//                                   document.getElementById(`valorPago-${parcela.id}`).value
//                                 )}
//                               >
//                                 <option value="">Selecione a modalidade</option>
//                                 {taxasCartao
//                                   .filter((t) => t.bandeira === formasPagamento[parcela.id]?.bandeira)
//                                   .map((t) => (
//                                     <option key={t.modalidade} value={t.modalidade}>
//                                       {t.modalidade.replace('_', ' ').toLowerCase()}
//                                     </option>
//                                   ))}
//                               </select>
//                             </div>
//                           )}
//                         </>
//                       )}
//                     </div>
//                     {formasPagamento[parcela.id]?.taxa > 0 && (
//                       <p className="text-xs sm:text-sm font-poppins text-gray-600">
//                         Taxa: R$ {formasPagamento[parcela.id].taxa} | Líquido: R$ {formasPagamento[parcela.id].valorLiquido}
//                       </p>
//                     )}
//                     <input
//                       type="text"
//                       placeholder="Observação (ex: Comprovante XYZ)"
//                       className="border border-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-poppins text-xs sm:text-sm w-full transition-all"
//                       id={`observacao-${parcela.id}`}
//                     />
//                     <input
//                       type="date"
//                       max={format(new Date(), 'yyyy-MM-dd')}
//                       defaultValue={format(new Date(), 'yyyy-MM-dd')}
//                       className="border border-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-poppins text-xs sm:text-sm w-full transition-all"
//                       id={`dataPagamento-${parcela.id}`}
//                     />
//                     <button
//                       onClick={() => {
//                         const valorPago = document.getElementById(`valorPago-${parcela.id}`).value;
//                         const observacao = document.getElementById(`observacao-${parcela.id}`).value;
//                         const dataPagamento = document.getElementById(`dataPagamento-${parcela.id}`).value;
//                         const forma = isCartao ? 'CARTAO' : formasPagamento[parcela.id]?.forma || 'PROMISSORIA';
//                         const bandeiraCartao = isCartao ? bandeira : formasPagamento[parcela.id]?.bandeira;
//                         const modalidadeCartao = isCartao ? modalidade : formasPagamento[parcela.id]?.modalidade;

//                         if (!valorPago || parseFloat(valorPago) <= 0) {
//                           toast.error('Digite um valor válido');
//                           return;
//                         }
//                         if (parseFloat(valorPago) > (parcela.valor - (parcela.valorPago || 0))) {
//                           toast.error('Valor pago não pode exceder o valor pendente');
//                           return;
//                         }
//                         if (!forma) {
//                           toast.error('Selecione uma forma de pagamento');
//                           return;
//                         }
//                         if (!isCartao && forma === 'CARTAO' && (!bandeiraCartao || !modalidadeCartao)) {
//                           toast.error('Selecione bandeira e modalidade para cartão');
//                           return;
//                         }
//                         if (!dataPagamento) {
//                           toast.error('Selecione a data de pagamento');
//                           return;
//                         }
//                         const selectedDate = new Date(dataPagamento);
//                         const today = new Date();
//                         if (selectedDate > today) {
//                           toast.error('Data de pagamento não pode ser futura');
//                           return;
//                         }

//                         marcarParcelaComoPaga(
//                           parcela.id,
//                           parseFloat(valorPago),
//                           observacao || null,
//                           forma,
//                           isCartao ? bandeira : bandeiraCartao,
//                           isCartao ? modalidade : modalidadeCartao,
//                           dataPagamento
//                         );
//                       }}
//                       className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 font-poppins text-xs sm:text-sm w-full transition-all"
//                     >
//                       Confirmar Recebimento
//                     </button>
//                   </div>
//                 )} */}
// {!parcela.pago && (
//   <div className="mt-2 space-y-2">
//     <p className="text-xs sm:text-sm font-semibold font-poppins text-gray-700">
//       Pendente bruto (do cliente): R$ {(parcela.valor - (parcela.valorPago || 0)).toFixed(2)}
//     </p>
//     <p className="text-xs sm:text-sm font-poppins text-gray-600">
//       Pendente líquido (a receber): R$ {(parcela.valorLiquido - (parcela.valorPago || 0)).toFixed(2)}
//     </p>
//     <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//       <div>
//         <input
//           type="number"
//           step="0.01"
//           defaultValue={(parcela.valorLiquido - (parcela.valorPago || 0)).toFixed(2)} // Default para o líquido pendente
//           placeholder="Valor a pagar"
//           className="border border-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-poppins text-xs sm:text-sm w-full transition-all"
//           id={`valorPago-${parcela.id}`}
//           onChange={(e) => {
//             handleFormaPagamentoChange(
//               parcela.id,
//               isCartao ? 'CARTAO' : formasPagamento[parcela.id]?.forma || 'PROMISSORIA',
//               bandeira,
//               modalidade,
//               e.target.value
//             );
//           }}
//         />
//       </div>
//       {isCartao ? (
//         <p className="text-xs sm:text-sm font-poppins text-gray-600">
//           Forma: {parcela.formaPagamento.replace('CARTAO_', '').replace('_', ' ').toLowerCase()}
//         </p>
//       ) : (
//         <div>
//           <select
//             className="border border-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-poppins text-xs sm:text-sm w-full transition-all"
//             id={`formaPagamento-${parcela.id}`}
//             onChange={(e) => handleFormaPagamentoChange(
//               parcela.id,
//               e.target.value,
//               formasPagamento[parcela.id]?.bandeira || '',
//               formasPagamento[parcela.id]?.modalidade || '',
//               document.getElementById(`valorPago-${parcela.id}`).value
//             )}
//           >
//             <option value="">Selecione a forma</option>
//             <option value="DINHEIRO">Dinheiro</option>
//             <option value="PIX">Pix</option>
//             <option value="CARTAO">Cartão</option>
//           </select>
//         </div>
//       )}
//       {/* ... resto do código (bandeira, modalidade, etc.) ... */}
//       {formasPagamento[parcela.id]?.taxa > 0 && (
//         <p className="text-xs sm:text-sm font-poppins text-gray-600">
//           Taxa (pagamento): R$ {formasPagamento[parcela.id].taxa} | Líquido (pagamento): R$ {formasPagamento[parcela.id].valorLiquido}
//         </p>
//       )}
//       <input
//         type="text"
//         placeholder="Observação (ex: Comprovante XYZ)"
//         className="border border-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-poppins text-xs sm:text-sm w-full transition-all"
//         id={`observacao-${parcela.id}`}
//       />
//       <input
//         type="date"
//         max={format(new Date(), 'yyyy-MM-dd')}
//         defaultValue={format(new Date(), 'yyyy-MM-dd')}
//         className="border border-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-poppins text-xs sm:text-sm w-full transition-all"
//         id={`dataPagamento-${parcela.id}`}
//       />
//       <button
//         onClick={() => {
//           const valorPago = document.getElementById(`valorPago-${parcela.id}`).value;
//           const observacao = document.getElementById(`observacao-${parcela.id}`).value;
//           const dataPagamento = document.getElementById(`dataPagamento-${parcela.id}`).value;
//           const forma = isCartao ? 'CARTAO' : formasPagamento[parcela.id]?.forma || 'PROMISSORIA';
//           const bandeiraCartao = isCartao ? bandeira : formasPagamento[parcela.id]?.bandeira;
//           const modalidadeCartao = isCartao ? modalidade : formasPagamento[parcela.id]?.modalidade;

//           if (!valorPago || parseFloat(valorPago) <= 0) {
//             toast.error('Digite um valor válido');
//             return;
//           }
//           if (parseFloat(valorPago) > (parcela.valorLiquido - (parcela.valorPago || 0))) {
//             // Mudança: Compara com valorLiquido em vez de valor
//             toast.error('Valor pago não pode exceder o líquido pendente');
//             return;
//           }
//           if (!forma) {
//             toast.error('Selecione uma forma de pagamento');
//             return;
//           }
//           if (!isCartao && forma === 'CARTAO' && (!bandeiraCartao || !modalidadeCartao)) {
//             toast.error('Selecione bandeira e modalidade para cartão');
//             return;
//           }
//           if (!dataPagamento) {
//             toast.error('Selecione a data de pagamento');
//             return;
//           }
//           const selectedDate = new Date(dataPagamento);
//           const today = new Date();
//           if (selectedDate > today) {
//             toast.error('Data de pagamento não pode ser futura');
//             return;
//           }

//           marcarParcelaComoPaga(
//             parcela.id,
//             parseFloat(valorPago),
//             observacao || null,
//             forma,
//             isCartao ? bandeira : bandeiraCartao,
//             isCartao ? modalidade : modalidadeCartao,
//             dataPagamento
//           );
//         }}
//         className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 font-poppins text-xs sm:text-sm w-full transition-all"
//       >
//         Confirmar Recebimento
//       </button>
//     </div>
//   </div>
// )}
//               </div>
//             );
//           })}
//         </div>

//         <div className="sticky bottom-0 bg-white pt-4 flex justify-end">
//           <button
//             onClick={() => {
//               onClose();
//               setFormasPagamento({});
//             }}
//             className="bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 px-4 py-2 rounded-lg hover:from-gray-400 hover:to-gray-500 font-poppins text-xs sm:text-sm transition-all"
//           >
//             Fechar
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }










































// src/components/modals/ModalGerenciarParcelas.js
// 'use client';

// import { useState, useEffect } from 'react';
// import toast from 'react-hot-toast';
// import { format } from 'date-fns';

// export default function ModalGerenciarParcelas({ isOpen, venda, onClose, marcarParcelaComoPaga }) {
//   const [taxasCartao, setTaxasCartao] = useState([]);
//   const [formasPagamento, setFormasPagamento] = useState({}); // { [parcelaId]: { forma, bandeira, modalidade, taxa, valorLiquido } }

//   useEffect(() => {
//     if (isOpen) {
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
//     setFormasPagamento({});
//   }, [isOpen]);

//   const handleFormaPagamentoChange = (parcelaId, forma, bandeira, modalidade, valorPago) => {
//     setFormasPagamento((prev) => {
//       const newState = { ...prev };
//       const valor = parseFloat(valorPago) || 0;
//       let taxa = 0;
//       let valorLiquido = valor;
//       if (forma === 'CARTAO' && bandeira && modalidade) {
//         const taxaCartao = taxasCartao.find((t) => t.bandeira === bandeira && t.modalidade === modalidade);
//         if (taxaCartao) {
//           const taxaPercentual = taxaCartao.taxaPercentual / 100;
//           taxa = (valor * taxaPercentual).toFixed(2);
//           valorLiquido = (valor - parseFloat(taxa)).toFixed(2);
//         }
//       }
//       newState[parcelaId] = { forma, bandeira, modalidade, taxa, valorLiquido };
//       return newState;
//     });
//   };

//   if (!isOpen || !venda) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-gray-600">
//       <div className="bg-white rounded-xl p-4 w-11/12 max-w-lg max-h-[90vh] overflow-y-auto shadow-lg">
//         <h2 className="text-xl font-bold font-poppins text-gray-900 mb-4">
//           Parcelas da Venda #{venda.id}
//         </h2>
//         <p className="text-xs sm:text-sm font-poppins text-gray-500 mb-2">
//           Entrada: R$ {venda.entrada.toFixed(2)} {venda.formaPagamentoEntrada ? `(${venda.formaPagamentoEntrada.toLowerCase()})` : ''}
//         </p>
//         <p className="text-xs sm:text-sm font-poppins text-gray-500 mb-4">
//           Forma de Pagamento: {venda.formaPagamento?.replace('CARTAO_', '').replace('_', ' ').toLowerCase() || 'N/A'}
//         </p>

//         <div className="space-y-3">
//           {venda.parcelas.map((parcela) => {
//             const isCartao = parcela.formaPagamento?.startsWith('CARTAO_');
//             const formaParts = parcela.formaPagamento?.split('_') || [];
//             const bandeira = isCartao && formaParts.length >= 2 ? formaParts[1] : '';
//             const modalidade = isCartao && formaParts.length >= 3 ? formaParts[2] : '';
//             return (
//               <div key={parcela.id} className="border-b border-gray-200 pb-3">
//                 <p className="text-xs sm:text-sm font-semibold font-poppins text-gray-700">
//                   Parcela {parcela.numeroParcela}: R$ {parcela.valor.toFixed(2)} 
//                   (Previsão: {new Date(parcela.dataVencimento).toLocaleDateString('pt-BR')})
//                 </p>
//                 <p className="text-xs sm:text-sm font-poppins text-gray-700">
//                   Status: <span className={parcela.pago ? 'text-green-600' : 'text-red-600'}>{parcela.pago ? 'Pago' : 'Pendente'}</span>
//                 </p>
//                 {parcela.pago && (
//                   <>
//                     <p className="text-xs sm:text-sm font-poppins text-gray-600">
//                       Valor Pago: R$ {parcela.valorPago.toFixed(2)}
//                     </p>
//                     <p className="text-xs sm:text-sm font-poppins text-gray-600">
//                       Forma: {parcela.formaPagamento?.replace('CARTAO_', '').replace('_', ' ').toLowerCase() || 'N/A'}
//                     </p>
//                     {parcela.taxa > 0 && (
//                       <p className="text-xs sm:text-sm font-poppins text-gray-600">
//                         Taxa: R$ {parcela.taxa.toFixed(2)} | Líquido: R$ {parcela.valorLiquido.toFixed(2)}
//                       </p>
//                     )}
//                     {parcela.dataPagamento && (
//                       <p className="text-xs sm:text-sm font-poppins text-gray-600">
//                         Pago em: {new Date(parcela.dataPagamento).toLocaleDateString('pt-BR')}
//                       </p>
//                     )}
//                   </>
//                 )}
//                 {!parcela.pago && (
//                   <div className="mt-2 space-y-2">
//                     <p className="text-xs sm:text-sm font-semibold font-poppins text-gray-700">
//                       Pendente bruto (do cliente): R$ {(parcela.valor - (parcela.valorPago || 0)).toFixed(2)}
//                     </p>
//                     <p className="text-xs sm:text-sm font-poppins text-gray-600">
//                       Pendente líquido (a receber): R$ {(parcela.valorLiquido - (parcela.valorPago || 0)).toFixed(2)}
//                     </p>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//                       <div>
//                         <input
//                           type="number"
//                           step="0.01"
//                           defaultValue={(parcela.valorLiquido - (parcela.valorPago || 0)).toFixed(2)} // Default para o líquido pendente
//                           placeholder="Valor a pagar"
//                           className="border border-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-poppins text-xs sm:text-sm w-full transition-all"
//                           id={`valorPago-${parcela.id}`}
//                           onChange={(e) => {
//                             handleFormaPagamentoChange(
//                               parcela.id,
//                               isCartao ? 'CARTAO' : formasPagamento[parcela.id]?.forma || 'PROMISSORIA',
//                               bandeira,
//                               modalidade,
//                               e.target.value
//                             );
//                           }}
//                         />
//                       </div>
//                       {isCartao ? (
//                         <p className="text-xs sm:text-sm font-poppins text-gray-600">
//                           Forma: {parcela.formaPagamento.replace('CARTAO_', '').replace('_', ' ').toLowerCase()}
//                         </p>
//                       ) : (
//                         <div>
//                           <select
//                             className="border border-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-poppins text-xs sm:text-sm w-full transition-all"
//                             id={`formaPagamento-${parcela.id}`}
//                             onChange={(e) => handleFormaPagamentoChange(
//                               parcela.id,
//                               e.target.value,
//                               formasPagamento[parcela.id]?.bandeira || '',
//                               formasPagamento[parcela.id]?.modalidade || '',
//                               document.getElementById(`valorPago-${parcela.id}`).value
//                             )}
//                           >
//                             <option value="">Selecione a forma</option>
//                             <option value="DINHEIRO">Dinheiro</option>
//                             <option value="PIX">Pix</option>
//                             <option value="CARTAO">Cartão</option>
//                           </select>
//                         </div>
//                       )}
//                       {formasPagamento[parcela.id]?.forma === 'CARTAO' && (
//                         <>
//                           <div>
//                             <select
//                               className="border border-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-poppins text-xs sm:text-sm w-full transition-all"
//                               id={`bandeira-${parcela.id}`}
//                               onChange={(e) => handleFormaPagamentoChange(
//                                 parcela.id,
//                                 formasPagamento[parcela.id]?.forma || 'CARTAO',
//                                 e.target.value,
//                                 formasPagamento[parcela.id]?.modalidade || '',
//                                 document.getElementById(`valorPago-${parcela.id}`).value
//                               )}
//                             >
//                               <option value="">Selecione a bandeira</option>
//                               {[...new Set(taxasCartao.map((t) => t.bandeira))].map((band) => (
//                                 <option key={band} value={band}>{band}</option>
//                               ))}
//                             </select>
//                           </div>
//                           {formasPagamento[parcela.id]?.bandeira && (
//                             <div>
//                               <select
//                                 className="border border-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-poppins text-xs sm:text-sm w-full transition-all"
//                                 id={`modalidade-${parcela.id}`}
//                                 onChange={(e) => handleFormaPagamentoChange(
//                                   parcela.id,
//                                   formasPagamento[parcela.id]?.forma || 'CARTAO',
//                                   formasPagamento[parcela.id]?.bandeira,
//                                   e.target.value,
//                                   document.getElementById(`valorPago-${parcela.id}`).value
//                                 )}
//                               >
//                                 <option value="">Selecione a modalidade</option>
//                                 {taxasCartao
//                                   .filter((t) => t.bandeira === formasPagamento[parcela.id]?.bandeira)
//                                   .map((t) => (
//                                     <option key={t.modalidade} value={t.modalidade}>
//                                       {t.modalidade.replace('_', ' ').toLowerCase()}
//                                     </option>
//                                   ))}
//                               </select>
//                             </div>
//                           )}
//                         </>
//                       )}
//                     </div>
//                     {formasPagamento[parcela.id]?.taxa > 0 && (
//                       <p className="text-xs sm:text-sm font-poppins text-gray-600">
//                         Taxa (pagamento): R$ {formasPagamento[parcela.id].taxa} | Líquido (pagamento): R$ {formasPagamento[parcela.id].valorLiquido}
//                       </p>
//                     )}
//                     <input
//                       type="text"
//                       placeholder="Observação (ex: Comprovante XYZ)"
//                       className="border border-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-poppins text-xs sm:text-sm w-full transition-all"
//                       id={`observacao-${parcela.id}`}
//                     />
//                     <input
//                       type="date"
//                       max={format(new Date(), 'yyyy-MM-dd')}
//                       defaultValue={format(new Date(), 'yyyy-MM-dd')}
//                       className="border border-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-poppins text-xs sm:text-sm w-full transition-all"
//                       id={`dataPagamento-${parcela.id}`}
//                     />
//                     <button
//                       onClick={() => {
//                         const valorPago = document.getElementById(`valorPago-${parcela.id}`).value;
//                         const observacao = document.getElementById(`observacao-${parcela.id}`).value;
//                         const dataPagamento = document.getElementById(`dataPagamento-${parcela.id}`).value;
//                         const forma = isCartao ? 'CARTAO' : formasPagamento[parcela.id]?.forma || 'PROMISSORIA';
//                         const bandeiraCartao = isCartao ? bandeira : formasPagamento[parcela.id]?.bandeira;
//                         const modalidadeCartao = isCartao ? modalidade : formasPagamento[parcela.id]?.modalidade;

//                         if (!valorPago || parseFloat(valorPago) <= 0) {
//                           toast.error('Digite um valor válido');
//                           return;
//                         }
//                         if (parseFloat(valorPago) > (parcela.valorLiquido - (parcela.valorPago || 0))) {
//                           toast.error('Valor pago não pode exceder o líquido pendente');
//                           return;
//                         }
//                         if (!forma) {
//                           toast.error('Selecione uma forma de pagamento');
//                           return;
//                         }
//                         if (!isCartao && forma === 'CARTAO' && (!bandeiraCartao || !modalidadeCartao)) {
//                           toast.error('Selecione bandeira e modalidade para cartão');
//                           return;
//                         }
//                         if (!dataPagamento) {
//                           toast.error('Selecione a data de pagamento');
//                           return;
//                         }
//                         const selectedDate = new Date(dataPagamento);
//                         const today = new Date();
//                         if (selectedDate > today) {
//                           toast.error('Data de pagamento não pode ser futura');
//                           return;
//                         }

//                         marcarParcelaComoPaga(
//                           parcela.id,
//                           parseFloat(valorPago),
//                           observacao || null,
//                           forma,
//                           isCartao ? bandeira : bandeiraCartao,
//                           isCartao ? modalidade : modalidadeCartao,
//                           dataPagamento
//                         );
//                       }}
//                       className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 font-poppins text-xs sm:text-sm w-full transition-all"
//                     >
//                       Confirmar Recebimento
//                     </button>
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>

//         <div className="sticky bottom-0 bg-white pt-4 flex justify-end">
//           <button
//             onClick={() => {
//               onClose();
//               setFormasPagamento({});
//             }}
//             className="bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 px-4 py-2 rounded-lg hover:from-gray-400 hover:to-gray-500 font-poppins text-xs sm:text-sm transition-all"
//           >
//             Fechar
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
























// src/components/modals/ModalGerenciarParcelas.js
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function ModalGerenciarParcelas({ isOpen, venda, onClose, marcarParcelaComoPaga }) {
  const [taxasCartao, setTaxasCartao] = useState([]);
  const [formasPagamento, setFormasPagamento] = useState({}); // { [parcelaId]: { forma, bandeira, modalidade, taxa, valorLiquido } }

  useEffect(() => {
    if (isOpen) {
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
    setFormasPagamento({});
  }, [isOpen]);

  const handleFormaPagamentoChange = (parcelaId, forma, bandeira, modalidade, valorPago) => {
    setFormasPagamento((prev) => {
      const newState = { ...prev };
      const valor = parseFloat(valorPago) || 0;
      let taxa = 0;
      let valorLiquido = valor;
      if (forma === 'CARTAO' && bandeira && modalidade) {
        const taxaCartao = taxasCartao.find((t) => t.bandeira === bandeira && t.modalidade === modalidade);
        if (taxaCartao) {
          const taxaPercentual = taxaCartao.taxaPercentual / 100;
          taxa = (valor * taxaPercentual).toFixed(2);
          valorLiquido = (valor - parseFloat(taxa)).toFixed(2);
        }
      }
      newState[parcelaId] = { forma, bandeira, modalidade, taxa, valorLiquido };
      return newState;
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
          Forma de Pagamento: {venda.formaPagamento?.replace('CARTAO_', '').replace('_', ' ').toLowerCase() || 'N/A'}
        </p>

        <div className="space-y-3">
          {venda.parcelas.map((parcela) => {
            const isCartao = parcela.formaPagamento?.startsWith('CARTAO_');
            const formaParts = parcela.formaPagamento?.split('_') || [];
            const bandeira = isCartao && formaParts.length === 3 ? formaParts[1] : '';
            const modalidade = isCartao && formaParts.length === 3 ? formaParts[2] : '';
            return (
              <div key={parcela.id} className="border-b border-gray-200 pb-3">
                <p className="text-xs sm:text-sm font-semibold font-poppins text-gray-700">
                  Parcela {parcela.numeroParcela}: R$ {parcela.valor.toFixed(2)} 
                  (Previsão: {new Date(parcela.dataVencimento).toLocaleDateString('pt-BR')})
                </p>
                <p className="text-xs sm:text-sm font-poppins text-gray-700">
                  Status: <span className={parcela.pago ? 'text-green-600' : 'text-red-600'}>{parcela.pago ? 'Pago' : 'Pendente'}</span>
                </p>
                {parcela.pago && (
                  <>
                    <p className="text-xs sm:text-sm font-poppins text-gray-600">
                      Valor Pago: R$ {parcela.valorPago.toFixed(2)}
                    </p>
                    <p className="text-xs sm:text-sm font-poppins text-gray-600">
                      Forma: {parcela.formaPagamento?.replace('CARTAO_', '').replace('_', ' ').toLowerCase() || 'N/A'}
                    </p>
                    {parcela.taxa > 0 && (
                      <p className="text-xs sm:text-sm font-poppins text-gray-600">
                        Taxa: R$ {parcela.taxa.toFixed(2)} | Líquido: R$ {parcela.valorLiquido.toFixed(2)}
                      </p>
                    )}
                    {parcela.dataPagamento && (
                      <p className="text-xs sm:text-sm font-poppins text-gray-600">
                        Pago em: {new Date(parcela.dataPagamento).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </>
                )}
                {!parcela.pago && (
                  <div className="mt-2 space-y-2">
                    <p className="text-xs sm:text-sm font-semibold font-poppins text-gray-700">
                      Pendente bruto (do cliente): R$ {(parcela.valor - (parcela.valorPago || 0)).toFixed(2)}
                    </p>
                    <p className="text-xs sm:text-sm font-poppins text-gray-600">
                      Pendente líquido (a receber): R$ {(parcela.valorLiquido - (parcela.valorPago || 0)).toFixed(2)}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <input
                          type="number"
                          step="0.01"
                          defaultValue={(parcela.valorLiquido - (parcela.valorPago || 0)).toFixed(2)} // Default para o líquido pendente
                          placeholder="Valor a pagar"
                          className="border border-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-poppins text-xs sm:text-sm w-full transition-all"
                          id={`valorPago-${parcela.id}`}
                          onChange={(e) => {
                            handleFormaPagamentoChange(
                              parcela.id,
                              isCartao ? 'CARTAO' : formasPagamento[parcela.id]?.forma || 'PROMISSORIA',
                              bandeira,
                              modalidade,
                              e.target.value
                            );
                          }}
                        />
                      </div>
                      {isCartao ? (
                        <p className="text-xs sm:text-sm font-poppins text-gray-600">
                          Forma: {parcela.formaPagamento.replace('CARTAO_', '').replace('_', ' ').toLowerCase()}
                        </p>
                      ) : (
                        <div>
                          <select
                            className="border border-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-poppins text-xs sm:text-sm w-full transition-all"
                            id={`formaPagamento-${parcela.id}`}
                            onChange={(e) => handleFormaPagamentoChange(
                              parcela.id,
                              e.target.value,
                              formasPagamento[parcela.id]?.bandeira || '',
                              formasPagamento[parcela.id]?.modalidade || '',
                              document.getElementById(`valorPago-${parcela.id}`).value
                            )}
                          >
                            <option value="">Selecione a forma</option>
                            <option value="DINHEIRO">Dinheiro</option>
                            <option value="PIX">Pix</option>
                            <option value="CARTAO">Cartão</option>
                          </select>
                        </div>
                      )}
                      {formasPagamento[parcela.id]?.forma === 'CARTAO' && (
                        <>
                          <div>
                            <select
                              className="border border-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-poppins text-xs sm:text-sm w-full transition-all"
                              id={`bandeira-${parcela.id}`}
                              onChange={(e) => handleFormaPagamentoChange(
                                parcela.id,
                                formasPagamento[parcela.id]?.forma || 'CARTAO',
                                e.target.value,
                                formasPagamento[parcela.id]?.modalidade || '',
                                document.getElementById(`valorPago-${parcela.id}`).value
                              )}
                            >
                              <option value="">Selecione a bandeira</option>
                              {[...new Set(taxasCartao.map((t) => t.bandeira))].map((band) => (
                                <option key={band} value={band}>{band}</option>
                              ))}
                            </select>
                          </div>
                          {formasPagamento[parcela.id]?.bandeira && (
                            <div>
                              <select
                                className="border border-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-poppins text-xs sm:text-sm w-full transition-all"
                                id={`modalidade-${parcela.id}`}
                                onChange={(e) => handleFormaPagamentoChange(
                                  parcela.id,
                                  formasPagamento[parcela.id]?.forma || 'CARTAO',
                                  formasPagamento[parcela.id]?.bandeira,
                                  e.target.value,
                                  document.getElementById(`valorPago-${parcela.id}`).value
                                )}
                              >
                                <option value="">Selecione a modalidade</option>
                                {taxasCartao
                                  .filter((t) => t.bandeira === formasPagamento[parcela.id]?.bandeira)
                                  .map((t) => (
                                    <option key={t.modalidade} value={t.modalidade}>
                                      {t.modalidade.replace('_', ' ').toLowerCase()}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {formasPagamento[parcela.id]?.taxa > 0 && (
                      <p className="text-xs sm:text-sm font-poppins text-gray-600">
                        Taxa (pagamento): R$ {formasPagamento[parcela.id].taxa} | Líquido (pagamento): R$ {formasPagamento[parcela.id].valorLiquido}
                      </p>
                    )}
                    <input
                      type="text"
                      placeholder="Observação (ex: Comprovante XYZ)"
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
                        const forma = isCartao ? 'CARTAO' : formasPagamento[parcela.id]?.forma || 'PROMISSORIA';
                        const bandeiraCartao = isCartao ? bandeira : formasPagamento[parcela.id]?.bandeira;
                        const modalidadeCartao = isCartao ? modalidade : formasPagamento[parcela.id]?.modalidade;

                        if (!valorPago || parseFloat(valorPago) <= 0) {
                          toast.error('Digite um valor válido');
                          return;
                        }
                        if (parseFloat(valorPago) > (parcela.valorLiquido - (parcela.valorPago || 0))) {
                          toast.error('Valor pago não pode exceder o líquido pendente');
                          return;
                        }
                        if (!forma) {
                          toast.error('Selecione uma forma de pagamento');
                          return;
                        }
                        if (!isCartao && forma === 'CARTAO' && (!bandeiraCartao || !modalidadeCartao)) {
                          toast.error('Selecione bandeira e modalidade para cartão');
                          return;
                        }
                        if (!dataPagamento) {
                          toast.error('Selecione a data de pagamento');
                          return;
                        }
                        const selectedDate = new Date(dataPagamento);
                        const today = new Date();
                        if (selectedDate > today) {
                          toast.error('Data de pagamento não pode ser futura');
                          return;
                        }

                        marcarParcelaComoPaga(
                          parcela.id,
                          parseFloat(valorPago),
                          observacao || null,
                          forma,
                          isCartao ? bandeira : bandeiraCartao,
                          isCartao ? modalidade : modalidadeCartao,
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