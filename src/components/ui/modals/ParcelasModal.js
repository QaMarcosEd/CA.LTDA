// 'use client';

// import toast from 'react-hot-toast';

// export default function ParcelasModal({ isOpen, venda, onClose, marcarParcelaComoPaga }) {
//   if (!isOpen || !venda) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 w-full max-w-lg">
//         <h2 className="text-xl font-bold font-poppins text-gray-900 mb-4">
//           Parcelas da Venda #{venda.id}
//         </h2>
//         <p className="text-sm font-poppins text-gray-600 mb-4">
//           Entrada: R$ {venda.entrada.toFixed(2)}
//         </p>

//         <div className="space-y-4">
//           {venda.parcelas.map((parcela) => (
//             <div key={parcela.id} className="border-b pb-2">
//               <p className="text-sm font-poppins text-gray-700">
//                 Parcela {parcela.numeroParcela}: R$ {parcela.valor.toFixed(2)} 
//                 (Vencimento: {new Date(parcela.dataVencimento).toLocaleDateString('pt-BR')})
//               </p>
//               <p className="text-sm font-poppins text-gray-700">
//                 Status: {parcela.pago ? 'Pago' : 'Pendente'}
//               </p>

//               {parcela.valorPago > 0 && (
//                 <p className="text-sm font-poppins text-gray-700">
//                   Valor Pago: R$ {parcela.valorPago.toFixed(2)}
//                 </p>
//               )}

//               {!parcela.pago && (
//                 <div className="mt-2">
//                   <p className="text-sm font-poppins text-gray-700">
//                     Pendente: R$ {(parcela.valor - (parcela.valorPago || 0)).toFixed(2)}
//                   </p>
//                   <div className="flex space-x-2 mt-2 text-gray-600">
//                     <input
//                       type="number"
//                       step="0.01"
//                       placeholder="Valor a pagar"
//                       className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
//                       id={`valorPago-${parcela.id}`}
//                     />
//                     <input
//                       type="text"
//                       placeholder="Observação (ex: Pago via PIX)"
//                       className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
//                       id={`observacao-${parcela.id}`}
//                     />
//                     <button
//                       onClick={() => {
//                         const valorPago = document.getElementById(`valorPago-${parcela.id}`).value;
//                         const observacao = document.getElementById(`observacao-${parcela.id}`).value;
//                         if (!valorPago || parseFloat(valorPago) <= 0) {
//                           toast.error('Digite um valor válido');
//                           return;
//                         }
//                         marcarParcelaComoPaga(parcela.id, valorPago, observacao || null);
//                       }}
//                       className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 font-poppins text-sm"
//                     >
//                       Pagar
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>

//         <div className="mt-4 flex justify-end">
//           <button
//             onClick={onClose}
//             className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 font-poppins text-sm"
//           >
//             Fechar
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }









// 'use client';

// import { useState, useEffect } from 'react';
// import toast from 'react-hot-toast';

// export default function ParcelasModal({ isOpen, venda, onClose, marcarParcelaComoPaga }) {
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
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 w-full max-w-lg">
//         <h2 className="text-xl font-bold font-poppins text-gray-900 mb-4">
//           Parcelas da Venda #{venda.id}
//         </h2>
//         <p className="text-sm font-poppins text-gray-600 mb-2">
//           Entrada: R$ {venda.entrada.toFixed(2)}
//         </p>
//         <p className="text-sm font-poppins text-gray-600 mb-4">
//           Forma de Pagamento: {venda.formaPagamento || 'N/A'}
//         </p>

//         <div className="space-y-4">
//           {venda.parcelas.map((parcela) => (
//             <div key={parcela.id} className="border-b pb-2">
//               <p className="text-sm font-poppins text-gray-700">
//                 Parcela {parcela.numeroParcela}: R$ {parcela.valor.toFixed(2)} 
//                 (Vencimento: {new Date(parcela.dataVencimento).toLocaleDateString('pt-BR')})
//               </p>
//               <p className="text-sm font-poppins text-gray-700">
//                 Status: {parcela.pago ? 'Pago' : 'Pendente'}
//               </p>
//               {parcela.pago && (
//                 <>
//                   <p className="text-sm font-poppins text-gray-700">
//                     Valor Pago: R$ {parcela.valorPago.toFixed(2)}
//                   </p>
//                   <p className="text-sm font-poppins text-gray-700">
//                     Forma: {parcela.formaPagamento || 'N/A'}
//                   </p>
//                   {parcela.taxa > 0 && (
//                     <p className="text-sm font-poppins text-gray-700">
//                       Taxa: R$ {parcela.taxa.toFixed(2)} | Líquido: R$ {parcela.valorLiquido.toFixed(2)}
//                     </p>
//                   )}
//                   {parcela.dataPagamento && (
//                     <p className="text-sm font-poppins text-gray-700">
//                       Pago em: {new Date(parcela.dataPagamento).toLocaleDateString('pt-BR')}
//                     </p>
//                   )}
//                 </>
//               )}

//               {!parcela.pago && (
//                 <div className="mt-2">
//                   <p className="text-sm font-poppins text-gray-700">
//                     Pendente: R$ {(parcela.valor - (parcela.valorPago || 0)).toFixed(2)}
//                   </p>
//                   <div className="space-y-2 mt-2 text-gray-600">
//                     <input
//                       type="number"
//                       step="0.01"
//                       placeholder="Valor a pagar"
//                       className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
//                       id={`valorPago-${parcela.id}`}
//                       onChange={(e) => handleFormaPagamentoChange(
//                         parcela.id,
//                         formasPagamento[parcela.id]?.forma || '',
//                         formasPagamento[parcela.id]?.bandeira || '',
//                         formasPagamento[parcela.id]?.modalidade || '',
//                         e.target.value
//                       )}
//                     />
//                     <select
//                       className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
//                       id={`formaPagamento-${parcela.id}`}
//                       onChange={(e) => handleFormaPagamentoChange(
//                         parcela.id,
//                         e.target.value,
//                         formasPagamento[parcela.id]?.bandeira || '',
//                         formasPagamento[parcela.id]?.modalidade || '',
//                         document.getElementById(`valorPago-${parcela.id}`).value
//                       )}
//                     >
//                       <option value="">Forma de pagamento</option>
//                       <option value="DINHEIRO">Dinheiro</option>
//                       <option value="PIX">Pix</option>
//                       <option value="CARTAO">Cartão</option>
//                     </select>
//                     {formasPagamento[parcela.id]?.forma === 'CARTAO' && (
//                       <>
//                         <select
//                           className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
//                           id={`bandeira-${parcela.id}`}
//                           onChange={(e) => handleFormaPagamentoChange(
//                             parcela.id,
//                             formasPagamento[parcela.id]?.forma || 'CARTAO',
//                             e.target.value,
//                             formasPagamento[parcela.id]?.modalidade || '',
//                             document.getElementById(`valorPago-${parcela.id}`).value
//                           )}
//                         >
//                           <option value="">Selecione a bandeira</option>
//                           {[...new Set(taxasCartao.map((t) => t.bandeira))].map((band) => (
//                             <option key={band} value={band}>{band}</option>
//                           ))}
//                         </select>
//                         {formasPagamento[parcela.id]?.bandeira && (
//                           <select
//                             className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
//                             id={`modalidade-${parcela.id}`}
//                             onChange={(e) => handleFormaPagamentoChange(
//                               parcela.id,
//                               formasPagamento[parcela.id]?.forma || 'CARTAO',
//                               formasPagamento[parcela.id]?.bandeira,
//                               e.target.value,
//                               document.getElementById(`valorPago-${parcela.id}`).value
//                             )}
//                           >
//                             <option value="">Selecione a modalidade</option>
//                             {taxasCartao
//                               .filter((t) => t.bandeira === formasPagamento[parcela.id]?.bandeira)
//                               .map((t) => (
//                                 <option key={t.modalidade} value={t.modalidade}>
//                                   {t.modalidade.replace('_', ' ').toLowerCase()}
//                                 </option>
//                               ))}
//                           </select>
//                         )}
//                         {formasPagamento[parcela.id]?.taxa > 0 && (
//                           <p className="text-sm font-poppins text-gray-600">
//                             Taxa: R$ {formasPagamento[parcela.id].taxa} | Líquido: R$ {formasPagamento[parcela.id].valorLiquido}
//                           </p>
//                         )}
//                       </>
//                     )}
//                     <input
//                       type="text"
//                       placeholder="Observação (ex: Comprovante XYZ)"
//                       className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
//                       id={`observacao-${parcela.id}`}
//                     />
//                     <button
//                       onClick={() => {
//                         const valorPago = document.getElementById(`valorPago-${parcela.id}`).value;
//                         const observacao = document.getElementById(`observacao-${parcela.id}`).value;
//                         const forma = formasPagamento[parcela.id]?.forma;
//                         const bandeira = formasPagamento[parcela.id]?.bandeira;
//                         const modalidade = formasPagamento[parcela.id]?.modalidade;
//                         if (!valorPago || parseFloat(valorPago) <= 0) {
//                           toast.error('Digite um valor válido');
//                           return;
//                         }
//                         if (!forma) {
//                           toast.error('Selecione uma forma de pagamento');
//                           return;
//                         }
//                         if (forma === 'CARTAO' && (!bandeira || !modalidade)) {
//                           toast.error('Selecione bandeira e modalidade para cartão');
//                           return;
//                         }
//                         marcarParcelaComoPaga(parcela.id, valorPago, observacao || null, forma, bandeira, modalidade);
//                       }}
//                       className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 font-poppins text-sm"
//                     >
//                       Pagar
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>

//         <div className="mt-4 flex justify-end">
//           <button
//             onClick={onClose}
//             className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 font-poppins text-sm"
//           >
//             Fechar
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }




'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function ParcelasModal({ isOpen, venda, onClose, marcarParcelaComoPaga }) {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold font-poppins text-gray-900 mb-4">
          Parcelas da Venda #{venda.id}
        </h2>
        <p className="text-sm font-poppins text-gray-600 mb-2">
          Entrada: R$ {venda.entrada.toFixed(2)}
        </p>
        <p className="text-sm font-poppins text-gray-600 mb-4">
          Forma de Pagamento: {venda.formaPagamento?.replace('CARTAO_', '').replace('_', ' ').toLowerCase() || 'N/A'}
        </p>

        <div className="space-y-4">
          {venda.parcelas.map((parcela) => {
            const isCartao = parcela.formaPagamento?.startsWith('CARTAO_');
            const [_, bandeira, modalidade] = parcela.formaPagamento?.split('_') || [];
            return (
              <div key={parcela.id} className="border-b pb-2">
                <p className="text-sm font-poppins text-gray-700">
                  Parcela {parcela.numeroParcela}: R$ {parcela.valor.toFixed(2)} 
                  (Previsão: {new Date(parcela.dataVencimento).toLocaleDateString('pt-BR')})
                </p>
                <p className="text-sm font-poppins text-gray-700">
                  Status: {parcela.pago ? 'Pago' : 'Pendente'}
                </p>
                {parcela.pago && (
                  <>
                    <p className="text-sm font-poppins text-gray-700">
                      Valor Pago: R$ {parcela.valorPago.toFixed(2)}
                    </p>
                    <p className="text-sm font-poppins text-gray-700">
                      Forma: {parcela.formaPagamento?.replace('CARTAO_', '').replace('_', ' ').toLowerCase() || 'N/A'}
                    </p>
                    {parcela.taxa > 0 && (
                      <p className="text-sm font-poppins text-gray-700">
                        Taxa: R$ {parcela.taxa.toFixed(2)} | Líquido: R$ {parcela.valorLiquido.toFixed(2)}
                      </p>
                    )}
                    {parcela.dataPagamento && (
                      <p className="text-sm font-poppins text-gray-700">
                        Pago em: {new Date(parcela.dataPagamento).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </>
                )}

                {!parcela.pago && (
                  <div className="mt-2">
                    <p className="text-sm font-poppins text-gray-700">
                      Pendente: R$ {(parcela.valor - (parcela.valorPago || 0)).toFixed(2)}
                    </p>
                    <div className="space-y-2 mt-2 text-gray-600">
                      <input
                        type="number"
                        step="0.01"
                        defaultValue={parcela.valor - (parcela.valorPago || 0)} // Default é o valor pendente
                        placeholder="Valor a pagar"
                        className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
                        id={`valorPago-${parcela.id}`}
                        onChange={(e) => {
                          if (!isCartao) {
                            handleFormaPagamentoChange(
                              parcela.id,
                              formasPagamento[parcela.id]?.forma || 'PROMISSORIA',
                              formasPagamento[parcela.id]?.bandeira || '',
                              formasPagamento[parcela.id]?.modalidade || '',
                              e.target.value
                            );
                          }
                        }}
                      />
                      {isCartao ? (
                        <p className="text-sm font-poppins text-gray-700">
                          Forma: {parcela.formaPagamento.replace('CARTAO_', '').replace('_', ' ').toLowerCase()}
                        </p>
                      ) : (
                        <>
                          <select
                            className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
                            id={`formaPagamento-${parcela.id}`}
                            onChange={(e) => handleFormaPagamentoChange(
                              parcela.id,
                              e.target.value,
                              formasPagamento[parcela.id]?.bandeira || '',
                              formasPagamento[parcela.id]?.modalidade || '',
                              document.getElementById(`valorPago-${parcela.id}`).value
                            )}
                          >
                            <option value="">Forma de pagamento</option>
                            <option value="DINHEIRO">Dinheiro</option>
                            <option value="PIX">Pix</option>
                            <option value="CARTAO">Cartão</option>
                          </select>
                          {formasPagamento[parcela.id]?.forma === 'CARTAO' && (
                            <>
                              <select
                                className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
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
                              {formasPagamento[parcela.id]?.bandeira && (
                                <select
                                  className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
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
                              )}
                              {formasPagamento[parcela.id]?.taxa > 0 && (
                                <p className="text-sm font-poppins text-gray-600">
                                  Taxa: R$ {formasPagamento[parcela.id].taxa} | Líquido: R$ {formasPagamento[parcela.id].valorLiquido}
                                </p>
                              )}
                            </>
                          )}
                        </>
                      )}
                      <input
                        type="text"
                        placeholder="Observação (ex: Comprovante XYZ)"
                        className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
                        id={`observacao-${parcela.id}`}
                      />
                      <input
                        type="date"
                        max={format(new Date(), 'yyyy-MM-dd')}
                        className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
                        id={`dataPagamento-${parcela.id}`}
                      />
                      <button
                        onClick={() => {
                          const valorPago = document.getElementById(`valorPago-${parcela.id}`).value;
                          const observacao = document.getElementById(`observacao-${parcela.id}`).value;
                          const dataPagamento = document.getElementById(`dataPagamento-${parcela.id}`).value;
                          const forma = isCartao ? parcela.formaPagamento.split('_')[0] : formasPagamento[parcela.id]?.forma || 'PROMISSORIA';
                          const bandeiraCartao = isCartao ? parcela.formaPagamento.split('_')[1] : formasPagamento[parcela.id]?.bandeira;
                          const modalidadeCartao = isCartao ? parcela.formaPagamento.split('_')[2] : formasPagamento[parcela.id]?.modalidade;

                          if (!valorPago || parseFloat(valorPago) <= 0) {
                            toast.error('Digite um valor válido');
                            return;
                          }
                          if (!isCartao && !forma) {
                            toast.error('Selecione uma forma de pagamento');
                            return;
                          }
                          if (!isCartao && forma === 'CARTAO' && (!bandeiraCartao || !modalidadeCartao)) {
                            toast.error('Selecione bandeira e modalidade para cartão');
                            return;
                          }

                          marcarParcelaComoPaga(
                            parcela.id,
                            valorPago,
                            observacao || null,
                            isCartao ? 'CARTAO' : forma,
                            bandeiraCartao,
                            modalidadeCartao,
                            dataPagamento || new Date().toISOString().split('T')[0]
                          );
                        }}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 font-poppins text-sm"
                      >
                        Confirmar Recebimento
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 font-poppins text-sm"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}