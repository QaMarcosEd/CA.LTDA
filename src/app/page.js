'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ModalRegistroBaixa from '@/components/ui/modals/ModalRegistroBaixa';
import ConfirmDeleteModal from '../components/ui/modals/ConfirmDeleteModal';
// import ModalLote from '@/components/ui/modals/ModalCadastroLoteCalcados'; // Novo modal
import ModalCadastroLoteCalçados from '@/components/ui/modals/ModalCadastroLoteCalcados';
import toast from 'react-hot-toast';

export default function Home() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [loteModalOpen, setLoteModalOpen] = useState(false); // Novo estado para modal de lote
  const [selectedProduto, setSelectedProduto] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDeleteProduto, setSelectedDeleteProduto] = useState(null);
  const [marcaFiltro, setMarcaFiltro] = useState('');
  const [tamanhoFiltro, setTamanhoFiltro] = useState('');
  const [referenciaFiltro, setReferenciaFiltro] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  const handleDelete = async (id) => {
    try {
      const response = await fetch('/api/produtos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (response.status === 200) {
        toast.success('Produto deletado com sucesso! ✅');
        fetchProdutos({ marca: marcaFiltro, tamanho: tamanhoFiltro, referencia: referenciaFiltro }, page);
      } else {
        toast.error(data.error || 'Erro ao deletar produto ❌');
      }
    } catch (error) {
      console.error('Erro geral em handleDelete:', error);
      toast.error('Erro inesperado ao deletar produto ❌');
    }
  };

  const handleOpenDeleteModal = (produto) => {
    setSelectedDeleteProduto(produto);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedDeleteProduto(null);
  };

  const handleConfirmDelete = async () => {
    if (selectedDeleteProduto) {
      await handleDelete(selectedDeleteProduto.id);
      handleCloseDeleteModal();
    }
  };

  const handleOpenModal = (produto) => {
    setSelectedProduto(produto);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProduto(null);
  };

  const handleSubmitVenda = async (vendaData) => {
    const response = await fetch('/api/vendas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendaData),
    });
    return response;
  };

  const handleSubmitLote = async (data) => {
    const response = await fetch('/api/produtos/lote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (response.status === 201) {
      fetchProdutos({ marca: marcaFiltro, tamanho: tamanhoFiltro, referencia: referenciaFiltro }, page);
    }
    return { status: response.status, data: result };
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-lg font-medium font-poppins text-gray-600 animate-pulse">Carregando estoque...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold font-poppins text-gray-900 mb-8 text-center">Estoque de Calçados</h1>

        {/* Filtros */}
        <div className="mb-8 bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold font-poppins text-gray-700 mb-4">Filtros</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-gray-700">
            <input
              placeholder="Marca"
              value={marcaFiltro}
              onChange={(e) => setMarcaFiltro(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
            />
            <input
              placeholder="Numeração"
              type="number"
              value={tamanhoFiltro}
              onChange={(e) => setTamanhoFiltro(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
            />
            <input
              placeholder="Referência"
              value={referenciaFiltro}
              onChange={(e) => setReferenciaFiltro(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
            />
            <button
              onClick={aplicarFiltro}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-poppins text-sm font-medium"
            >
              Filtrar
            </button>
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link
            href="produto/adicionar"
            className="inline-flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-poppins text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Adicionar Produto
          </Link>
          <button
            onClick={() => setLoteModalOpen(true)}
            className="inline-flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-poppins text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7m16 0l-8 4-8-4" />
            </svg>
            Adicionar Lote
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-poppins text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Ver Dashboard
          </Link>
          <Link
            href="/vendas"
            className="inline-flex items-center justify-center bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors font-poppins text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Ver Vendas
          </Link>
          <Link
            href="/clientes"
            className="inline-flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-poppins text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Ver Clientes
          </Link>
        </div>

        {/* Tabela de produtos */}
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold font-poppins text-gray-700">Nome</th>
                <th className="py-3 px-4 text-left text-sm font-semibold font-poppins text-gray-700">Tamanho</th>
                <th className="py-3 px-4 text-left text-sm font-semibold font-poppins text-gray-700">Referência</th>
                <th className="py-3 px-4 text-left text-sm font-semibold font-poppins text-gray-700">Cor</th>
                <th className="py-3 px-4 text-left text-sm font-semibold font-poppins text-gray-700">Quantidade</th>
                <th className="py-3 px-4 text-left text-sm font-semibold font-poppins text-gray-700">Preço</th>
                <th className="py-3 px-4 text-left text-sm font-semibold font-poppins text-gray-700">Gênero</th>
                <th className="py-3 px-4 text-left text-sm font-semibold font-poppins text-gray-700">Modelo</th>
                <th className="py-3 px-4 text-left text-sm font-semibold font-poppins text-gray-700">Marca</th>
                <th className="py-3 px-4 text-left text-sm font-semibold font-poppins text-gray-700">Lote</th>
                <th className="py-3 px-4 text-left text-sm font-semibold font-poppins text-gray-700">Status</th>
                <th className="py-3 px-4 text-left text-sm font-semibold font-poppins text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-poppins text-gray-800">{p.nome}</td>
                  <td className="py-3 px-4 text-sm font-poppins text-gray-800">{p.tamanho}</td>
                  <td className="py-3 px-4 text-sm font-poppins text-gray-800">{p.referencia || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm font-poppins text-gray-800">{p.cor}</td>
                  <td className="py-3 px-4 text-sm font-poppins text-gray-800">{p.quantidade}</td>
                  <td className="py-3 px-4 text-sm font-poppins text-gray-800">R$ {p.preco.toFixed(2)}</td>
                  <td className="py-3 px-4 text-sm font-poppins text-gray-800">{p.genero || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm font-poppins text-gray-800">{p.modelo || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm font-poppins text-gray-800">{p.marca || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm font-poppins text-gray-800">{p.lote || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm font-poppins text-gray-800">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        p.disponivel ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {p.disponivel ? 'Disponível' : 'Esgotado'}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex flex-wrap gap-2">
                    <Link
                      href={`produto/editar/${p.id}`}
                      className="text-green-600 hover:text-green-800 font-poppins text-sm font-medium"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleOpenDeleteModal(p)}
                      className="text-red-600 hover:text-red-800 font-poppins text-sm font-medium"
                    >
                      Deletar
                    </button>
                    <button
                      onClick={() => handleOpenModal(p)}
                      className="text-blue-600 hover:text-blue-800 font-poppins text-sm font-medium"
                    >
                      Dar Baixa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {produtos.length === 0 && (
            <p className="text-center text-gray-500 font-poppins text-sm mt-4">Nenhum produto encontrado.</p>
          )}
        </div>

        {/* Paginação */}
        <div className="mt-6 flex justify-center gap-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 bg-blue-600 text-white font-poppins text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Anterior
          </button>
          <span className="px-4 py-2 bg-gray-200 font-poppins text-sm text-gray-700 rounded-lg">
            Página {page} de {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-blue-600 text-white font-poppins text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Próximo
          </button>
        </div>

        {/* Modal de venda */}
        <ModalRegistroBaixa
          isOpen={modalOpen}
          onClose={handleCloseModal}
          produto={selectedProduto}
          onSubmit={handleSubmitVenda}
        />

        {/* Modal de confirmação de delete */}
        <ConfirmDeleteModal
          isOpen={deleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          produtoNome={selectedDeleteProduto?.nome || ''}
        />

        {/* Modal de lote */}
        {/* <ModalLote
          isOpen={loteModalOpen}
          onClose={() => setLoteModalOpen(false)}
          onSubmit={handleSubmitLote}
        /> */}

        <ModalCadastroLoteCalçados
          isOpen={loteModalOpen}
          onClose={() => setLoteModalOpen(false)}
          onSubmit={handleSubmitLote}
        />
      </div>
    </div>
  );
}