'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Vendas() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendas = async () => {
      const res = await fetch('/api/vendas');
      const data = await res.json();
      setVendas(data);
      setLoading(false);
    };
    fetchVendas();
  }, []);

  if (loading) return <p>Carregando vendas...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Todas as Vendas</h1>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Produto</th>
            <th className="border p-2">Quantidade</th>
            <th className="border p-2">Valor Pago</th>
            <th className="border p-2">Cliente</th>
            <th className="border p-2">Data</th>
          </tr>
        </thead>
        <tbody>
          {vendas.map(v => (
            <tr key={v.id} className="border-b">
              <td className="border p-2">{v.id}</td>
              <td className="border p-2">{v.produto?.nome || 'N/A'}</td>
              <td className="border p-2">{v.quantidade}</td>
              <td className="border p-2">R$ {v.valorPago?.toFixed(2) || 0}</td>
              <td className="border p-2">{v.nomeCliente || '-'}</td>
              <td className="border p-2">{new Date(v.data).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Link href="/" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded">
        Voltar
      </Link>
    </div>
  );
}
