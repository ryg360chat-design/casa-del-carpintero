export default function AjustesLoading() {
  return (
    <div className="p-8 flex flex-col items-center min-h-full animate-fade-in">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <div className="skeleton h-7 w-24 rounded-lg mb-2" />
          <div className="skeleton h-4 w-52 rounded" />
        </div>
        <div className="flex flex-col gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-zinc-200 rounded-xl overflow-hidden animate-skeleton">
              <div className="px-5 pt-5 pb-3 border-b border-zinc-100">
                <div className="skeleton h-4 w-28 rounded mb-1.5" />
                <div className="skeleton h-3 w-44 rounded" />
              </div>
              <div className="px-5 py-4">
                <div className="skeleton h-10 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
