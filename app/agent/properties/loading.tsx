export default function Loading() {
  return (
    <main className="pt-24 pb-16 bg-dark-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10">
          <div className="h-4 w-24 bg-dark-800 rounded mb-3 animate-pulse" />
          <div className="h-10 w-56 bg-dark-800 rounded mb-4 animate-pulse" />
          <div className="h-1 w-24 bg-dark-800 rounded animate-pulse" />
        </div>

        <div className="mb-8 max-w-md h-12 bg-dark-800 rounded-xl animate-pulse" />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="bg-dark-800 border border-dark-700/40 rounded-2xl overflow-hidden animate-pulse"
            >
              <div className="h-60 bg-dark-700/60" />
              <div className="p-5">
                <div className="h-5 bg-dark-700/60 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
