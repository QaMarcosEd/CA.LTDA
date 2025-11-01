// src/app/(admin)/clientes/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDateToBrazil } from '@/utils/formatDate';
import { formatPhoneNumber } from '@/utils/formatPhoneNumber';
import toast from 'react-hot-toast';
import { User, DollarSign, CreditCard, ShoppingBag, Calendar, Edit3, Eye, Users, MapPin, Phone as PhoneIcon } from 'lucide-react';
import PageHeader from '@/components/layout/Header';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';

// Helper pra converter ISO date pra 'yyyy-MM-dd' pro input date
const formatDateForInput = (isoDate) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  return date.toISOString().split('T')[0];
};

export default function DetalhesCliente() {
  const params = useParams();
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // States pra edição
  const [editNome, setEditNome] = useState('');
  const [editApelido, setEditApelido] = useState('');
  const [editTelefone, setEditTelefone] = useState('');
  const [editDataNascimento, setEditDataNascimento] = useState('');
  const [editCidade, setEditCidade] = useState('');
  const [editBairro, setEditBairro] = useState('');
  const [editRua, setEditRua] = useState('');

  // Armazena valores originais pra reset seguro
  const [originalValues, setOriginalValues] = useState({});

  useEffect(() => {
    if (params.id) {
      fetchDetalhes();
    }
  }, [params.id]);

  const fetchDetalhes = async () => {
    try {
      const res = await fetch(`/api/clientes/${params.id}`, { cache: 'no-store' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Erro ao buscar cliente: ${res.status} - ${errorData.error || 'Sem detalhes'}`);
      }
      const data = await res.json();
      setCliente(data);

      // Inicializa originalValues e states de edição
      const orig = {
        nome: data.nome || '',
        apelido: data.apelido || '',
        telefone: data.telefone || '',
        dataNascimento: formatDateForInput(data.dataNascimento),
        cidade: data.cidade || '',
        bairro: data.bairro || '',
        rua: data.rua || '',
      };
      setOriginalValues(orig);
      setEditNome(orig.nome);
      setEditApelido(orig.apelido);
      setEditTelefone(orig.telefone);
      setEditDataNascimento(orig.dataNascimento);
      setEditCidade(orig.cidade);
      setEditBairro(orig.bairro);
      setEditRua(orig.rua);
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
      setError(`Erro ao carregar detalhes do cliente: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const trimmedNome = editNome.trim();
    if (!trimmedNome) {
      toast.error('Nome é obrigatório');
      return;
    }
    const trimmedTelefone = editTelefone.trim();
    if (trimmedTelefone && !trimmedTelefone.match(/\(\d{2}\) \d{5}-\d{4}/)) {
      toast.error('Telefone inválido (use formato (XX) XXXXX-XXXX)');
      return;
    }

    const bodyToSend = {
      nome: trimmedNome,
    };
    const trimmedApelido = editApelido.trim();
    if (trimmedApelido) bodyToSend.apelido = trimmedApelido;
    if (trimmedTelefone) bodyToSend.telefone = trimmedTelefone;
    if (editDataNascimento) bodyToSend.dataNascimento = editDataNascimento;
    else bodyToSend.dataNascimento = null;
    const trimmedCidade = editCidade.trim();
    if (trimmedCidade) bodyToSend.cidade = trimmedCidade;
    const trimmedBairro = editBairro.trim();
    if (trimmedBairro) bodyToSend.bairro = trimmedBairro;
    const trimmedRua = editRua.trim();
    if (trimmedRua) bodyToSend.rua = trimmedRua;

    try {
      const res = await fetch(`/api/clientes/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyToSend),
      });

      const responseBody = await res.json();

      if (!res.ok) {
        throw new Error(responseBody.error || responseBody.details || `Erro HTTP ${res.status}: Falha ao atualizar`);
      }

      setCliente(prev => ({
        ...prev,
        nome: responseBody.nome || prev.nome,
        apelido: responseBody.apelido ?? prev.apelido,
        telefone: responseBody.telefone ?? prev.telefone,
        dataNascimento: responseBody.dataNascimento ?? prev.dataNascimento,
        cidade: responseBody.cidade ?? prev.cidade,
        bairro: responseBody.bairro ?? prev.bairro,
        rua: responseBody.rua ?? prev.rua,
      }));

      toast.success('Cliente atualizado com sucesso! ✅');
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar no frontend:', error);
      toast.error(error.message || 'Erro ao atualizar cliente ❌');
    }
  };

  const handleCancel = () => {
    setEditNome(originalValues.nome);
    setEditApelido(originalValues.apelido);
    setEditTelefone(originalValues.telefone);
    setEditDataNascimento(originalValues.dataNascimento);
    setEditCidade(originalValues.cidade);
    setEditBairro(originalValues.bairro);
    setEditRua(originalValues.rua);
    setIsEditing(false);
toast.error('Edição cancelada', { duration: 2000 });
  };

  const getValorPago = (venda) => {
    const entrada = parseFloat(venda.entrada) || 0;
    if (!venda.parcelas || venda.parcelas.length === 0) return entrada.toFixed(2);
    return (entrada + venda.parcelas.reduce((sum, p) => sum + parseFloat(p.valorPago || 0), 0)).toFixed(2);
  };

  if (loading) return <LoadingSkeleton type="clientes-detalhe" />;

  if (error || !cliente) return (
    <div className="min-h-screen bg-gradient-to-br from-[#394189]/5 to-[#c33638]/5 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md">
        <User className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">{error || 'Cliente não encontrado'}</h3>
        <Link href="/clientes" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#394189] to-[#c33638] text-white rounded-xl">
          ← Voltar aos Clientes
        </Link>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader 
        title={`Cliente: ${cliente.nome}`} 
        greeting="👤 Detalhes Completos - Calçados Araújo" 
      />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* CARDS MÉTRICAS HARMONIOSOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: DollarSign, label: 'Total Gasto', value: `R$ ${cliente.metricas.totalGasto?.toLocaleString('pt-BR') || '0,00'}`, color: '#c33638' },
            { icon: CreditCard, label: 'Total Pago', value: `R$ ${cliente.metricas.totalPago?.toLocaleString('pt-BR') || '0,00'}`, color: '#10B981' },
            { icon: ShoppingBag, label: 'Compras', value: cliente.metricas.numeroCompras || 0, color: '#394189' },
            { icon: DollarSign, label: 'Pendente', value: `R$ ${cliente.metricas.totalPendente?.toLocaleString('pt-BR') || '0,00'}`, color: '#F59E0B' },
            { icon: Calendar, label: 'Atrasadas', value: cliente.metricas.parcelasAtrasadas || 0, color: '#EF4444' },
            { icon: Users, label: 'Favoritos', value: cliente.metricas.produtosFavoritos?.length || 0, color: '#8B5CF6' },
          ].map((card, i) => (
            <div key={i} className="group relative bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-24 flex items-center justify-between">
              <div className="absolute left-0 top-0 h-full w-0.5" style={{ backgroundColor: card.color }}></div>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white to-gray-50 flex items-center justify-center shadow-sm">
                <card.icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
              <div className="flex-1 ml-3 pr-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{card.label}</p>
                <p className="text-lg font-bold text-gray-900 truncate">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* INFORMAÇÕES DO CLIENTE - PREMIUM */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#394189] flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações do Cliente
            </h2>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)} 
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#394189] to-[#c33638] text-white rounded-xl hover:shadow-lg transition-all"
              >
                <Edit3 className="w-4 h-4" />
                Editar
              </button>
            ) : (
              <div className="flex gap-3">
                <button 
                  onClick={handleSave} 
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#10B981] to-green-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                  Salvar
                </button>
                <button 
                  onClick={handleCancel} 
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {!isEditing ? (
              <>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-[#394189]/10 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-[#394189]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Nome</p>
                      <p className="font-semibold text-gray-900">{cliente.nome}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-[#c33638]/10 rounded-lg flex items-center justify-center">
                      <PhoneIcon className="w-5 h-5 text-[#c33638]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Telefone</p>
                      <p className="font-semibold text-gray-900">{formatPhoneNumber(cliente.telefone || 'N/A')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-[#10B981]/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-[#10B981]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Cidade</p>
                      <p className="font-semibold text-gray-900">{cliente.cidade || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[#F59E0B]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Data Nascimento</p>
                      <p className="font-semibold text-gray-900">{cliente.dataNascimento ? formatDateToBrazil(cliente.dataNascimento) : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-[#8B5CF6]/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-[#8B5CF6]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Bairro</p>
                      <p className="font-semibold text-gray-900">{cliente.bairro || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-[#EF4444]/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-[#EF4444]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Rua</p>
                      <p className="font-semibold text-gray-900">{cliente.rua || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="md:col-span-2 space-y-4 text-gray-500">
                {/* NOME */}
                <div className="relative">
                  <input
                    type="text"
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                    required
                    className="peer w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#394189] focus:border-transparent transition-all placeholder-transparent"
                    placeholder=" "
                  />
                  <label className="absolute left-4 -top-2.5 px-1 text-xs text-gray-500 bg-white transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#394189]">
                    Nome *
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* APELIDO */}
                  <div className="relative">
                    <input
                      type="text"
                      value={editApelido}
                      onChange={(e) => setEditApelido(e.target.value)}
                      className="peer w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#394189] focus:border-transparent transition-all placeholder-transparent"
                      placeholder=" "
                    />
                    <label className="absolute left-4 -top-2.5 px-1 text-xs text-gray-500 bg-white transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#394189]">
                      Apelido
                    </label>
                  </div>

                  {/* TELEFONE */}
                  <div className="relative">
                    <input
                      type="text"
                      value={editTelefone}
                      onChange={(e) => setEditTelefone(formatPhoneNumber(e.target.value))}
                      className="peer w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#394189] focus:border-transparent transition-all placeholder-transparent"
                      placeholder=" "
                    />
                    <label className="absolute left-4 -top-2.5 px-1 text-xs text-gray-500 bg-white transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#394189]">
                      Telefone
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* DATA NASCIMENTO */}
                  <div className="relative">
                    <input
                      type="date"
                      value={editDataNascimento}
                      onChange={(e) => setEditDataNascimento(e.target.value)}
                      className="peer w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#394189] focus:border-transparent transition-all"
                    />
                    <label className="absolute left-4 -top-2.5 px-1 text-xs text-gray-500 bg-white transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#394189]">
                      Data Nascimento
                    </label>
                  </div>

                  {/* CIDADE */}
                  <div className="relative">
                    <input
                      type="text"
                      value={editCidade}
                      onChange={(e) => setEditCidade(e.target.value)}
                      className="peer w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#394189] focus:border-transparent transition-all placeholder-transparent"
                      placeholder=" "
                    />
                    <label className="absolute left-4 -top-2.5 px-1 text-xs text-gray-500 bg-white transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#394189]">
                      Cidade
                    </label>
                  </div>

                  {/* BAIRRO */}
                  <div className="relative">
                    <input
                      type="text"
                      value={editBairro}
                      onChange={(e) => setEditBairro(e.target.value)}
                      className="peer w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#394189] focus:border-transparent transition-all placeholder-transparent"
                      placeholder=" "
                    />
                    <label className="absolute left-4 -top-2.5 px-1 text-xs text-gray-500 bg-white transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#394189]">
                      Bairro
                    </label>
                  </div>
                </div>

                {/* RUA */}
                <div className="relative">
                  <input
                    type="text"
                    value={editRua}
                    onChange={(e) => setEditRua(e.target.value)}
                    className="peer w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#394189] focus:border-transparent transition-all placeholder-transparent"
                    placeholder=" "
                  />
                  <label className="absolute left-4 -top-2.5 px-1 text-xs text-gray-500 bg-white transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#394189]">
                    Rua/Endereço
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TABELA VENDAS MODERNA */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-[#394189] mb-6 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Histórico de Vendas
          </h2>
          {cliente.vendas.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#394189]/5 to-[#c33638]/5">
                  <tr>
                    {['Produto', 'Qtd', 'Pago', 'Total', 'Forma', 'Status', 'Data'].map((header) => (
                      <th key={header} className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cliente.vendas.map((v) => (
                    <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 font-medium text-gray-900">{v.produto.nome}</td>
                      <td className="py-4 px-4 text-sm text-[#10B981]">{v.quantidade}</td>
                      <td className="py-4 px-4 text-sm text-[#c33638]">R$ {getValorPago(v)}</td>
                      <td className="py-4 px-4 text-sm font-semibold">R$ {v.valorTotal.toFixed(2)}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{v.formaPagamento?.replace('CARTAO_', '').replace('_', ' ').toLowerCase() || 'N/A'}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          v.status === 'ABERTO' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500">{formatDateToBrazil(v.dataVenda)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Nenhuma venda registrada</p>
            </div>
          )}
        </div>

        {/* BOTÕES NAVEGAÇÃO */}
        <div className="flex justify-center gap-4">
          <Link href="/clientes" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#394189] to-[#c33638] text-white rounded-xl hover:shadow-lg transition-all">
            ← Lista de Clientes
          </Link>
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
