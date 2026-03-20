export default function CalendarioLoading() {
  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-7">
        <div className="skeleton h-7 w-36 rounded-lg mb-2" />
        <div className="skeleton h-4 w-52 rounded" />
      </div>
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden animate-skeleton">
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="skeleton h-5 w-32 rounded" />
          <div className="flex gap-2">
            <div className="skeleton h-8 w-8 rounded-lg" />
            <div className="skeleton h-8 w-8 rounded-lg" />
          </div>
        </div>
        <div className="p-5 grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="skeleton h-4 w-full rounded" />
          ))}
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
