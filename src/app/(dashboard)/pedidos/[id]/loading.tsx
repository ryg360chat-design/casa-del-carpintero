export default function PedidoDetailLoading() {
  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      {/* Back */}
      <div className="skeleton h-4 w-32 rounded mb-6" />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="skeleton h-8 w-52 rounded-lg mb-2" />
          <div className="skeleton h-4 w-64 rounded" />
        </div>
        <div className="skeleton h-8 w-20 rounded-full" />
      </div>

      {/* Progress */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 mb-5 animate-skeleton">
        <div className="skeleton h-3 w-32 rounded mb-5" />
        <div className="flex items-center gap-0">
          {[1, 2, 3, 4].map((i, idx) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className="skeleton w-9 h-9 rounded-full" />
                <div className="skeleton h-3 w-16 rounded mt-2" />
              </div>
              {idx < 3 && <div className="flex-1 skeleton h-0.5 mx-2 mb-5 rounded-full" />}
            </div>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white border border-zinc-200 rounded-xl p-5 animate-skeleton">
          <div className="skeleton h-3 w-28 rounded mb-4" />
          <div className="grid grid-cols-2 gap-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i}>
                <div className="skeleton h-2.5 w-12 rounded mb-1.5" />
                <div className="skeleton h-4 w-16 rounded" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <div className="bg-white border border-zinc-200 rounded-xl p-5 animate-skeleton">
            <div className="skeleton h-3 w-16 rounded mb-3" />
            <div className="skeleton h-4 w-32 rounded mb-2" />
            <div className="skeleton h-3 w-28 rounded" />
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-5 animate-skeleton">
            <div className="skeleton h-3 w-16 rounded mb-3" />
            <div className="flex flex-col gap-2.5">
              {[1, 2].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="skeleton h-3 w-20 rounded" />
                  <div className="skeleton h-3 w-24 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
