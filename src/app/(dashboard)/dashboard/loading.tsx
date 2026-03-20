function SkeletonCard() {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-5">
      <div className="skeleton h-3 w-20 mb-3 rounded" />
      <div className="skeleton h-10 w-16 rounded" />
    </div>
  );
}

function SkeletonOrderCard() {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 animate-skeleton">
      <div className="flex justify-between mb-3">
        <div>
          <div className="skeleton h-3 w-24 mb-1.5 rounded" />
          <div className="skeleton h-2.5 w-16 rounded" />
        </div>
        <div className="skeleton h-5 w-14 rounded-md" />
      </div>
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-10 rounded-lg" />
        ))}
      </div>
      <div className="skeleton h-0.5 w-full rounded mb-2" />
      <div className="flex justify-between">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-7 w-7 rounded-lg" />
      </div>
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <div className="skeleton h-7 w-52 rounded-lg mb-2" />
          <div className="skeleton h-4 w-36 rounded" />
        </div>
        <div className="skeleton h-10 w-36 rounded-xl" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
      </div>

      {/* Machines */}
      <div className="grid grid-cols-2 gap-6">
        {[1, 2].map((col) => (
          <div key={col}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="skeleton w-8 h-8 rounded-lg" />
                <div>
                  <div className="skeleton h-3.5 w-20 rounded mb-1" />
                  <div className="skeleton h-2.5 w-10 rounded" />
                </div>
              </div>
              <div className="skeleton h-4 w-24 rounded" />
            </div>
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => <SkeletonOrderCard key={i} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
