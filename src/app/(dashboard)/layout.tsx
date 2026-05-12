import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole, CAN_CREATE_PEDIDO, IS_ADMIN, IS_DEVELOPER } from "@/lib/auth";
import { getOrganization } from "@/lib/org";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import NavigationProgress from "@/components/NavigationProgress";
import TopBar from "@/components/TopBar";

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
          {children}
        </main>
      </div>
      <BottomNav isAdmin={isAdmin} isDeveloper={isDeveloper} />
    </div>
  );
}
