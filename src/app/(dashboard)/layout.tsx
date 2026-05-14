import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole, CAN_CREATE_PEDIDO, IS_ADMIN, IS_DEVELOPER } from "@/lib/auth";
import { getOrganization, isTrialExpired, daysLeftInTrial } from "@/lib/org";
import { sendTrialWarningEmail, sendTrialExpiredEmail } from "@/lib/send-emails";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import NavigationProgress from "@/components/NavigationProgress";
import TopBar from "@/components/TopBar";
import OnboardingBanner from "@/components/OnboardingBanner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [role, org] = await Promise.all([getUserRole(), getOrganization()]);

  // Emails de trial (solo para usuarios reales, no developer)
  if (org && role !== "developer" && user.email) {
    if (isTrialExpired(org)) {
      // Email de expiración — solo una vez
      if (!org.email_trial_expired_sent) {
        sendTrialExpiredEmail(user.email, org.id, org.nombre).catch(() => {});
      }
      redirect("/trial-expirado");
    } else if (org.plan === "trial") {
      // Email de advertencia cuando quedan ≤3 días
      const days = daysLeftInTrial(org);
      if (days <= 3 && !org.email_trial_warning_sent) {
        sendTrialWarningEmail(user.email, org.id, org.nombre, days).catch(() => {});
      }
    }
  }

  // Bloquear si la org fue suspendida por el super admin
  if (org && !org.activo && role !== "developer") {
    redirect("/trial-expirado");
  }

  const canCreatePedido = CAN_CREATE_PEDIDO.includes(role);
  const isAdmin = IS_ADMIN.includes(role);
  const isDeveloper = IS_DEVELOPER.includes(role);

  return (
    <div className="flex h-screen bg-zinc-100 overflow-hidden">
      <NavigationProgress />
      <Sidebar
        userEmail={user?.email ?? "dev@local"}
        userRole={role}
        isAdmin={isAdmin}
        isDeveloper={isDeveloper}
        orgNombre={org?.nombre ?? "Kuadra"}
        orgPlan={org?.plan ?? "trial"}
        orgFeatures={org?.features_enabled ?? []}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar canCreatePedido={canCreatePedido} />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0 bg-[#f8f9fb]">
          {org && <OnboardingBanner org={org} />}
          {children}
        </main>
      </div>
      <BottomNav isAdmin={isAdmin} isDeveloper={isDeveloper} />
    </div>
  );
}
