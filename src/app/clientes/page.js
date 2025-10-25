'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { formatPhoneNumber } from '../../utils/formatPhoneNumber';
import { Users, User, Phone, Calendar, DollarSign, ShoppingBag, Edit, Eye } from 'lucide-react';
import PageHeader from '@/components/layout/Header';

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

// LOADING STATE - CLIENTES MINIMALISTA
if (loading) return (
  <div className="p-6 bg-gray-50 min-h-screen">
    {/* Header */}
    <div className="w-56 h-5 bg-gray-200 animate-pulse rounded mb-6"></div>
    
    {/* 4 Cards Resumo - SUPER COMPACTO */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 max-w-7xl mx-auto">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-4 h-20 flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <div className="space-y-1 flex-1">
            <div className="w-20 h-2 bg-gray-200 rounded"></div>
            <div className="w-24 h-5 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>

    {/* Tabela - SUPER COMPACTA */}
    <div className="bg-white rounded-xl p-4 max-w-7xl mx-auto">
      {/* Header da tabela */}
      <div className="flex gap-4 mb-3 h-10 bg-gray-50 rounded animate-pulse"></div>
      
      {/* Linhas da tabela */}
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-50 rounded animate-pulse flex items-center px-4">
            <div className="flex-1 space-x-4">
              <div className="w-4 h-2 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader title="Clientes" greeting="👥 Visão Geral - Calçados Araújo" />

      <div className="max-w-7xl mx-auto">
        {/* RESUMO CARDS HARMONIOSOS */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
  {[
    { icon: Users, label: 'Total Clientes', value: totalClientes, color: '#394189' },
    { icon: DollarSign, label: 'Valor Total', value: valorTotalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), color: '#c33638' },
    { icon: ShoppingBag, label: 'Média/Cliente', value: mediaGasto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), color: '#10B981' },
    { icon: Users, label: 'Unidades Vendidas', value: qtyItensGeral, color: '#8B5CF6' },
  ].map((card, i) => (
    <div key={i} className="group relative bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-24 flex items-center justify-between overflow-hidden">
      {/* ✅ LINHA COM CURVAS - border-radius: 0.75rem (mesmo do card) */}
      <div 
        className="absolute left-0 top-0 h-full w-1 rounded-l-xl" 
        style={{ backgroundColor: card.color }}
      ></div>
      
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white to-gray-50 flex items-center justify-center shadow-sm ml-1">
        <card.icon className="w-5 h-5" style={{ color: card.color }} />
      </div>
      <div className="flex-1 ml-3 pr-2">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{card.label}</p>
        <p className="text-lg font-bold text-gray-900 truncate">{card.value}</p>
      </div>
    </div>
  ))}
</div>

        {/* TABELA MODERNA */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-[#394189]/5 to-[#c33638]/5">
                  {[
                    { label: 'Nome', icon: User },
                    { label: 'Apelido' },
                    { label: 'Telefone', icon: Phone },
                    { label: 'Compras' },
                    { label: 'Criado', icon: Calendar },
                    { label: 'Última' },
                    { label: 'Total', icon: DollarSign },
                    { label: 'Unidades' },
                    { label: 'Ações' },
                  ].map((header, i) => (
                    <th key={i} className="py-4 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {header.icon && <header.icon className="w-4 h-4 inline mr-1" />}
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => {
                  const inativo = isInativo(c.ultimaCompraAgregada);
                  return (
                    <tr key={c.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${inativo ? 'bg-red-50/50' : ''}`}>
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${inativo ? 'bg-red-400' : 'bg-green-400'}`}></div>
                          {c.nome}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{c.apelido || 'N/A'}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{formatPhoneNumber(c.telefone || 'N/A')}</td>
                      <td className="py-4 px-4 text-sm font-medium text-[#394189]">{c._count.vendas}</td>
                      <td className="py-4 px-4 text-sm text-gray-500">{new Date(c.criadoEm).toLocaleDateString('pt-BR')}</td>
                      <td className={`py-4 px-4 text-sm ${inativo ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                        {c.ultimaCompraAgregada ? new Date(c.ultimaCompraAgregada).toLocaleDateString('pt-BR') : 'N/A'}
                      </td>
                      <td className="py-4 px-4 text-sm font-semibold text-[#c33638]">
                        {(c.totalGasto || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="py-4 px-4 text-sm font-medium text-[#10B981]">{c.qtyItensTotal || 0}</td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(c)}
                            className="p-2 text-[#394189] hover:bg-[#394189]/10 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <Link href={`/clientes/${c.id}`} className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {clientes.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Nenhum cliente encontrado</p>
            </div>
          )}
        </div>

        {/* MODAL PREMIUM */}
        {editModalOpen && selectedCliente && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#394189] flex items-center gap-2">
                  <Edit className="w-5 h-5" />
                  Editar Cliente
                </h2>
                <button onClick={handleCloseEditModal} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSubmitEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nome *</label>
                  <input
                    type="text"
                    value={editForm.nome}
                    onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#394189] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Apelido</label>
                  <input
                    type="text"
                    value={editForm.apelido}
                    onChange={(e) => setEditForm({ ...editForm, apelido: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#394189] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Telefone</label>
                  <input
                    type="text"
                    value={editForm.telefone}
                    onChange={(e) => setEditForm({ ...editForm, telefone: formatPhoneNumber(e.target.value) })}
                    placeholder="(11) 99999-9999"
                    className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#394189] focus:border-transparent"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseEditModal}
                    className="px-6 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-[#394189] to-[#c33638] text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    Salvar Alterações
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
