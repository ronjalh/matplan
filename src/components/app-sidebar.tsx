"use client";

import {
  Calendar,
  ChefHat,
  Home,
  ShoppingCart,
  Wallet,
  Sprout,
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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "./theme-toggle";

const navItems = [
  { title: "Hjem", url: "/", icon: Home },
  { title: "Kalender", url: "/kalender", icon: Calendar },
  { title: "Oppskrifter", url: "/oppskrifter", icon: ChefHat },
  { title: "Handleliste", url: "/handleliste", icon: ShoppingCart },
  { title: "Budsjett", url: "/budsjett", icon: Wallet },
  { title: "Sesong", url: "/sesong", icon: Sprout },
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
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex items-center justify-between">
          <SidebarMenuButton asChild>
            <Link href="/innstillinger">
              <Settings className="w-4 h-4" />
              <span>Innstillinger</span>
            </Link>
          </SidebarMenuButton>
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
