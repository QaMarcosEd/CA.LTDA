'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function Adicionar() {
  const [form, setForm] = useState({ nome: '', tamanho: '', referencia: '', cor: '', quantidade: '', preco: '', genero: '', modelo: '', marca: '' });
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      nome: form.nome,
      tamanho: parseInt(form.tamanho),
      referencia: form.referencia,
      cor: form.cor,
      quantidade: parseInt(form.quantidade),
      preco: parseFloat(form.preco),
      genero: form.genero,
      modelo: form.modelo,
      marca: form.marca,
      disponivel: parseInt(form.quantidade) > 0,
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
        toast.error('Erro ao salvar produto ❌');
        return;
      }

      toast.success('Produto salvo com sucesso ✅');
      console.log('Antes do router.push');
      router.replace('/');
      router.refresh();
      console.log('Depois do router.push');
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro de conexão com o servidor ❌');
    }

  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Adicionar Produto</h1>
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-6 sm:p-8 space-y-5">
          <input name="nome" placeholder="Nome" onChange={handleChange} className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 placeholder-gray-500 text-gray-800 text-base" />
          <input name="tamanho" type="number" placeholder="Tamanho" onChange={handleChange} className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 placeholder-gray-500 text-gray-800 text-base" />
          <input name="referencia" placeholder="Referência (ex: NK-123)" onChange={handleChange} className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 placeholder-gray-500 text-gray-800 text-base" />
          <input name="cor" placeholder="Cor" onChange={handleChange} className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 placeholder-gray-500 text-gray-800 text-base" />
          <input name="quantidade" type="number" placeholder="Quantidade" onChange={handleChange} className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 placeholder-gray-500 text-gray-800 text-base" />
          <input name="preco" type="number" step="0.01" placeholder="Preço" onChange={handleChange} className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 placeholder-gray-500 text-gray-800 text-base" />
          <select name="genero" onChange={handleChange} className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-gray-800 text-base placeholder-gray-500">
            <option value="">Selecione o gênero</option>
            <option value="MASCULINO">Masculino</option>
            <option value="FEMININO">Feminino</option>
            <option value="INFANTIL_MASCULINO">Infantil Masculino</option>
            <option value="INFANTIL_FEMININO">Infantil Feminino</option>
          </select>
          <select name="modelo" onChange={handleChange} className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-gray-800 text-base placeholder-gray-500">
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
          <input name="marca" placeholder="Marca" onChange={handleChange} className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 placeholder-gray-500 text-gray-800 text-base" />
          <p className="text-sm text-gray-600">Status: {parseInt(form.quantidade) > 0 ? 'Disponível' : 'Esgotado'}</p>
          <button type="submit" className="bg-green-600 text-white px-4 py-3 rounded-lg w-full font-medium hover:bg-green-500 active:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200">Salvar</button>
        </form>
      </div>
    </div>
  );
}