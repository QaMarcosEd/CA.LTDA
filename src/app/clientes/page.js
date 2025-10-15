// // app/clientes/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { formatPhoneNumber } from '../../../utils/formatPhoneNumber';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [editForm, setEditForm] = useState({ nome: '', apelido: '', telefone: '' });

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const res = await fetch('/api/clientes', { cache: 'no-store' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Erro ao buscar clientes: ${res.status} - ${errorData.error || 'Sem detalhes'}`);
      }
      const data = await res.json();
      setClientes(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast.error(`Erro ao carregar clientes: ${error.message} ❌`);
    } finally {
      setLoading(false);
    }
  };

  // Cálculos de resumo
  const totalClientes = clientes.length;
  const valorTotalGeral = clientes.reduce((sum, c) => sum + (c.totalGasto || 0), 0);
  const mediaGasto = totalClientes > 0 ? valorTotalGeral / totalClientes : 0;
  const qtyItensGeral = clientes.reduce((sum, c) => sum + (c.qtyItensTotal || 0), 0);

  const handleEdit = (cliente) => {
    setSelectedCliente(cliente);
    setEditForm({ nome: cliente.nome, apelido: cliente.apelido || '', telefone: cliente.telefone || '' });
    setEditModalOpen(true);
  };

      const handleSubmitEdit = async (e) => {
        e.preventDefault();
        if (!editForm.nome) {
          toast.error('Nome é obrigatório');
          return;
        }

        try {
          const res = await fetch(`/api/clientes/${selectedCliente.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editForm),
          });

          if (!res.ok) {
            let errorMsg = 'Erro ao editar cliente';
            try {
              const errorData = await res.json();
              errorMsg = errorData.error || errorMsg;
            } catch {}
            toast.error(errorMsg);
            return;
          }

          const updated = await res.json(); // Opcional: use se quiser
          toast.success('Cliente atualizado com sucesso!');
          setEditModalOpen(false);
          fetchClientes();
        } catch (error) {
          toast.error(`Erro inesperado: ${error.message}`);
        }
      };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedCliente(null);
    setEditForm({ nome: '', apelido: '', telefone: '' });
  };

  // Checa inatividade
  const isInativo = (ultimaCompraAgregada) => {
    if (!ultimaCompraAgregada) return false;
    const diasDesdeUltima = (new Date() - new Date(ultimaCompraAgregada)) / (1000 * 60 * 60 * 24);
    return diasDesdeUltima > 90;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-500 border-solid"></div>
              <span className="ml-3 text-gray-600 font-poppins">Carregando...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold font-poppins text-gray-900 mb-8 text-center">Lista de Clientes</h1>

        {/* Resumo no topo */}
        <div className="bg-blue-50 p-4 rounded-lg shadow-md mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm font-medium text-gray-700">Total Clientes</p>
            <p className="text-xl font-bold text-blue-600">{totalClientes}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Valor Total Vendido</p>
            <p className="text-xl font-bold text-blue-600">{valorTotalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Média por Cliente</p>
            <p className="text-xl font-bold text-blue-600">{mediaGasto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Unidades Totais Vendidas</p>
            <p className="text-xl font-bold text-blue-600">{qtyItensGeral}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold font-poppins text-gray-700">Nome</th>
                <th className="py-3 px-4 text-left text-sm font-semibold font-poppins text-gray-700">Apelido</th>
                <th className="py-3 px-4 text-left text-sm font-semibold font-poppins text-gray-700">Telefone</th>
                <th className="py-3 px-4 text-left text-sm font-semibold font-poppins text-gray-700">Nº Compras</th>
                <th className="py-3 px-4 text-left text-sm font-semibold font-poppins text-gray-700">Criado em</th>
                <th className="py-3 px-4 text-left text-sm font-semibold font-poppins text-gray-700">Última Compra</th>
                <th className="py-3 px-4 text-left text-sm font-semibold font-poppins text-gray-700">Total Gasto</th>
                <th className="py-3 px-4 text-left text-sm font-semibold font-poppins text-gray-700">Unidades Compradas</th>
                <th className="py-3 px-4 text-left text-sm font-semibold font-poppins text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id} className={`border-b hover:bg-gray-50 ${isInativo(c.ultimaCompraAgregada) ? 'bg-red-50' : ''}`}>
                  <td className="py-3 px-4 text-sm font-poppins text-gray-800">{c.nome}</td>
                  <td className="py-3 px-4 text-sm font-poppins text-gray-800">{c.apelido || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm font-poppins text-gray-800">{c.telefone || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm font-poppins text-gray-800">{c._count.vendas}</td>
                  <td className="py-3 px-4 text-sm font-poppins text-gray-800">
                    {new Date(c.criadoEm).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 px-4 text-sm font-poppins text-gray-800">
                    {c.ultimaCompraAgregada ? new Date(c.ultimaCompraAgregada).toLocaleDateString('pt-BR') : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-sm font-poppins text-gray-800">
                    {(c.totalGasto || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="py-3 px-4 text-sm font-poppins text-gray-800">{c.qtyItensTotal || 0}</td>
                  <td className="py-3 px-4 text-sm font-poppins text-gray-800">
                    <button
                      onClick={() => handleEdit(c)}
                      className="text-blue-600 hover:text-blue-800 mr-2 font-medium"
                    >
                      Editar
                    </button>
                    <Link
                      href={`/clientes/${c.id}`}
                      className="text-green-600 hover:text-green-800 font-medium"
                    >
                      Detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {clientes.length === 0 && (
            <p className="text-center text-gray-500 font-poppins text-sm mt-4">Nenhum cliente encontrado.</p>
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <Link href="/" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium font-poppins rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md">
            Voltar a Home
          </Link>
        </div>

        {editModalOpen && selectedCliente && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-xl font-bold font-poppins text-gray-900 mb-4">
                Editar Cliente: {selectedCliente.nome}
              </h2>
              <form onSubmit={handleSubmitEdit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium font-poppins text-gray-700">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={editForm.nome}
                    onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                    className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium font-poppins text-gray-700">
                    Apelido
                  </label>
                  <input
                    type="text"
                    value={editForm.apelido}
                    onChange={(e) => setEditForm({ ...editForm, apelido: e.target.value })}
                    className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium font-poppins text-gray-700">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={editForm.telefone}
                    onChange={(e) => setEditForm({ ...editForm, telefone: formatPhoneNumber(e.target.value) })}
                    placeholder="(11) 99999-9999"
                    className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCloseEditModal}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-poppins text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-poppins text-sm"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

