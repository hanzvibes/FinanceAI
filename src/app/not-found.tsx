import Link from "next/link";

export default function NotFound() {
  return (
    <main className="center-screen">
      <div className="empty-state card">
        <span className="empty-icon">404</span>
        <h1>Halaman tidak ditemukan</h1>
        <p>Jalur ini belum menjadi bagian dari FinanceAI.</p>
        <Link className="button primary" href="/">Kembali ke dashboard</Link>
      </div>
    </main>
  );
}
