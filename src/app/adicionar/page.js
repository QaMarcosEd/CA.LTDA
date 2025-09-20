'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function Adicionar() {
  const [form, setForm] = useState({ 
    nome: '', 
    tamanho: '', 
    referencia: '', 
    cor: '', 
    quantidade: '', 
    preco: '', 
    genero: '', 
    modelo: '', 
    marca: '' 
  });
  const [isLoading, setIsLoading] = useState(false); // ← ADICIONADO: Estado de loading
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // ← ADICIONADO: Inicia loading
    
    // Validação de campos obrigatórios e numéricos ANTES de enviar
    const camposObrigatorios = ['nome', 'tamanho', 'referencia', 'cor', 'quantidade', 'preco', 'genero', 'modelo', 'marca'];
    const faltando = camposObrigatorios.filter(c => !form[c] || form[c] === '');
    
    if (faltando.length > 0) {
      toast.error(`Campos obrigatórios faltando: ${faltando.join(', ')}`);
      setIsLoading(false); // ← ADICIONADO: Para loading se validação falhar
      return;
    }
    
    // Validações numéricas
    const tamanhoNum = parseInt(form.tamanho);
    const quantidadeNum = parseInt(form.quantidade);
    const precoNum = parseFloat(form.preco);
    
    if (isNaN(tamanhoNum) || tamanhoNum <= 0) {
      toast.error('Tamanho deve ser um número maior que 0');
      setIsLoading(false); // ← ADICIONADO: Para loading se validação falhar
      return;
    }
    if (isNaN(quantidadeNum) || quantidadeNum < 0) {
      toast.error('Quantidade inválida');
      setIsLoading(false); // ← ADICIONADO: Para loading se validação falhar
      return;
    }
    if (isNaN(precoNum) || precoNum < 0) {
      toast.error('Preço deve ser um número maior ou igual a 0');
      setIsLoading(false); // ← ADICIONADO: Para loading se validação falhar
      return;
    }
    
    // Se passou nas validações, monta o data
    const data = {
      nome: form.nome,
      tamanho: tamanhoNum,  // Já é number válido
      referencia: form.referencia,
      cor: form.cor,
      quantidade: quantidadeNum,
      preco: precoNum,
      genero: form.genero,
      modelo: form.modelo,
      marca: form.marca,
      // Remove 'disponivel' daqui – a API já calcula isso
    };

    try {
      const response = await fetch('/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro ao salvar:', errorData);
        toast.error(errorData.error || 'Erro ao salvar produto ❌');
        return;
      }

      // Se chegou aqui, sucesso!
      toast.success('Produto salvo com sucesso ✅');
      console.log('Antes do router.replace');
      
      // Tenta replace primeiro, depois refresh para forçar revalidação
      router.replace('/');
      router.refresh();  // Isso força o fetch da página inicial para mostrar o novo produto
      
      console.log('Depois do router.replace');
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro de conexão com o servidor ❌');
    } finally {
      setIsLoading(false); // ← ADICIONADO: SEMPRE para o loading
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Adicionar Produto</h1>
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-6 sm:p-8 space-y-5">
          <input 
            name="nome" 
            placeholder="Nome" 
            onChange={handleChange} 
            value={form.nome}
            disabled={isLoading} // ← ADICIONADO: Desabilita inputs durante loading
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 placeholder-gray-500 text-gray-800 text-base disabled:bg-gray-100 disabled:cursor-not-allowed" 
          />
          <input 
            name="tamanho" 
            type="number" 
            placeholder="Tamanho" 
            onChange={handleChange}
            value={form.tamanho}
            disabled={isLoading}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 placeholder-gray-500 text-gray-800 text-base disabled:bg-gray-100 disabled:cursor-not-allowed" 
          />
          <input 
            name="referencia" 
            placeholder="Referência (ex: NK-123)" 
            onChange={handleChange}
            value={form.referencia}
            disabled={isLoading}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 placeholder-gray-500 text-gray-800 text-base disabled:bg-gray-100 disabled:cursor-not-allowed" 
          />
          <input 
            name="cor" 
            placeholder="Cor" 
            onChange={handleChange}
            value={form.cor}
            disabled={isLoading}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 placeholder-gray-500 text-gray-800 text-base disabled:bg-gray-100 disabled:cursor-not-allowed" 
          />
          <input 
            name="quantidade" 
            type="number" 
            placeholder="Quantidade" 
            onChange={handleChange}
            value={form.quantidade}
            disabled={isLoading}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 placeholder-gray-500 text-gray-800 text-base disabled:bg-gray-100 disabled:cursor-not-allowed" 
          />
          <input 
            name="preco" 
            type="number" 
            step="0.01" 
            placeholder="Preço" 
            onChange={handleChange}
            value={form.preco}
            disabled={isLoading}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 placeholder-gray-500 text-gray-800 text-base disabled:bg-gray-100 disabled:cursor-not-allowed" 
          />
          <select 
            name="genero" 
            onChange={handleChange}
            value={form.genero}
            disabled={isLoading}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-gray-800 text-base placeholder-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Selecione o gênero</option>
            <option value="MASCULINO">Masculino</option>
            <option value="FEMININO">Feminino</option>
            <option value="INFANTIL_MASCULINO">Infantil Masculino</option>
            <option value="INFANTIL_FEMININO">Infantil Feminino</option>
          </select>
          <select 
            name="modelo" 
            onChange={handleChange}
            value={form.modelo}
            disabled={isLoading}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-gray-800 text-base placeholder-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Selecione o modelo</option>
            <option value="TENIS">Tênis</option>
            <option value="SAPATENIS">Sapatênis</option>
            <option value="SANDALIA">Sandália</option>
            <option value="RASTEIRA">Rasteira</option>
            <option value="TAMANCO">Tamanco</option>
            <option value="SCARPIN">Scarpin</option>
            <option value="BOTA">Bota</option>
            <option value="CHINELO">Chinelo</option>
            <option value="MOCASSIM">Mocassim</option>
            <option value="OXFORD">Oxford</option>
            <option value="PEEPTOE">Peep Toe</option>
            <option value="SLINGBACK">Slingback</option>
          </select>
          <input 
            name="marca" 
            placeholder="Marca" 
            onChange={handleChange}
            value={form.marca}
            disabled={isLoading}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 placeholder-gray-500 text-gray-800 text-base disabled:bg-gray-100 disabled:cursor-not-allowed" 
          />
          <p className="text-sm text-gray-600">Status: {parseInt(form.quantidade) > 0 ? 'Disponível' : 'Esgotado'}</p>
          <button 
            type="submit" 
            disabled={isLoading}
            className={`px-4 py-3 rounded-lg w-full font-medium transition duration-200 ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed text-gray-200' 
                : 'bg-green-600 hover:bg-green-500 active:bg-green-700 text-white'
            }`}
          >
            {isLoading ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </div>
    </div>
  );
}
