'use client';

import { useState } from 'react';

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, produtoNome }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-lg font-semibold font-poppins text-gray-800 mb-4">
          Confirmar Exclusão
        </h2>
        <p className="text-sm font-poppins text-gray-600 mb-6">
          Tem certeza que deseja deletar o produto "{produtoNome}"? Essa ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-poppins text-sm font-medium"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-poppins text-sm font-medium"
            disabled={loading}
          >
            {loading ? 'Deletando...' : 'Deletar'}
          </button>
        </div>
      </div>
    </div>
  );
}