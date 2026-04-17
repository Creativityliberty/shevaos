"use client";

import { Bell, Menu, Search, User, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/core/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { NotificationCenter } from "./NotificationCenter";
import { SearchCommand } from "./SearchCommand";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Navbar() {
  const pathname = usePathname();
  const { user, role, signOut } = useAuth();

  // Titre dynamique basé sur le pathname
  const getPageTitle = (path: string) => {
    if (path === "/dashboard") return "Tableau de Bord";
    if (path.startsWith("/orders")) return "Commandes";
    if (path.startsWith("/customers")) return "Clients";
    if (path.startsWith("/finance")) return "Finance";
    if (path.startsWith("/dispatch")) return "Dispatch";
    if (path.startsWith("/hub")) return "Gestion Hub";
    if (path.startsWith("/inventory")) return "Stock";
    if (path.startsWith("/settings")) return "Paramètres";
    return "SHEVA OS";
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b border-gray-100 bg-white/80 px-8 backdrop-blur-md">
      <div className="flex flex-1 items-center gap-4">
        <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">
          {getPageTitle(pathname)}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Global Search */}
        <SearchCommand />

        {/* Notifications */}
        <NotificationCenter />

        {/* Profil Utilisateur */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-fit gap-3 rounded-xl hover:bg-gray-50 px-2 transition-all border border-transparent hover:border-gray-100">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-bold text-gray-900 leading-none">
                  {user?.email?.split("@")[0]}
                </span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  {role}
                </span>
              </div>
              <Avatar className="h-8 w-8 rounded-lg border-2 border-white shadow-sm">
                <AvatarFallback className="bg-primary/10 text-primary font-bold rounded-lg text-xs">
                  {user?.email?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 rounded-2xl p-2" align="end" forceMount>
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-black leading-none">{user?.email?.split("@")[0]}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-xl p-3 cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Mon Profil</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl p-3 cursor-pointer">
              <Search className="mr-2 h-4 w-4" />
              <span>Activité</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="rounded-xl p-3 cursor-pointer text-red-600 hover:text-red-600 hover:bg-red-50"
              onClick={() => signOut()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Se déconnecter</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
