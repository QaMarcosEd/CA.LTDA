// components/ModalVenda/index.js
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { formatPhoneNumber } from '../../../utils/formatPhoneNumber';

export default function ModalVenda({ isOpen, onClose, produto, onSubmit }) {
  const [quantidade, setQuantidade] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [apelido, setApelido] = useState('');
  const [telefone, setTelefone] = useState('');
  const [valorPago, setValorPago] = useState('');
  const [clientes, setClientes] = useState([]);
  const [isNewCliente, setIsNewCliente] = useState(false);

  useEffect(() => {
    if (produto) {
      setValorPago(produto.preco.toFixed(2));
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
    }
  }, [produto, isOpen]);

  const handleConfirm = async () => {
    if (!quantidade || quantidade <= 0) {
      toast.error('Digite uma quantidade válida');
      return;
    }
    if (quantidade > produto.quantidade) {
      toast.error('Quantidade maior que o estoque disponível');
      return;
    }
    if (!clienteNome) {
      toast.error('Selecione ou digite o nome do cliente');
      return;
    }
    if (!valorPago || valorPago <= 0) {
      toast.error('Digite o valor pago');
      return;
    }

    try {
      let clienteId;

      if (isNewCliente) {
        const res = await fetch('/api/clientes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: clienteNome, apelido, telefone }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          toast.error(errorData.error || 'Erro ao criar cliente');
          return;
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

      onSubmit({
        produtoId: produto.id,
        quantidade: parseInt(quantidade),
        clienteId,
        valorPago: parseFloat(valorPago),
      });

      setQuantidade('');
      setClienteNome('');
      setApelido('');
      setTelefone('');
      setValorPago('');
      setIsNewCliente(false);
      toast.success('Venda registrada com sucesso! ✅');
    } catch (error) {
      console.error('Erro ao registrar venda:', error);
      toast.error('Erro inesperado ao registrar venda');
    }
  };

  if (!isOpen || !produto) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold font-poppins text-gray-900 mb-4">
          Registrar Venda - {produto.nome}
        </h2>
        <p className="text-gray-600 font-poppins text-sm mb-2">
          Estoque atual: {produto.quantidade}
        </p>
        <p className="text-gray-600 font-poppins text-sm mb-4">
          Preço do produto: R$ {produto.preco.toFixed(2)}
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium font-poppins text-gray-700">
            Quantidade
          </label>
          <input
            type="text"
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
            <div className="space-y-4">
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
                className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
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
            Valor Pago
          </label>
          <input
            type="number"
            step="0.01"
            value={valorPago}
            onChange={(e) => setValorPago(e.target.value)}
            placeholder="Valor pago (R$)"
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
          />
        </div>

        <div className="flex justify-end space-x-2">
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
