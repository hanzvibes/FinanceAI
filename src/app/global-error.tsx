"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="id"><body><main style={{maxWidth:640,margin:"80px auto",padding:24,fontFamily:"system-ui,sans-serif"}}><h1>FinanceAI perlu dimuat ulang.</h1><p>Terjadi error pada application shell. Data lokal di browser tidak otomatis dihapus.</p><button onClick={reset} style={{minHeight:44,padding:"0 16px",border:0,borderRadius:10,cursor:"pointer"}}>Coba lagi</button></main></body></html>;
}
