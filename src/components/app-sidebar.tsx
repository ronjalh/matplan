"use client";

import {
  Calendar,
  ChefHat,
  Home,
  ShoppingCart,
  Wallet,
  Sprout,
  Heart,
  QrCode,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Hjem", url: "/", icon: Home },
  { title: "Kalender", url: "/kalender", icon: Calendar },
  { title: "Oppskrifter", url: "/oppskrifter", icon: ChefHat },
  { title: "Handleliste", url: "/handleliste", icon: ShoppingCart },
  { title: "Budsjett", url: "/budsjett", icon: Wallet },
  { title: "Sesong", url: "/sesong", icon: Sprout },
  { title: "Inspirasjon", url: "/inspirasjon", icon: Heart },
  { title: "QR-koder", url: "/qr-koder", icon: QrCode },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-[family-name:var(--font-fraunces)] font-semibold text-primary">
            Matplan
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <Link
                    href={item.url}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      pathname === item.url
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Link
          href="/innstillinger"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Innstillinger</span>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
