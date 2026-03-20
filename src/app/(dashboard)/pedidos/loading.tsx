function SkeletonRow() {
  return (
    <tr className="border-b border-zinc-50">
      <td className="px-4 py-3.5"><div className="skeleton h-3 w-8 rounded" /></td>
      <td className="px-4 py-3.5"><div className="skeleton h-3.5 w-28 rounded" /></td>
      <td className="px-4 py-3.5"><div className="skeleton h-3 w-24 rounded" /></td>
      <td className="px-4 py-3.5 text-center"><div className="skeleton h-3 w-8 rounded mx-auto" /></td>
      <td className="px-4 py-3.5 text-center"><div className="skeleton h-3 w-8 rounded mx-auto" /></td>
      <td className="px-4 py-3.5"><div className="skeleton h-5 w-8 rounded-md" /></td>
      <td className="px-4 py-3.5"><div className="skeleton h-5 w-20 rounded-full" /></td>
      <td className="px-4 py-3.5"><div className="skeleton h-3 w-16 rounded" /></td>
      <td className="px-4 py-3.5"><div className="skeleton h-6 w-10 rounded-lg" /></td>
    </tr>
  );
}

export default function PedidosLoading() {
  return (
    <div className="p-8 flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="skeleton h-7 w-28 rounded-lg mb-2" />
          <div className="skeleton h-4 w-40 rounded" />
        </div>
        <div className="skeleton h-10 w-36 rounded-xl" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-zinc-200 rounded-xl px-5 py-4 animate-skeleton">
            <div className="skeleton h-3 w-20 rounded mb-3" />
            <div className="skeleton h-8 w-12 rounded" />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="skeleton h-10 flex-1 rounded-lg" />
            <div className="skeleton h-10 w-28 rounded-lg" />
            <div className="skeleton h-10 w-24 rounded-lg" />
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100">
              {["#", "Cliente", "Material", "Planchas", "Piezas", "Máquina", "Estado", "Entrega", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left">
                  <div className="skeleton h-2.5 w-12 rounded" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="animate-skeleton">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
