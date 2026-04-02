"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ChefHat, ShoppingCart, Wallet, Sprout, Heart } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

const iconMap = {
  calendar: Calendar,
  chefhat: ChefHat,
  shoppingcart: ShoppingCart,
  wallet: Wallet,
  sprout: Sprout,
  heart: Heart,
} as const;

type IconName = keyof typeof iconMap;

interface DashboardCardProps {
  href: string;
  icon: IconName;
  title: string;
  description: string;
  color: string;
}

export function DashboardCard({
  href,
  icon,
  title,
  description,
  color,
}: DashboardCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const Icon = iconMap[icon];

  return (
    <Link
      href={href}
      className="block group"
      onMouseEnter={() => {
        if (cardRef.current) cardRef.current.style.borderColor = color + "80";
      }}
      onMouseLeave={() => {
        if (cardRef.current) cardRef.current.style.borderColor = "";
      }}
    >
      <Card
        ref={cardRef}
        className="h-full transition-all group-hover:shadow-lg group-hover:scale-[1.02]"
      >
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <div
            className="rounded-full p-2"
            style={{ backgroundColor: color + "1A" }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <CardTitle className="text-base">
            <span className="transition-colors group-hover:hidden">{title}</span>
            <span className="hidden transition-colors group-hover:inline" style={{ color }}>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
