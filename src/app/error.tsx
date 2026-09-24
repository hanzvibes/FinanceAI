"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main className="error-screen"><section className="error-card"><span className="eyebrow">FinanceAI</span><h1>Ada yang tidak berjalan semestinya.</h1><p>Data lokalmu tidak otomatis dihapus. Coba muat ulang bagian ini.</p><div className="error-actions"><button className="button primary" onClick={reset}>Coba lagi</button><Link className="button ghost" href="/">Ke Dashboard</Link></div></section></main>;
}
