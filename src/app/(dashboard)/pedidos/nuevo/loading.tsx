export default function NuevoPedidoLoading() {
  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto">
      <div className="mb-7">
        <div className="skeleton h-7 w-40 rounded-lg mb-2" />
        <div className="skeleton h-4 w-64 rounded" />
      </div>
      <div className="flex flex-col gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-zinc-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="skeleton w-7 h-7 rounded-full" />
              <div className="skeleton h-5 w-32 rounded" />
            </div>
            <div className="skeleton h-10 w-full rounded-lg mb-3" />
            <div className="skeleton h-10 w-3/4 rounded-lg" />
          </div>
        ))}
        <div className="skeleton h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}
