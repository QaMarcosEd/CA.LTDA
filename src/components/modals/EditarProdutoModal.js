'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function EditarProdutoModal({ isOpen, onClose, produtoId, onSuccess }) {
  const [form, setForm] = useState({
    nome: '',
    tamanho: '',
    referencia: '',
    cor: '',
    quantidade: '',
    precoVenda: '',
    genero: '',
    modelo: '',
    marca: '',
    disponivel: true,
    dataRecebimento: '',
    lote: '',
    imagem: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && produtoId) {
      setLoading(true);
      fetch(`/api/produtos/${produtoId}`)
        .then(res => res.json())
        .then(produto => {
          if (!produto || produto.error) {
            toast.error('Produto não encontrado');
            onClose();
            return;
          }
          setForm({
            nome: produto.nome || '',
            tamanho: produto.tamanho || '',
            referencia: produto.referencia || '',
            cor: produto.cor || '',
            quantidade: produto.quantidade || '',
            precoVenda: produto.precoVenda || '',
            genero: produto.genero || '',
            modelo: produto.modelo || '',
            marca: produto.marca || '',
            disponivel: produto.quantidade > 0,
            dataRecebimento: produto.dataRecebimento ? format(new Date(produto.dataRecebimento), 'yyyy-MM-dd') : '',
            lote: produto.lote || '',
            imagem: produto.imagem || ''
          });
        })
        .catch(err => {
          console.error('Erro ao carregar produto:', err);
          toast.error('Erro ao carregar dados');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, produtoId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.tamanho || !form.referencia || !form.cor || !form.quantidade || !form.precoVenda || !form.genero || !form.modelo || !form.marca || !form.dataRecebimento) {
      toast.error('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    if (new Date(form.dataRecebimento).toString() === 'Invalid Date') {
      toast.error('Data de Recebimento inválida!');
      return;
    }
    if (new Date(form.dataRecebimento) > new Date()) {
      toast.error('Data de Recebimento não pode ser futura!');
      return;
    }

    const data = {
      id: produtoId,
      nome: form.nome,
      tamanho: parseInt(form.tamanho),
      referencia: form.referencia,
      cor: form.cor,
      quantidade: parseInt(form.quantidade),
      precoVenda: parseFloat(form.precoVenda),
      genero: form.genero,
      modelo: form.modelo,
      marca: form.marca,
      disponivel: parseInt(form.quantidade) > 0,
      dataRecebimento: new Date(form.dataRecebimento),
      lote: form.lote,
      imagem: form.imagem
    };

    try {
      const response = await fetch('/api/produtos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erro ao atualizar produto');
        return;
      }
      toast.success('Produto atualizado com sucesso!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error('Erro inesperado ao atualizar');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full m-4 flex flex-col max-h-[90vh] overflow-hidden transform transition-all duration-300">
        {/* Header estilizado com emoji */}
        <div className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✏️</span>
            <h2 className="text-2xl font-bold font-poppins">Editar Produto</h2>
          </div>
          <button onClick={onClose} aria-label="Fechar modal" className="text-white hover:text-gray-200 transition text-2xl">
            ❌
          </button>
        </div>

        {/* Conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-500 border-solid"></div>
              <span className="ml-3 text-gray-600 font-poppins">Carregando...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 text-gray-500">
              {/* Inputs com labels flutuantes padronizados (fixos em cima pra consistência) */}
              <div className="relative col-span-1">
                <input 
                  name="nome" 
                  value={form.nome} 
                  placeholder=" " 
                  onChange={handleChange} 
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-transparent font-poppins text-sm" 
                />
                <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-green-500">
                  Nome <span className="text-red-500 ml-1">*</span>
                </label>
              </div>

              <div className="relative col-span-1">
                <input 
                  name="tamanho" 
                  type="number" 
                  value={form.tamanho} 
                  placeholder=" " 
                  onChange={handleChange} 
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-transparent font-poppins text-sm" 
                />
                <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-green-500">
                  Tamanho <span className="text-red-500 ml-1">*</span>
                </label>
              </div>

              <div className="relative col-span-1">
                <input 
                  name="referencia" 
                  value={form.referencia} 
                  placeholder=" " 
                  onChange={handleChange} 
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-transparent font-poppins text-sm" 
                />
                <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-green-500">
                  Referência <span className="text-red-500 ml-1">*</span>
                </label>
              </div>

              <div className="relative col-span-1">
                <input 
                  name="cor" 
                  value={form.cor} 
                  placeholder=" " 
                  onChange={handleChange} 
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-transparent font-poppins text-sm" 
                />
                <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-green-500">
                  Cor <span className="text-red-500 ml-1">*</span>
                </label>
              </div>

              <div className="relative col-span-1">
                <input 
                  name="quantidade" 
                  type="number" 
                  value={form.quantidade} 
                  placeholder=" " 
                  onChange={handleChange} 
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-transparent font-poppins text-sm" 
                />
                <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-green-500">
                  Quantidade <span className="text-red-500 ml-1">*</span>
                </label>
              </div>

              <div className="relative col-span-1">
                <input 
                  name="precoVenda" 
                  type="number" 
                  step="0.01" 
                  value={form.precoVenda} 
                  placeholder=" " 
                  onChange={handleChange} 
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-transparent font-poppins text-sm" 
                />
                <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-green-500">
                  Preço de Venda <span className="text-red-500 ml-1">*</span>
                </label>
              </div>

              <div className="relative col-span-1 md:col-span-2">
                <input 
                  name="imagem" 
                  type="text" 
                  value={form.imagem} 
                  placeholder=" " 
                  onChange={handleChange} 
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-transparent font-poppins text-sm" 
                />
                <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-green-500">
                  URL da Imagem
                </label>
                {form.imagem && (
                  <img 
                    src={form.imagem} 
                    alt="Preview da imagem" 
                    className="mt-3 max-w-full h-48 object-cover rounded-lg shadow-md border border-gray-200"
                  />
                )}
              </div>

              <div className="relative col-span-1">
                <select 
                  name="genero" 
                  value={form.genero} 
                  onChange={handleChange} 
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 font-poppins text-sm"
                >
                  <option value="">Selecione o gênero</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMININO">Feminino</option>
                  <option value="INFANTIL_MASCULINO">Infantil Masculino</option>
                  <option value="INFANTIL_FEMININO">Infantil Feminino</option>
                </select>
                <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-green-500">
                  Gênero <span className="text-red-500 ml-1">*</span>
                </label>
              </div>

              <div className="relative col-span-1">
                <select 
                  name="modelo" 
                  value={form.modelo} 
                  onChange={handleChange} 
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 font-poppins text-sm"
                >
                  <option value="">Selecione o modelo</option>
                  <option value="Tênis">Tênis</option>
                  <option value="Sapatênis">Sapatênis</option>
                  <option value="Sandália">Sandália</option>
                  <option value="Rasteira">Rasteira</option>
                  <option value="Tamanco">Tamanco</option>
                  <option value="Scarpin">Scarpin</option>
                  <option value="Bota">Bota</option>
                  <option value="Chinelo">Chinelo</option>
                  <option value="Mocassim">Mocassim</option>
                </select>
                <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-green-500">
                  Modelo <span className="text-red-500 ml-1">*</span>
                </label>
              </div>

              <div className="relative col-span-1">
                <input 
                  name="marca" 
                  value={form.marca} 
                  placeholder=" " 
                  onChange={handleChange} 
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-transparent font-poppins text-sm" 
                />
                <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-green-500">
                  Marca <span className="text-red-500 ml-1">*</span>
                </label>
              </div>

              <div className="relative col-span-1">
                <input 
                  name="lote" 
                  value={form.lote} 
                  placeholder=" " 
                  onChange={handleChange} 
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-transparent font-poppins text-sm" 
                />
                <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-green-500">
                  Lote
                </label>
              </div>

              <div className="relative col-span-1 md:col-span-2">
                <input 
                  name="dataRecebimento" 
                  type="date" 
                  value={form.dataRecebimento} 
                  max={format(new Date(), 'yyyy-MM-dd')} 
                  onChange={handleChange} 
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 font-poppins text-sm" 
                />
                <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-green-500">
                  Data de Recebimento <span className="text-red-500 ml-1">*</span>
                </label>
              </div>

              <div className="col-span-1 md:col-span-2 text-sm text-gray-600 bg-white p-4 rounded-lg shadow-inner border border-gray-200">
                Status: <span className={`inline-block px-3 py-1 rounded-full font-semibold text-sm ${form.disponivel ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {form.disponivel ? '✅ Disponível' : '❌ Esgotado'}
                </span>
              </div>
            </form>
          )}
        </div>

        {/* Footer com botões e emojis */}
        {!loading && (
          <div className="p-6 bg-white border-t border-gray-200 flex gap-4">
            <button 
              type="submit" 
              onClick={handleSubmit} 
              aria-label="Atualizar produto"
              className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-md text-sm md:text-base font-poppins"
            >
              ✅ Atualizar
            </button>
            <button 
              onClick={onClose} 
              aria-label="Cancelar edição"
              className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-400 transition-all duration-200 flex items-center justify-center gap-2 shadow-md text-sm md:text-base font-poppins"
            >
              ❌ Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}