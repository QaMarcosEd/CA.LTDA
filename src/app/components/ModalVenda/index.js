import { useState, useEffect } from 'react';

export default function ModalVenda({ isOpen, onClose, produto, onSubmit }) {
  const [quantidade, setQuantidade] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [valorPago, setValorPago] = useState('');

  // Atualiza valorPago quando o produto muda (quando o modal abre)
  useEffect(() => {
    if (produto) {
      setValorPago(produto.preco); // pré-preenche com o preço do produto
    }
  }, [produto]);

  const handleConfirm = () => {
    if (!quantidade || quantidade <= 0) return alert('Digite uma quantidade válida');
    if (!clienteNome) return alert('Digite o nome do cliente');
    if (!valorPago || valorPago <= 0) return alert('Digite o valor pago');

    onSubmit({
      produtoId: produto.id,
      quantidade: parseInt(quantidade),
      nomeCliente: clienteNome,  // ⚠️ use nomeCliente aqui para bater com a API
      valorPago: parseFloat(valorPago),
    });

    // limpa campos depois de salvar
    setQuantidade('');
    setClienteNome('');
    setValorPago('');
  };

  if (!isOpen || !produto) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center text-gray-800">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Registrar Venda - {produto.nome}</h2>
        <p className="text-gray-600 mb-2">Estoque atual: {produto.quantidade}</p>
        <p className="text-gray-600 mb-4">Preço do produto: R$ {produto.preco.toFixed(2)}</p>

        <input
          type="number"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
          placeholder="Quantidade a vender"
          className="border border-gray-300 p-3 w-full rounded-lg mb-4"
        />

        <input
          type="text"
          value={clienteNome}
          onChange={(e) => setClienteNome(e.target.value)}
          placeholder="Nome do cliente"
          className="border border-gray-300 p-3 w-full rounded-lg mb-4"
        />

        <input
          type="number"
          step="0.01"
          value={valorPago}
          onChange={(e) => setValorPago(e.target.value)}
          placeholder="Valor pago (R$)"
          className="border border-gray-300 p-3 w-full rounded-lg mb-4"
        />

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
