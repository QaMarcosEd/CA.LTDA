'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function ModalLote({ isOpen, onClose, onSubmit }) {
  const [genericos, setGenericos] = useState({
    nome: '',
    referencia: '',
    cor: '',
    preco: '',
    genero: '',
    modelo: '',
    marca: '',
    lote: '',
    dataRecebimento: format(new Date(), 'yyyy-MM-dd')
  });
  const [variacoes, setVariacoes] = useState([]);
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState('');

  const tamanhos = Array.from({ length: 25 }, (_, i) => 20 + i); // 20 a 44
  const tamanhosPorGenero = {
    MASCULINO: [36, 37, 38, 39, 40, 41, 42, 43, 44],
    FEMININO: [33, 34, 35, 36, 37, 38, 39, 40],
    INFANTIL_MASCULINO: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
    INFANTIL_FEMININO: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
  };

  const handleGenericosChange = (e) => {
    setGenericos({ ...genericos, [e.target.name]: e.target.value });
  };

  const toggleTamanho = (tamanho) => {
    const existente = variacoes.find(v => v.tamanho === tamanho);
    if (existente) {
      setVariacoes(variacoes.filter(v => v.tamanho !== tamanho));
    } else {
      setVariacoes([...variacoes, { tamanho, quantidade: 1 }]);
    }
  };

  const updateQuantidade = (tamanho, quantidade) => {
    setVariacoes(variacoes.map(v => v.tamanho === tamanho ? { ...v, quantidade: parseInt(quantidade) || 0 } : v));
  };

  const aplicarQuantidadeTodos = (quantidade) => {
    setVariacoes(variacoes.map(v => ({ ...v, quantidade: parseInt(quantidade) || 0 })));
  };

  const handleSubmit = async () => {
    if (!variacoes.length || variacoes.every(v => v.quantidade <= 0)) {
      toast.error('Selecione pelo menos um tamanho com quantidade maior que 0');
      return;
    }

    if (!genericos.dataRecebimento) {
      toast.error('Data de Recebimento é obrigatória');
      return;
    }
    if (new Date(genericos.dataRecebimento).toString() === 'Invalid Date') {
      toast.error('Data de Recebimento inválida');
      return;
    }
    if (new Date(genericos.dataRecebimento) > new Date()) {
      toast.error('Data de Recebimento não pode ser futura');
      return;
    }

    const data = { genericos, variacoes };
    const response = await onSubmit(data);
    if (response.status === 201) {
      toast.success('Lote cadastrado com sucesso! ✅');
      onClose();
      setGenericos({ nome: '', referencia: '', cor: '', preco: '', genero: '', modelo: '', marca: '', lote: '' });
      setVariacoes([]);
    } else {
      toast.error(response.data.error || 'Erro ao cadastrar lote ❌');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold font-poppins text-gray-900 mb-6">Cadastrar Lote de Calçados</h2>

        {/* Dados Genéricos */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold font-poppins text-gray-700 mb-4">Cadastro de Lote</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600">
            <input
              name="nome"
              value={genericos.nome}
              onChange={handleGenericosChange}
              placeholder="Nome do Modelo"
              className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
            />
            <input
              name="referencia"
              value={genericos.referencia}
              onChange={handleGenericosChange}
              placeholder="Referência"
              className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
            />
            <input
              name="cor"
              value={genericos.cor}
              onChange={handleGenericosChange}
              placeholder="Cor"
              className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
            />
            <input
              name="preco"
              type="number"
              value={genericos.preco}
              onChange={handleGenericosChange}
              placeholder="Preço (R$)"
              className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
            />
            <select
              name="genero"
              value={genericos.genero}
              onChange={handleGenericosChange}
              className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
            >
              <option value="">Selecione o Gênero</option>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMININO">Feminino</option>
              <option value="INFANTIL_MASCULINO">Infantil_Masculino</option>
              <option value="INFANTIL_FEMININO">Infantil_Feminino</option>
            </select>
            <input
              name="modelo"
              value={genericos.modelo}
              onChange={handleGenericosChange}
              placeholder="Modelo"
              className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
            />
            <input
              name="marca"
              value={genericos.marca}
              onChange={handleGenericosChange}
              placeholder="Marca"
              className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
            />
            <input
              name="lote"
              value={genericos.lote}
              onChange={handleGenericosChange}
              placeholder="Lote (opcional)"
              className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
            />
            <input
              name="dataRecebimento"
              type="date"
              value={genericos.dataRecebimento}
              onChange={handleGenericosChange}
              placeholder="Data de Recebimento"
              max={format(new Date(), 'yyyy-MM-dd')}
              className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
            />
          </div>
        </div>

        {/* Numerações e Quantidades */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold font-poppins text-gray-700 mb-4">Tamanhos e Quantidades</h3>
          <div className="grid grid-cols-6 gap-2 mb-4">
            {(genericos.genero ? tamanhosPorGenero[genericos.genero] || tamanhos : tamanhos).map(t => (
              <button
                key={t}
                onClick={() => toggleTamanho(t)}
                className={`p-2 rounded-lg text-sm font-poppins ${
                  variacoes.some(v => v.tamanho === t) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                } hover:bg-blue-500 hover:text-white transition-colors`}
              >
                {t}
              </button>
            ))}
          </div>
          {variacoes.length > 0 && (
            <div className="flex items-center mb-4 text-gray-600">
              <input
                type="number"
                placeholder="Quantidade para todos"
                onChange={(e) => aplicarQuantidadeTodos(e.target.value)}
                className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm mr-2"
              />
              <button
                onClick={() => aplicarQuantidadeTodos(document.querySelector('input[placeholder="Quantidade para todos"]').value)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-poppins text-sm"
              >
                Aplicar a Todos
              </button>
            </div>
          )}
          {variacoes.map(v => (
            <div key={v.tamanho} className="flex items-center mb-2">
              <span className="w-20 font-poppins text-sm text-gray-700">Tamanho {v.tamanho}:</span>
              <input
                type="number"
                value={v.quantidade}
                onChange={(e) => updateQuantidade(v.tamanho, e.target.value)}
                className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm w-20 text-gray-600"
                min="0"
              />
            </div>
          ))}
          <p className="text-sm font-poppins text-gray-600 mt-2">
            Total: {variacoes.reduce((sum, v) => sum + v.quantidade, 0)} pares
          </p>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 font-poppins text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-poppins text-sm"
          >
            Salvar Lote
          </button>
        </div>
      </div>
    </div>
  );
}

