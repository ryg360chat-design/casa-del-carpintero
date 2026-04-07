function SkeletonCard() {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="skeleton h-4 w-16 rounded" />
        <div className="skeleton h-5 w-20 rounded-full" />
      </div>
      <div className="skeleton h-3 w-12 rounded mb-1.5" />
      <div className="skeleton h-4 w-32 rounded mb-4" />
      <div className="skeleton h-6 w-24 rounded-full mb-4" />
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center">
            <div className="skeleton h-2.5 w-12 rounded mx-auto mb-1.5" />
            <div className="skeleton h-6 w-8 rounded mx-auto" />
          </div>
        ))}
      </div>
      <div className="skeleton h-4 w-28 rounded" />
    </div>
  );
}

export default function ProduccionLoading() {
  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="skeleton h-7 w-56 rounded-lg mb-2" />
          <div className="skeleton h-4 w-44 rounded" />
        </div>
        <div className="skeleton h-10 w-36 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {["M1", "M2"].map((m) => (
          <div key={m}>
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-zinc-200">
              <div className="skeleton h-5 w-24 rounded" />
              <div className="skeleton h-7 w-20 rounded-full" />
            </div>
            <div className="flex flex-col gap-4">
              {[1, 2].map((i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
