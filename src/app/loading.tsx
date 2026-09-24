export default function Loading() {
  return (
    <div className="page-stack" aria-label="Memuat FinanceAI">
      <div className="skeleton skeleton-title" />
      <div className="dashboard-grid">
        <div className="skeleton skeleton-card span-2" />
        <div className="skeleton skeleton-card" />
        <div className="skeleton skeleton-card" />
      </div>
    </div>
  );
}
