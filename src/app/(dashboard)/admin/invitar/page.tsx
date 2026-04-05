import { redirect } from "next/navigation";
import { getUserRole, IS_ADMIN } from "@/lib/auth";
import InvitarForm from "./InvitarForm";

export default async function InvitarUsuarioPage() {
  const role = await getUserRole();
  if (!IS_ADMIN.includes(role)) redirect("/dashboard");

  return <InvitarForm />;
}
