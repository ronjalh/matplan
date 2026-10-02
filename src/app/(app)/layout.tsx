import { auth } from "@/lib/auth/auth-config";
import { redirect } from "next/navigation";
import { AppChrome } from "@/components/app-chrome";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return <AppChrome user={session.user ?? {}}>{children}</AppChrome>;
}
