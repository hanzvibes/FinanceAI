type PublicEnv = {
  appName: string;
  appUrl?: string;
};

function optionalUrl(value: string | undefined) {
  if (!value) return undefined;
  try { return new URL(value).toString().replace(/\/$/, ""); }
  catch { if (process.env.NODE_ENV === "production") throw new Error("NEXT_PUBLIC_APP_URL harus berupa URL valid."); return undefined; }
}

export const env: PublicEnv = Object.freeze({
  appName: process.env.NEXT_PUBLIC_APP_NAME?.trim() || "FinanceAI",
  appUrl: optionalUrl(process.env.NEXT_PUBLIC_APP_URL),
});
