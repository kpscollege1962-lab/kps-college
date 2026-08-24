export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-xs text-muted-foreground">Spring 2026 — All Campuses</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <p className="text-sm font-semibold text-foreground">Recent Activity</p>
        <div className="space-y-3">
          {[
            { title: 'New student enrolled', sub: 'Aisha Malik · Grade 9A', time: '2m ago' },
            { title: 'Attendance marked', sub: 'Mr. Salman · Class 10B', time: '18m ago' },
            { title: 'Fee payment received', sub: 'Omar Tariq · PKR 12,000', time: '1h ago' },
            { title: 'Exam results published', sub: 'Mid-term · Grade 8', time: '3h ago' },
          ].map((item) => (
            <div key={item.title} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
