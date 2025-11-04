// src/app/(admin)/taxas/page.js
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CreditCard, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import PageHeader from '@/components/layout/Header';

export default function TaxasPage() {
  const [taxas, setTaxas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [novaTaxa, setNovaTaxa] = useState({ bandeira: '', modalidade: '', taxaPercentual: '' });
  const [editandoTaxa, setEditandoTaxa] = useState({ bandeira: '', modalidade: '', taxaPercentual: '' });

  const carregarTaxas = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/taxas-cartao');
      if (!res.ok) throw new Error('Erro ao carregar taxas');
      const data = await res.json();
      setTaxas(data);
    } catch (err) {
      toast.error('Erro ao carregar taxas');
    } finally {
      setLoading(false);
    }
  };

  const criarTaxa = async () => {
    if (!novaTaxa.bandeira || !novaTaxa.modalidade || !novaTaxa.taxaPercentual) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      const res = await fetch('/api/taxas-cartao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaTaxa),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao criar');
      }

      toast.success('Taxa criada!');
      setNovaTaxa({ bandeira: '', modalidade: '', taxaPercentual: '' });
      carregarTaxas();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const atualizarTaxa = async () => {
    try {
      const res = await fetch('/api/taxas-cartao', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editandoTaxa, id: editingId }),
      });

      if (!res.ok) throw new Error('Erro ao atualizar');
      toast.success('Taxa atualizada!');
      setEditingId(null);
      setEditandoTaxa({ bandeira: '', modalidade: '', taxaPercentual: '' });
      carregarTaxas();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const deletarTaxa = async (id) => {
  if (!confirm('Deletar esta taxa?')) return;
  try {
    const res = await fetch(`/api/taxas-cartao?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao deletar');
    toast.success('Taxa deletada!');
    carregarTaxas();
  } catch (err) {
    toast.error(err.message);
  }
};

  useEffect(() => {
    carregarTaxas();
  }, []);

  if (loading) return <div className="p-6 flex justify-center">Carregando...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader title="Taxas de Cartão" greeting="👇 Gerencie suas taxas de cartão" />

      {/* Form Nova Taxa */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 mb-6">
        <h2 className="text-xl font-semibold text-[#394189] mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" /> Nova Taxa
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-500">
          <select
            value={novaTaxa.bandeira}
            onChange={(e) => setNovaTaxa({ ...novaTaxa, bandeira: e.target.value })}
            className="border border-[#394189]/20 rounded-lg p-3 focus:ring-2 focus:ring-[#394189]"
          >
            <option value="">Selecione bandeira</option>
            <option value="VISA">VISA</option>
            <option value="MASTERCARD">MASTERCARD</option>
            <option value="ELO">ELO</option>
            <option value="CIELO">CIELO</option>
          </select>
          <select
            value={novaTaxa.modalidade}
            onChange={(e) => setNovaTaxa({ ...novaTaxa, modalidade: e.target.value })}
            className="border border-[#394189]/20 rounded-lg p-3 focus:ring-2 focus:ring-[#394189]"
          >
            <option value="">Selecione modalidade</option>
            <option value="DEBITO">Débito</option>
            <option value="CREDITO_X1">Crédito x1</option>
            <option value="CREDITO_X2">Crédito x2</option>
            <option value="CREDITO_X3">Crédito x3</option>
            <option value="CREDITO_X4">Crédito x4</option>
            <option value="CREDITO_X5">Crédito x5</option>
            <option value="CREDITO_X6">Crédito x6</option>
          </select>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              placeholder="Taxa %"
              value={novaTaxa.taxaPercentual}
              onChange={(e) => setNovaTaxa({ ...novaTaxa, taxaPercentual: e.target.value })}
              className="flex-1 border border-[#394189]/20 rounded-lg p-3"
            />
            <button
              onClick={criarTaxa}
              className="px-6 bg-[#394189] text-white rounded-lg hover:bg-[#c33638] transition-colors"
            >
              Criar
            </button>
          </div>
        </div>
      </div>

      {/* Lista por Bandeira */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['VISA', 'MASTERCARD', 'ELO'].map((bandeira) => {
          const taxasBandeira = taxas.filter((t) => t.bandeira === bandeira);
          return (
            <div key={bandeira} className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold text-[#394189] mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                {bandeira}
              </h3>
              <ul className="space-y-3">
                {taxasBandeira.map((taxa) => (
                  <li
                    key={taxa.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium text-gray-800">
                      {taxa.modalidade.replace('CREDITO_X', 'Crédito x').replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#c33638]">{taxa.taxaPercentual}%</span>
                      {editingId === taxa.id ? (
                        <div className="flex gap-1 text-gray-500">
                  
            <input
              type="number"
              step="0.01"
              value={editandoTaxa.taxaPercentual || ''}
              onChange={(e) => {
                const val = e.target.value;
                setEditandoTaxa({ ...editandoTaxa, taxaPercentual: val === '' ? '' : parseFloat(val) });
              }}
              className="w-16 p-1 border border-[#394189]/30 rounded text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#394189]"
            />
<button 
  onClick={atualizarTaxa} 
  disabled={!editandoTaxa.taxaPercentual || editandoTaxa.taxaPercentual === ''}
  className="p-1 text-green-600 disabled:text-gray-400"
>
  <Save className="w-3 h-3" />
</button>
                          <button onClick={() => setEditingId(null)} className="p-1 text-red-600">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingId(taxa.id);
                              setEditandoTaxa({ ...taxa });
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => deletarTaxa(taxa.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}