import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";
import NavigationProgress from "@/components/NavigationProgress";
import TopBar from "@/components/TopBar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const supabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("http");

  if (!user && supabaseConfigured) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-zinc-100 overflow-hidden">
      <NavigationProgress />
      <Sidebar userEmail={user?.email ?? "dev@local"} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
