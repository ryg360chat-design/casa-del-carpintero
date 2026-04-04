import { createClient } from "@/lib/supabase/server";
import SetPasswordForm from "./SetPasswordForm";
import Link from "next/link";

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#fafaf9" }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm shrink-0"
            style={{ background: "linear-gradient(135deg, #1957A6, #267A8C)" }}>
            <span className="text-white font-black text-[13px] tracking-tight">CC</span>
          </div>
          <div>
            <p className="font-bold text-zinc-900 text-sm leading-tight">Casa del Carpintero</p>
            <p className="text-[10px] text-zinc-400">Production OS</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string }>;
}) {
  const { token_hash, type } = await searchParams;

  if (!token_hash || type !== "invite") {
    return (
      <AuthShell>
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h2 className="font-bold text-zinc-900 mb-1">Link no válido</h2>
          <p className="text-sm text-zinc-500 mb-4">El link de invitación no es válido o ya fue usado.</p>
          <Link href="/login" className="text-sm font-semibold" style={{ color: "#1957A6" }}>Ir al inicio de sesión</Link>
        </div>
      </AuthShell>
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash, type: "invite" });

  if (error) {
    return (
      <AuthShell>
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h2 className="font-bold text-zinc-900 mb-1">Link expirado</h2>
          <p className="text-sm text-zinc-500 mb-4">El link de invitación expiró o ya fue usado. Pedí una nueva invitación al administrador.</p>
          <Link href="/login" className="text-sm font-semibold" style={{ color: "#1957A6" }}>Ir al inicio de sesión</Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight">Bienvenido a Casa del Carpintero</h1>
          <p className="text-zinc-500 text-sm mt-1">Elegí una contraseña para activar tu cuenta.</p>
        </div>
        <SetPasswordForm />
      </div>
    </AuthShell>
  );
}
