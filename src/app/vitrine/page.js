'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Search, Filter, Heart, ShoppingBag } from 'lucide-react';

export default function VitrinePage() {
  const [produtos, setProdutos] = useState([]);
  const [filteredProdutos, setFilteredProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMarcas, setSelectedMarcas] = useState([]);

  useEffect(() => {
    fetch('/api/vitrine')
      .then(res => res.json())
      .then(data => {
        setProdutos(data.data);
        setFilteredProdutos(data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // FILTROS
  useEffect(() => {
    let filtered = produtos;
    
    if (search) {
      filtered = filtered.filter(p => 
        p.nome.toLowerCase().includes(search.toLowerCase()) ||
        p.marca.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (selectedMarcas.length > 0) {
      filtered = filtered.filter(p => selectedMarcas.includes(p.marca));
    }
    
    setFilteredProdutos(filtered);
  }, [search, selectedMarcas, produtos]);

  const marcasUnicas = [...new Set(produtos.map(p => p.marca))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-64 bg-gray-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-10 bg-green-200 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER - CORES DA LOJA #394189 + #c33638 */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#394189] to-[#c33638] text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 animate-fade-in-down">
              👟 Calçados Araújo
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              As melhores opções para seus pés! Qualidade e conforto garantidos
            </p>
            <div className="flex justify-center flex-wrap gap-4 mb-8">
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
                <span className="text-lg">🏪 Retirada na Loja</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
                <span className="text-lg">✅ 7 Dias Garantia</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
                <span className="text-lg">💳 Parcelado</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH + FILTROS - NEUTRO */}
      <div className="container mx-auto px-4 py-8 -mt-16 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 text-gray-500">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar tênis, sandália, Nike..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                onChange={(e) => setSelectedMarcas(
                  e.target.value ? [e.target.value] : []
                )}
                className="border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="">Todas as Marcas</option>
                {marcasUnicas.map(marca => (
                  <option key={marca} value={marca}>{marca}</option>
                ))}
              </select>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mt-2 font-medium">
            {filteredProdutos.length} produto{filteredProdutos.length !== 1 ? 's' : ''} encontrado{filteredProdutos.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* CARDS - NEUTRO + VERDE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProdutos.map((produto, index) => (
            <div
              key={produto.id}
              className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* IMAGEM */}
              <div className="relative h-64 overflow-hidden bg-gray-50">
                {produto.imagem ? (
                  <Image 
                    src={produto.imagem} 
                    alt={produto.nome}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400 text-6xl">👟</span>
                  </div>
                )}
                
                {/* OVERLAY */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-3">
                    <button className="bg-white p-3 rounded-full hover:bg-gray-100 transition-all shadow-sm">
                      <Heart className="w-5 h-5 text-gray-700" />
                    </button>
                    <button className="bg-white p-3 rounded-full hover:bg-gray-100 transition-all shadow-sm">
                      <ShoppingBag className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>
                </div>
              </div>

              {/* CONTEÚDO - NEUTRO */}
              <div className="p-5">
                <h2 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
                  {produto.nome}
                </h2>
                
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">{produto.marca}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {produto.modelo}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  Cor: <span className="font-medium">{produto.cor}</span>
                </p>
                
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                  📏 Tamanhos: {produto.tamanhosDisponiveis.slice(0, 6).join(', ')}
                  {produto.tamanhosDisponiveis.length > 6 && ' +'}
                </p>
                
                {/* PREÇO - VERDE */}
                <div className="text-2xl font-bold text-green-600 mb-4">
                  R$ {produto.precoVenda.toFixed(2)}
                </div>

                {/* WHATSAPP - VERDE */}
                <a
                  href={`https://wa.me/5511999999999?text=👋%20Oi!%20Quero%20o%20${encodeURIComponent(produto.nome)}%20${produto.modelo}%20${produto.marca}%20(${produto.cor})%0A📏%20Tamanhos:%20${produto.tamanhosDisponiveis.join(', ')}%0A💰%20Preço:%20R$${produto.precoVenda.toFixed(2)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl text-center transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <span className="flex items-center justify-center gap-2">
                    💬 WhatsApp
                  </span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        {filteredProdutos.length === 0 && (
          <div className="text-center py-16">
            <ShoppingBag className="mx-auto w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-500">Tente outra busca ou marca</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out;
        }
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
}