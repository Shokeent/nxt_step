export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-6 w-40 bg-gray-200 rounded" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-56 bg-gray-200 rounded-lg" />
        <div className="h-56 bg-gray-200 rounded-lg" />
      </div>
    </div>
  )
}
