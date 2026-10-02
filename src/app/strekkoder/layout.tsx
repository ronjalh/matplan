import { auth } from "@/lib/auth/auth-config";
import { AppChrome } from "@/components/app-chrome";
import { PublicChrome } from "@/components/public-chrome";

export default async function StrekkoderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session) {
    return <AppChrome user={session.user ?? {}}>{children}</AppChrome>;
  }

  return <PublicChrome>{children}</PublicChrome>;
}
