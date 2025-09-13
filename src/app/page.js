
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ModalVenda from './components/ModalVenda';

export default function Home() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState(null);

  // Filtros
  const [marcaFiltro, setMarcaFiltro] = useState('');
  const [tamanhoFiltro, setTamanhoFiltro] = useState('');
  const [referenciaFiltro, setReferenciaFiltro] = useState('');

  // Paginação
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Função para buscar produtos
  const fetchProdutos = async (filtros = {}, pg = 1) => {
    setLoading(true);
    const query = new URLSearchParams();
    if (filtros.marca) query.append('marca', filtros.marca);
    if (filtros.tamanho) query.append('tamanho', filtros.tamanho);
    if (filtros.referencia) query.append('referencia', filtros.referencia);
    query.append('page', pg);

    const res = await fetch(`/api/produtos?${query.toString()}`);
    const data = await res.json();
    setProdutos(data.data || []);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  };

  useEffect(() => {
    fetchProdutos({}, page);
  }, [page]);

  const aplicarFiltro = () => {
    setPage(1);
    fetchProdutos(
      {
        marca: marcaFiltro,
        tamanho: tamanhoFiltro,
        referencia: referenciaFiltro,
      },
      1
    );
  };

  // Deletar produto
  const handleDelete = async (id) => {
    await fetch('/api/produtos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchProdutos({ marca: marcaFiltro, tamanho: tamanhoFiltro, referencia: referenciaFiltro }, page);
  };

  // Abrir modal
  const handleOpenModal = (produto) => {
    setSelectedProduto(produto);
    setModalOpen(true);
  };

  // Fechar modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProduto(null);
  };

  // Enviar venda
  const handleSubmitVenda = async ({ produtoId, quantidade, nomeCliente, valorPago }) => {
  const response = await fetch('/api/vendas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ produtoId, quantidade, nomeCliente, valorPago }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    return alert(errorData.error || 'Erro ao registrar venda');
  }

  fetchProdutos(); // atualizar estoque
  handleCloseModal();
};


  if (loading) return <p className="text-center text-lg text-gray-700">Carregando...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Estoque de Calçados</h1>

        {/* Filtros */}
        <div className="flex gap-2 mb-4 text-gray-700">
          <input
            placeholder="Marca"
            value={marcaFiltro}
            onChange={(e) => setMarcaFiltro(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            placeholder="Numeração"
            type="number"
            value={tamanhoFiltro}
            onChange={(e) => setTamanhoFiltro(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            placeholder="Referência"
            value={referenciaFiltro}
            onChange={(e) => setReferenciaFiltro(e.target.value)}
            className="border p-2 rounded"
          />
          <button onClick={aplicarFiltro} className="bg-blue-600 text-white px-4 py-2 rounded">
            Filtrar
          </button>
        </div>

        {/* Ações */}
        <div className="flex gap-4 mb-6">
          <Link
            href="/adicionar"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-center font-medium transition duration-200"
          >
            Adicionar Produto
          </Link>
          <Link
            href="/dashboard"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-center font-medium transition duration-200"
          >
            Ver Dashboard
          </Link>
          <Link
            href="/vendas"
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 text-center font-medium transition duration-200"
          >
            Ver Vendas
          </Link>
        </div>

        {/* Tabela de produtos */}
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
              {produtos.map((p) => (
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
                    <Link href={`/editar/${p.id}`} className="text-green-600 hover:underline mr-4 font-medium">
                      Editar
                    </Link>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline mr-4 font-medium">
                      Deletar
                    </button>
                    <button onClick={() => handleOpenModal(p)} className="text-blue-600 hover:underline mr-4 font-medium">
                      Dar Baixa
                    </button>
                    <Link href={`/vendas/${p.id}`} className="text-purple-600 hover:underline font-medium">
                      Ver Vendas
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="mt-4 flex justify-center gap-2 text-gray-800">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Anterior
          </button>
          <span className="px-3 py-1">{page} / {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Próximo
          </button>
        </div>
      </div>

      {/* Modal de venda */}
      <ModalVenda
        isOpen={modalOpen}
        onClose={handleCloseModal}
        produto={selectedProduto}
        onSubmit={handleSubmitVenda}
      />

    </div>
  );
}
