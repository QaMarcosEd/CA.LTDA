'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState(null);
  const [quantidadeVenda, setQuantidadeVenda] = useState('');

  // filtros
  const [marcaFiltro, setMarcaFiltro] = useState('');
  const [tamanhoFiltro, setTamanhoFiltro] = useState('');
  const [referenciaFiltro, setReferenciaFiltro] = useState('');

  // paginação
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProdutos = async (filtros = {}, pg = 1) => {
    setLoading(true);
    const query = new URLSearchParams();
    if(filtros.marca) query.append('marca', filtros.marca);
    if(filtros.tamanho) query.append('tamanho', filtros.tamanho);
    if(filtros.referencia) query.append('referencia', filtros.referencia);
    query.append('page', pg);

    const res = await fetch(`/api/produtos?${query.toString()}`);
    const data = await res.json();
    setProdutos(data.data || []);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  };

  useEffect(() => { fetchProdutos({}, page); }, [page]);

  const aplicarFiltro = () => {
    setPage(1);
    fetchProdutos({ marca: marcaFiltro, tamanho: tamanhoFiltro, referencia: referenciaFiltro }, 1);
  };

  const handleDelete = async (id) => {
    await fetch('/api/produtos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchProdutos({ marca: marcaFiltro, tamanho: tamanhoFiltro, referencia: referenciaFiltro }, page);
  };

  const handleOpenModal = (produto) => {
    setSelectedProduto(produto);
    setQuantidadeVenda('');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProduto(null);
  };

  const handleSubmitVenda = async () => {
    if (!quantidadeVenda || quantidadeVenda <= 0) return alert('Digite uma quantidade válida');

    const response = await fetch('/api/vendas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ produtoId: selectedProduto.id, quantidade: parseInt(quantidadeVenda), observacao: 'Venda registrada via sistema' }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return alert(errorData.error || 'Erro ao registrar venda');
    }

    fetchProdutos({ marca: marcaFiltro, tamanho: tamanhoFiltro, referencia: referenciaFiltro }, page);
    handleCloseModal();
  };

  // contador por marca/produto
  const contadores = produtos.reduce((acc, p) => {
    const key = `${p.marca} - ${p.nome}`;
    if(!acc[key]) acc[key] = [];
    acc[key].push(p.tamanho);
    return acc;
  }, {});

  if(loading) return <p className="text-center text-lg text-gray-700">Carregando...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Estoque de Calçados</h1>

        <div className="flex gap-2 mb-4 text-gray-700">
          <input placeholder="Marca" value={marcaFiltro} onChange={e => setMarcaFiltro(e.target.value)} className="border p-2 rounded"/>
          <input placeholder="Tamanho" type="number" value={tamanhoFiltro} onChange={e => setTamanhoFiltro(e.target.value)} className="border p-2 rounded"/>
          <input placeholder="Referência" value={referenciaFiltro} onChange={e => setReferenciaFiltro(e.target.value)} className="border p-2 rounded"/>
          <button onClick={aplicarFiltro} className="bg-blue-600 text-white px-4 py-2 rounded">Filtrar</button>
        </div>

        <Link href="/adicionar" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 mb-6 inline-block text-center font-medium transition duration-200">Adicionar Produto</Link>

        {/* contadores */}
        <div className="mb-4">
          {Object.entries(contadores).map(([produto, tamanhos]) => (
            <p key={produto} className="text-gray-700">{produto}: {tamanhos.length} numerações</p>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-3 px-4 text-left text-gray-700 font-semibold">Nome</th>
                <th className="py-3 px-4 text-left text-gray-700 font-semibold">Tamanho</th>
                <th className="py-3 px-4 text-left text-gray-700 font-semibold">Referência</th>
                <th className="py-3 px-4 text-left text-gray-700 font-semibold">Cor</th>
                <th className="py-3 px-4 text-left text-gray-700 font-semibold">Quantidade</th>
                <th className="py-3 px-4 text-left text-gray-700 font-semibold">Preço</th>
                <th className="py-3 px-4 text-left text-gray-700 font-semibold">Gênero</th>
                <th className="py-3 px-4 text-left text-gray-700 font-semibold">Modelo</th>
                <th className="py-3 px-4 text-left text-gray-700 font-semibold">Marca</th>
                <th className="py-3 px-4 text-left text-gray-700 font-semibold">Status</th>
                <th className="py-3 px-4 text-left text-gray-700 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map(p => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-800">{p.nome}</td>
                  <td className="py-3 px-4 text-gray-800">{p.tamanho}</td>
                  <td className="py-3 px-4 text-gray-800">{p.referencia || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-800">{p.cor}</td>
                  <td className="py-3 px-4 text-gray-800">{p.quantidade}</td>
                  <td className="py-3 px-4 text-gray-800">R$ {p.preco.toFixed(2)}</td>
                  <td className="py-3 px-4 text-gray-800">{p.genero || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-800">{p.modelo || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-800">{p.marca || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-800">{p.disponivel ? 'Disponível' : 'Esgotado'}</td>
                  <td className="py-3 px-4">
                    <Link href={`/editar/${p.id}`} className="text-green-600 hover:underline mr-4 font-medium">Editar</Link>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline mr-4 font-medium">Deletar</button>
                    <button onClick={() => handleOpenModal(p)} className="text-blue-600 hover:underline mr-4 font-medium">Dar Baixa</button>
                    <Link href={`/vendas/${p.id}`} className="text-purple-600 hover:underline font-medium">Ver Vendas</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="mt-4 flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page-1)} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Anterior</button>
          <span className="px-3 py-1">{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page+1)} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Próximo</button>
        </div>

      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Registrar Venda - {selectedProduto.nome}</h2>
            <p className="text-gray-600 mb-4">Estoque atual: {selectedProduto.quantidade}</p>
            <input type="number" value={quantidadeVenda} onChange={e => setQuantidadeVenda(e.target.value)} placeholder="Quantidade a vender" className="border border-gray-300 p-3 w-full rounded-lg mb-4" />
            <div className="flex justify-end space-x-2">
              <button onClick={handleCloseModal} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400">Cancelar</button>
              <button onClick={handleSubmitVenda} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
