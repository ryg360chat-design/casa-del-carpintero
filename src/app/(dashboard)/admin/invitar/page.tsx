import { redirect } from "next/navigation";
import { getUserRole, IS_ADMIN, IS_DEVELOPER } from "@/lib/auth";
import InvitarForm from "./InvitarForm";

export default async function InvitarUsuarioPage() {
  const role = await getUserRole();
  if (!IS_ADMIN.includes(role)) redirect("/dashboard");

  return <InvitarForm isAdmin={IS_DEVELOPER.includes(role)} />;
}
