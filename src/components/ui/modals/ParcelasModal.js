'use client';

import toast from 'react-hot-toast';

export default function ParcelasModal({ isOpen, venda, onClose, marcarParcelaComoPaga }) {
  if (!isOpen || !venda) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold font-poppins text-gray-900 mb-4">
          Parcelas da Venda #{venda.id}
        </h2>
        <p className="text-sm font-poppins text-gray-600 mb-4">
          Entrada: R$ {venda.entrada.toFixed(2)}
        </p>

        <div className="space-y-4">
          {venda.parcelas.map((parcela) => (
            <div key={parcela.id} className="border-b pb-2">
              <p className="text-sm font-poppins text-gray-700">
                Parcela {parcela.numeroParcela}: R$ {parcela.valor.toFixed(2)} 
                (Vencimento: {new Date(parcela.dataVencimento).toLocaleDateString('pt-BR')})
              </p>
              <p className="text-sm font-poppins text-gray-700">
                Status: {parcela.pago ? 'Pago' : 'Pendente'}
              </p>

              {parcela.valorPago > 0 && (
                <p className="text-sm font-poppins text-gray-700">
                  Valor Pago: R$ {parcela.valorPago.toFixed(2)}
                </p>
              )}

              {!parcela.pago && (
                <div className="mt-2">
                  <p className="text-sm font-poppins text-gray-700">
                    Pendente: R$ {(parcela.valor - (parcela.valorPago || 0)).toFixed(2)}
                  </p>
                  <div className="flex space-x-2 mt-2 text-gray-600">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Valor a pagar"
                      className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
                      id={`valorPago-${parcela.id}`}
                    />
                    <input
                      type="text"
                      placeholder="Observação (ex: Pago via PIX)"
                      className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
                      id={`observacao-${parcela.id}`}
                    />
                    <button
                      onClick={() => {
                        const valorPago = document.getElementById(`valorPago-${parcela.id}`).value;
                        const observacao = document.getElementById(`observacao-${parcela.id}`).value;
                        if (!valorPago || parseFloat(valorPago) <= 0) {
                          toast.error('Digite um valor válido');
                          return;
                        }
                        marcarParcelaComoPaga(parcela.id, valorPago, observacao || null);
                      }}
                      className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 font-poppins text-sm"
                    >
                      Pagar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
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