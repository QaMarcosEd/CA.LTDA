// // components/ModalVenda/index.js
// 'use client';

// import { useState, useEffect } from 'react';
// import toast from 'react-hot-toast';
// import { formatPhoneNumber } from '../../../../utils/formatPhoneNumber';

// export default function ModalVenda({ isOpen, onClose, produto, onSubmit }) {
//   const [quantidade, setQuantidade] = useState('');
//   const [clienteNome, setClienteNome] = useState('');
//   const [apelido, setApelido] = useState('');
//   const [telefone, setTelefone] = useState('');
//   const [valorTotal, setValorTotal] = useState('');
//   const [clientes, setClientes] = useState([]);
//   const [isNewCliente, setIsNewCliente] = useState(false);
//   const [isParcelado, setIsParcelado] = useState(false);
//   const [numeroParcelas, setNumeroParcelas] = useState(1);
//   const [entrada, setEntrada] = useState('0.00');

//   useEffect(() => {
//     if (produto) {
//       setValorTotal(produto.preco.toFixed(2));
//     }
//     if (isOpen) {
//       fetch('/api/clientes', { cache: 'no-store' })
//         .then((res) => {
//           if (!res.ok) throw new Error('Erro ao carregar clientes');
//           return res.json();
//         })
//         .then((data) => setClientes(data))
//         .catch((error) => {
//           console.error('Erro ao carregar clientes:', error);
//           toast.error('Erro ao carregar clientes ❌');
//         });
//     }
//   }, [produto, isOpen]);

//   useEffect(() => {
//     if (produto && quantidade) {
//       const qty = parseInt(quantidade, 10);
//       if (!isNaN(qty) && qty > 0) {
//         setValorTotal((produto.preco * qty).toFixed(2));
//       }
//     }
//   }, [quantidade, produto]);

//   const calcularValorParcela = () => {
//     if (!valorTotal || !numeroParcelas || numeroParcelas <= 0) return 0;
//     const valor = parseFloat(valorTotal) || 0;
//     const entradaValor = parseFloat(entrada) || 0;
//     if (numeroParcelas === 1) return valor - entradaValor;
//     const valorRestante = valor - entradaValor;
//     const valorBaseParcela = Math.floor((valorRestante / numeroParcelas) * 100) / 100;
//     return valorBaseParcela;
//   };

//   const handleConfirm = async () => {
//     if (!quantidade || parseInt(quantidade) <= 0) {
//       toast.error('Digite uma quantidade válida');
//       return;
//     }
//     if (quantidade > produto.quantidade) {
//       toast.error('Quantidade maior que o estoque disponível');
//       return;
//     }
//     if (!clienteNome && !isNewCliente) {
//       toast.error('Selecione ou digite o nome do cliente');
//       return;
//     }
//     if (!valorTotal || parseFloat(valorTotal) <= 0) {
//       toast.error('Digite o valor total');
//       return;
//     }
//     if (isParcelado) {
//       const entradaValor = parseFloat(entrada) || 0;
//       if (entradaValor > parseFloat(valorTotal)) {
//         toast.error('A entrada não pode ser maior que o valor total');
//         return;
//       }
//       if (numeroParcelas < 1 || numeroParcelas > 12) {
//         toast.error('Número de parcelas deve ser entre 1 e 12');
//         return;
//       }
//     }

//     try {
//       let clienteId;

//       if (isNewCliente) {
//         if (!clienteNome) {
//           toast.error('Digite o nome do novo cliente');
//           return;
//         }
//         const res = await fetch('/api/clientes', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ nome: clienteNome, apelido, telefone }),
//         });

//         if (!res.ok) {
//           const errorData = await res.json();
//           throw new Error(errorData.error || 'Erro ao criar cliente');
//         }

//         const newCliente = await res.json();
//         clienteId = newCliente.id;
//       } else {
//         const cliente = clientes.find((c) => c.nome === clienteNome);
//         if (!cliente) {
//           toast.error('Selecione um cliente válido');
//           return;
//         }
//         clienteId = cliente.id;
//       }

//       const vendaData = {
//         produtoId: produto.id,
//         quantidade: parseInt(quantidade),
//         clienteId,
//         clienteNome,
//         valorTotal: parseFloat(valorTotal),
//         isParcelado,
//         numeroParcelas: isParcelado ? parseInt(numeroParcelas) : 1,
//         entrada: isParcelado ? parseFloat(entrada) || 0 : parseFloat(valorTotal),
//       };
//       console.log('Dados enviados pro onSubmit:', vendaData); // Depuração
//       const response = await onSubmit(vendaData);
//       if (!response) {
//         throw new Error('Nenhuma resposta recebida do servidor');
//       }
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Erro ao registrar venda');
//       }

//       // Limpar estados
//       setQuantidade('');
//       setClienteNome('');
//       setApelido('');
//       setTelefone('');
//       setValorTotal('');
//       setIsNewCliente(false);
//       setIsParcelado(false);
//       setNumeroParcelas(1);
//       setEntrada('0.00');
//       toast.success('Venda registrada com sucesso! ✅');
//       onClose(); // Fechar modal após sucesso
//     } catch (error) {
//       console.error('Erro ao registrar venda:', error);
//       toast.error(error.message || 'Erro inesperado ao registrar venda');
//     }
//   };

//   if (!isOpen || !produto) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-gray-600">
//       <div className="bg-white rounded-lg p-6 w-full max-w-md">
//         <h2 className="text-xl font-bold font-poppins text-gray-900 mb-4">
//           Registrar Venda - {produto.nome}
//         </h2>
//         <p className="text-gray-600 font-poppins text-sm mb-2">
//           Estoque atual: {produto.quantidade}
//         </p>
//         <p className="text-gray-600 font-poppins text-sm mb-4">
//           Preço do produto: R$ {produto.preco.toFixed(2)}
//         </p>

//         <div className="mb-4">
//           <label className="block text-sm font-medium font-poppins text-gray-700">
//             Quantidade
//           </label>
//           <input
//             type="number"
//             value={quantidade}
//             onChange={(e) => setQuantidade(e.target.value)}
//             placeholder="Quantidade a vender"
//             min="1"
//             max={produto.quantidade}
//             className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
//           />
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm font-medium font-poppins text-gray-700">
//             Cliente
//           </label>
//           {!isNewCliente ? (
//             <select
//               value={clienteNome}
//               onChange={(e) => setClienteNome(e.target.value)}
//               className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
//             >
//               <option value="">Selecione um cliente</option>
//               {clientes.map((cliente) => (
//                 <option key={cliente.id} value={cliente.nome}>
//                   {cliente.nome}
//                 </option>
//               ))}
//             </select>
//           ) : (
//             <div className="space-y-4">
//               <input
//                 type="text"
//                 value={clienteNome}
//                 onChange={(e) => setClienteNome(e.target.value)}
//                 placeholder="Nome do novo cliente"
//                 className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
//               />
//               <input
//                 type="text"
//                 value={apelido}
//                 onChange={(e) => setApelido(e.target.value)}
//                 placeholder="Apelido (opcional)"
//                 className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
//               />
//               <input
//                 type="text"
//                 value={telefone}
//                 onChange={(e) => setTelefone(formatPhoneNumber(e.target.value))}
//                 placeholder="(11) 99999-9999"
//                 className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
//               />
//             </div>
//           )}
//           <button
//             type="button"
//             onClick={() => {
//               setIsNewCliente(!isNewCliente);
//               if (!isNewCliente) {
//                 setClienteNome('');
//                 setApelido('');
//                 setTelefone('');
//               }
//             }}
//             className="mt-2 text-blue-600 hover:text-blue-800 font-poppins text-sm"
//           >
//             {isNewCliente ? 'Selecionar cliente existente' : 'Cadastrar novo cliente'}
//           </button>
//         </div>

//         <div className="mb-4">
//           <label className="block text-sm font-medium font-poppins text-gray-700">
//             Valor Total
//           </label>
//           <input
//             type="number"
//             step="0.01"
//             value={valorTotal}
//             onChange={(e) => setValorTotal(e.target.value)}
//             placeholder="Valor total (R$)"
//             className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
//           />
//         </div>

//         <div className="mb-4">
//           <label className="flex items-center text-sm font-medium font-poppins text-gray-700">
//             <input
//               type="checkbox"
//               checked={isParcelado}
//               onChange={(e) => setIsParcelado(e.target.checked)}
//               className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//             />
//             Pagar em parcelas
//           </label>
//           {isParcelado && (
//             <div className="mt-2 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium font-poppins text-gray-700">
//                   Número de Parcelas
//                 </label>
//                 <select
//                   value={numeroParcelas}
//                   onChange={(e) => setNumeroParcelas(e.target.value)}
//                   className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
//                 >
//                   {[...Array(12).keys()].map((i) => (
//                     <option key={i + 1} value={i + 1}>
//                       {i + 1}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium font-poppins text-gray-700">
//                   Entrada (R$)
//                 </label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={entrada}
//                   onChange={(e) => setEntrada(e.target.value)}
//                   placeholder="0.00"
//                   className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
//                 />
//               </div>
//               <p className="text-sm font-poppins text-gray-600">
//                 Valor por parcela: R$ {calcularValorParcela()}
//               </p>
//             </div>
//           )}
//         </div>

//         <div className="flex justify-end space-x-2">
//           <button
//             onClick={onClose}
//             className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 font-poppins text-sm"
//           >
//             Cancelar
//           </button>
//           <button
//             onClick={handleConfirm}
//             className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-poppins text-sm"
//           >
//             Confirmar
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { formatPhoneNumber } from '../../../../utils/formatPhoneNumber';
import { format, subDays, parseISO } from 'date-fns';

export default function ModalVenda({ isOpen, onClose, produto, onSubmit }) {
  const [quantidade, setQuantidade] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [apelido, setApelido] = useState('');
  const [telefone, setTelefone] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [dataVenda, setDataVenda] = useState(format(subDays(new Date(), 1), 'yyyy-MM-dd')); // Padrão: dia anterior
  const [clientes, setClientes] = useState([]);
  const [isNewCliente, setIsNewCliente] = useState(false);
  const [isParcelado, setIsParcelado] = useState(false);
  const [numeroParcelas, setNumeroParcelas] = useState(1);
  const [entrada, setEntrada] = useState('0.00');

  useEffect(() => {
    if (produto) {
      setValorTotal(produto.preco.toFixed(2));
    }
    if (isOpen) {
      fetch('/api/clientes', { cache: 'no-store' })
        .then((res) => {
          if (!res.ok) throw new Error('Erro ao carregar clientes');
          return res.json();
        })
        .then((data) => setClientes(data))
        .catch((error) => {
          console.error('Erro ao carregar clientes:', error);
          toast.error('Erro ao carregar clientes ❌');
        });
    }
  }, [produto, isOpen]);

  useEffect(() => {
    if (produto && quantidade) {
      const qty = parseInt(quantidade, 10);
      if (!isNaN(qty) && qty > 0) {
        setValorTotal((produto.preco * qty).toFixed(2));
      }
    }
  }, [quantidade, produto]);

  const calcularValorParcela = () => {
    if (!valorTotal || !numeroParcelas || numeroParcelas <= 0) return 0;
    const valor = parseFloat(valorTotal) || 0;
    const entradaValor = parseFloat(entrada) || 0;
    if (numeroParcelas === 1) return valor - entradaValor;
    const valorRestante = valor - entradaValor;
    const valorBaseParcela = Math.floor((valorRestante / numeroParcelas) * 100) / 100;
    return valorBaseParcela;
  };

  const handleConfirm = async () => {
    if (!quantidade || parseInt(quantidade) <= 0) {
      toast.error('Digite uma quantidade válida');
      return;
    }
    if (quantidade > produto.quantidade) {
      toast.error('Quantidade maior que o estoque disponível');
      return;
    }
    if (!clienteNome && !isNewCliente) {
      toast.error('Selecione ou digite o nome do cliente');
      return;
    }
    if (!valorTotal || parseFloat(valorTotal) <= 0) {
      toast.error('Digite o valor total');
      return;
    }
    if (isParcelado) {
      const entradaValor = parseFloat(entrada) || 0;
      if (entradaValor > parseFloat(valorTotal)) {
        toast.error('A entrada não pode ser maior que o valor total');
        return;
      }
      if (numeroParcelas < 1 || numeroParcelas > 12) {
        toast.error('Número de parcelas deve ser entre 1 e 12');
        return;
      }
    }
    // const selectedDate = parseISO(dataVenda);
    // Cria a data em UTC, evitando que o dia “volte” por causa do fuso horário
    const [year, month, day] = dataVenda.split('-');
    const selectedDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));

    const today = new Date();
    if (selectedDate > today) {
      toast.error('Data de venda não pode ser futura');
      return;
    }

    try {
      let clienteId;

      if (isNewCliente) {
        if (!clienteNome) {
          toast.error('Digite o nome do novo cliente');
          return;
        }
        const res = await fetch('/api/clientes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: clienteNome, apelido, telefone }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Erro ao criar cliente');
        }

        const newCliente = await res.json();
        clienteId = newCliente.id;
      } else {
        const cliente = clientes.find((c) => c.nome === clienteNome);
        if (!cliente) {
          toast.error('Selecione um cliente válido');
          return;
        }
        clienteId = cliente.id;
      }

      const vendaData = {
        produtoId: produto.id,
        quantidade: parseInt(quantidade),
        clienteId,
        clienteNome,
        valorTotal: parseFloat(valorTotal),
        isParcelado,
        numeroParcelas: isParcelado ? parseInt(numeroParcelas) : 1,
        entrada: isParcelado ? parseFloat(entrada) || 0 : parseFloat(valorTotal),
        // dataVenda, // Adiciona dataVenda
        dataVenda: selectedDate, // <-- agora já está correto em UTC
      };
      console.log('Dados enviados pro onSubmit:', vendaData); // Depuração
      const response = await onSubmit(vendaData);
      if (!response) {
        throw new Error('Nenhuma resposta recebida do servidor');
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao registrar venda');
      }

      // Limpar estados
      setQuantidade('');
      setClienteNome('');
      setApelido('');
      setTelefone('');
      setValorTotal('');
      setDataVenda(format(subDays(new Date(), 1), 'yyyy-MM-dd')); // Resetar pra dia anterior
      setIsNewCliente(false);
      setIsParcelado(false);
      setNumeroParcelas(1);
      setEntrada('0.00');
      toast.success('Venda registrada com sucesso! ✅');
      onClose(); // Fechar modal após sucesso
    } catch (error) {
      console.error('Erro ao registrar venda:', error);
      toast.error(error.message || 'Erro inesperado ao registrar venda');
    }
  };

  if (!isOpen || !produto) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-gray-600">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold font-poppins text-gray-900 mb-4">
          Registrar Venda - {produto.nome}
        </h2>
        <p className="text-gray-600 font-poppins text-sm mb-2">
          Estoque atual: {produto.quantidade}
        </p>
        <p className="text-gray-600 font-poppins text-sm mb-4">
          Preço do produto: R$ {produto.preco.toFixed(2)}
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium font-poppins text-gray-700">
            Quantidade
          </label>
          <input
            type="number"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            placeholder="Quantidade a vender"
            min="1"
            max={produto.quantidade}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium font-poppins text-gray-700">
            Cliente
          </label>
          {!isNewCliente ? (
            <select
              value={clienteNome}
              onChange={(e) => setClienteNome(e.target.value)}
              className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
            >
              <option value="">Selecione um cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.nome}>
                  {cliente.nome}
                </option>
              ))}
            </select>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value)}
                placeholder="Nome do novo cliente"
                className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
              />
              <input
                type="text"
                value={apelido}
                onChange={(e) => setApelido(e.target.value)}
                placeholder="Apelido (opcional)"
                className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
              />
              <input
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(formatPhoneNumber(e.target.value))}
                placeholder="(11) 99999-9999"
                className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
              />
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              setIsNewCliente(!isNewCliente);
              if (!isNewCliente) {
                setClienteNome('');
                setApelido('');
                setTelefone('');
              }
            }}
            className="mt-2 text-blue-600 hover:text-blue-800 font-poppins text-sm"
          >
            {isNewCliente ? 'Selecionar cliente existente' : 'Cadastrar novo cliente'}
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium font-poppins text-gray-700">
            Valor Total
          </label>
          <input
            type="number"
            step="0.01"
            value={valorTotal}
            onChange={(e) => setValorTotal(e.target.value)}
            placeholder="Valor total (R$)"
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium font-poppins text-gray-700">
            Data da Venda
          </label>
          <input
            type="date"
            value={dataVenda}
            onChange={(e) => setDataVenda(e.target.value)}
            max={format(new Date(), 'yyyy-MM-dd')} // Impede datas futuras
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
          />
          <p className="text-sm font-poppins text-gray-600 mt-1">
            Data selecionada: {format(parseISO(dataVenda), 'dd/MM/yyyy')}
          </p>
        </div>

        <div className="mb-4">
          <label className="flex items-center text-sm font-medium font-poppins text-gray-700">
            <input
              type="checkbox"
              checked={isParcelado}
              onChange={(e) => setIsParcelado(e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            Pagar em parcelas
          </label>
          {isParcelado && (
            <div className="mt-2 space-y-4">
              <div>
                <label className="block text-sm font-medium font-poppins text-gray-700">
                  Número de Parcelas
                </label>
                <select
                  value={numeroParcelas}
                  onChange={(e) => setNumeroParcelas(e.target.value)}
                  className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
                >
                  {[...Array(12).keys()].map((i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium font-poppins text-gray-700">
                  Entrada (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={entrada}
                  onChange={(e) => setEntrada(e.target.value)}
                  placeholder="0.00"
                  className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
                />
              </div>
              <p className="text-sm font-poppins text-gray-600">
                Valor por parcela: R$ {calcularValorParcela()}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 font-poppins text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-poppins text-sm"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

