// src/components/LoadingSkeleton.js
export default function LoadingSkeleton({ type = "default" }) {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER PADRÃO (todas as páginas têm) */}
      <div className="w-48 h-6 bg-gray-200 animate-pulse rounded mb-6"></div>

      {/* ROTEAMENTO POR TIPO */}
      {type === "home" && <HomeSkeleton />}
      {type === "dashboard" && <DashboardSkeleton />}
      {type === "clientes-lista" && <ClientesListaSkeleton />}
      {type === "clientes-detalhe" && <ClientesDetalheSkeleton />}
      {type === "vendas" && <VendasSkeleton />}
      {type === "estoque" && <EstoqueSkeleton />}
      {type === "default" && <DefaultSkeleton />}
    </div>
  );
}

// ========== HOME (/) ==========
function HomeSkeleton() {
  return (
    <>
      <div className="w-28 h-8 bg-gray-200 animate-pulse rounded mb-6"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-xl h-16 flex items-center gap-3">
            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
            <div className="space-y-1 flex-1">
              <div className="w-12 h-2.5 bg-gray-200 rounded"></div>
              <div className="w-16 h-5 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-4">
        <div className="w-40 h-4 bg-gray-200 rounded mb-3"></div>
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-50 rounded"></div>
          ))}
        </div>
      </div>
    </>
  );
}

// ========== DASHBOARD ==========
function DashboardSkeleton() {
  return (
    <>
      <div className="w-32 h-9 bg-gray-200 animate-pulse rounded mb-6"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-xl h-16">
            <div className="w-24 h-5 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-5 rounded-xl h-64"></div>
        <div className="bg-white p-5 rounded-xl h-64"></div>
      </div>
      <div className="bg-white p-5 rounded-xl mb-6">
        <div className="w-48 h-5 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-50 rounded"></div>
          ))}
        </div>
      </div>
    </>
  );
}

// ========== CLIENTES (LISTA) ==========
function ClientesListaSkeleton() {
  return (
    <>
      <div className="w-32 h-9 bg-gray-200 animate-pulse rounded mb-6"></div>
      <div className="bg-white rounded-xl p-4">
        <div className="w-40 h-4 bg-gray-200 rounded mb-3"></div>
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-50 rounded"></div>
          ))}
        </div>
      </div>
    </>
  );
}

// ========== CLIENTES/[ID] (DETALHE) ==========
function ClientesDetalheSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-xl h-20">
            <div className="w-20 h-3 bg-gray-200 rounded mb-2"></div>
            <div className="w-28 h-6 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-6 mb-8">
        <div className="flex justify-between mb-6">
          <div className="w-48 h-6 bg-gray-200 rounded"></div>
          <div className="w-32 h-10 bg-gray-200 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="w-16 h-3 bg-gray-200 rounded"></div>
                <div className="w-32 h-5 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl p-6">
        <div className="w-40 h-5 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-50 rounded"></div>
          ))}
        </div>
      </div>
    </>
  );
}

// ========== VENDAS ==========
function VendasSkeleton() {
  return (
    <>
      {/* 4 Cards Resumo (Total, Quitadas, Pendentes, Modelos) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-2 h-18 flex items-center">
            <div className="w-7 h-7 bg-gray-200 rounded"></div>
            <div className="flex-1 ml-1.5 space-y-1">
              <div className="w-20 h-3 bg-gray-200 rounded"></div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white p-3 sm:p-4 rounded-lg mb-4">
        <div className="w-40 h-5 bg-gray-200 rounded mb-3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
          <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      {/* Ranking Modelos (Top 5) */}
      <div className="bg-white rounded-lg p-3 sm:p-4 mb-4">
        <div className="w-48 h-5 bg-gray-200 rounded mb-2"></div>
        <div className="space-y-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-2">
              <div className="flex-1 h-8 bg-gray-50 rounded"></div>
              <div className="w-16 h-8 bg-gray-50 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabela de Vendas */}
      <div className="bg-white rounded-lg p-3 sm:p-4 mb-4">
        <div className="w-56 h-5 bg-gray-200 rounded mb-3"></div>
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-11 gap-1 text-xs">
              <div className="h-8 bg-gray-50 rounded col-span-1"></div>
              <div className="h-8 bg-gray-50 rounded hidden sm:block col-span-1"></div>
              <div className="h-8 bg-gray-50 rounded hidden md:block col-span-1"></div>
              <div className="h-8 bg-gray-50 rounded col-span-1"></div>
              <div className="h-8 bg-gray-50 rounded hidden sm:block col-span-1"></div>
              <div className="h-8 bg-gray-50 rounded hidden md:block col-span-1"></div>
              <div className="h-8 bg-gray-50 rounded hidden lg:block col-span-1"></div>
              <div className="h-8 bg-gray-50 rounded hidden md:block col-span-1"></div>
              <div className="h-8 bg-gray-50 rounded hidden sm:block col-span-1"></div>
              <div className="h-8 bg-gray-50 rounded col-span-1"></div>
              <div className="h-8 bg-gray-50 rounded col-span-1"></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ========== ESTOQUE ==========
function EstoqueSkeleton() {
  return (
    <>
      <div className="w-28 h-8 bg-gray-200 animate-pulse rounded mb-6"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-xl h-16">
            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
            <div className="mt-2 w-16 h-5 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-4">
        <div className="w-40 h-4 bg-gray-200 rounded mb-3"></div>
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-50 rounded"></div>
          ))}
        </div>
      </div>
    </>
  );
}

// ========== DEFAULT (genérico) ==========
function DefaultSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-xl h-20">
            <div className="w-24 h-5 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}