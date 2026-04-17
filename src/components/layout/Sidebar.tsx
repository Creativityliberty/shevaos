"use client";

import { useState, useEffect } from "react";
import { 
  LogOut, 
  LayoutDashboard, 
  Headset,
  Wallet,
  Package,
  Truck,
  Megaphone,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { useAuth } from "@/core/auth/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { UserRole } from "@/core/auth/roles";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
  children?: { label: string; href: string }[];
};

const NAV_ITEMS: NavItem[] = [
  { 
    label: "Tableau de Bord", 
    href: "/dashboard", 
    icon: LayoutDashboard, 
    roles: ["ceo", "manager", "super_admin"] 
  },
  { 
    label: "Vision Stratégique", 
    href: "/admin/vision", 
    icon: TrendingUp, 
    roles: ["ceo", "super_admin"] 
  },
  { 
    label: "Service Client", 
    href: "/orders", 
    icon: Headset, 
    roles: ["ceo", "manager", "sav_agent", "sav_manager", "super_admin"],
    children: [
      { label: "Commandes", href: "/orders" },
      { label: "Relances SAV (Radar)", href: "/sav/follow-ups" },
      { label: "Suivi SAV (Incidents)", href: "/sav" },
      { label: "Clients (CRM)", href: "/customers" },
    ]
  },
  { 
    label: "Finance", 
    href: "/finance/deposits", 
    icon: Wallet, 
    roles: ["ceo", "finance", "super_admin"],
    children: [
      { label: "Dépôts", href: "/finance/deposits" },
      { label: "Dépenses", href: "/finance/expenses" },
      { label: "Comptes & Transferts", href: "/finance/accounts" },
      { label: "Grand Livre", href: "/finance/ledger" },
      { label: "Rapports", href: "/finance/reports" },
    ]
  },
  { 
    label: "Stocks", 
    href: "/stock/products", 
    icon: Package, 
    roles: ["ceo", "manager", "stock_manager", "achats", "super_admin"],
    children: [
      { label: "Inventaire Hub", href: "/stock/inventory" },
      { label: "Catalogue Administration", href: "/admin/catalog" },
      { label: "État des Stocks", href: "/stock/products" },
      { label: "Réception Marchandise", href: "/stock/receive" },
      { label: "Suivi Mouvements", href: "/stock/movements" }
    ]
  },
  { 
    label: "Logistique", 
    href: "/dispatch", 
    icon: Truck, 
    roles: ["ceo", "manager", "dispatcher", "ops_manager", "achats", "super_admin"],
    children: [
      { label: "Suivi Livraisons (Dispatch)", href: "/dispatch" },
      { label: "Gestion Fournisseurs", href: "/logistique/fournisseurs" },
      { label: "Arrivages Imports", href: "/logistique/import" },
    ]
  },
  { 
    label: "Marketing", 
    href: "/ads", 
    icon: Megaphone, 
    roles: ["ceo", "ads_manager", "super_admin"] 
  },
  { 
    label: "Équipe & RH", 
    href: "/admin/hr", 
    icon: Users, 
    roles: ["ceo", "super_admin"],
    children: [
      { label: "Dossiers RH", href: "/admin/hr" },
      { label: "Utilisateurs Système", href: "/admin/users" }
    ]
  },
  { 
    label: "Paramètres", 
    href: "/settings", 
    icon: Settings, 
    roles: ["ceo", "super_admin"] 
  },
];

export function Sidebar() {
  const { role, isLoading, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    if (saved) setIsCollapsed(saved === "true");
  }, []);

  const toggleSidebar = () => {
    const newVal = !isCollapsed;
    setIsCollapsed(newVal);
    localStorage.setItem("sidebar_collapsed", String(newVal));
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/login";
  };

  const allowedItems = NAV_ITEMS.filter(item => role && item.roles.includes(role));

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  if (isLoading) {
    return (
      <aside className={cn(
        "bg-white border-r border-gray-100 flex flex-col pt-8 pb-6 transition-all duration-500",
        isCollapsed ? "w-24" : "w-72"
      )}>
        <div className="px-6 mb-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-200 shrink-0">
            <span className="font-black text-xl animate-pulse">S</span>
          </div>
          {!isCollapsed && <Skeleton className="h-6 w-32 bg-gray-50" />}
        </div>
        <div className="flex-1 space-y-4 px-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-2xl bg-gray-50/50" />
          ))}
        </div>
      </aside>
    );
  }

  if (!isLoading && allowedItems.length === 0) {
    return (
      <aside className={cn(
        "bg-white border-r border-gray-100 flex flex-col pt-8 pb-6 transition-all duration-500",
        isCollapsed ? "w-24" : "w-72"
      )}>
        <div className="px-6 mb-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-primary">S</div>
          {!isCollapsed && <div className="text-2xl font-black uppercase">SHEVA<span className="text-primary">OS</span></div>}
        </div>
        <div className="flex-1 px-6 flex flex-col justify-center items-center text-center space-y-4">
           <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
             <LayoutDashboard className="w-6 h-6" />
           </div>
           {!isCollapsed && (
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
               Profil non-identifié<br/>
               <span className="text-[10px] lowercase font-medium">(Vérifiez RLS/Roles)</span>
             </p>
           )}
        </div>
        <div className="mt-auto px-4"><Button variant="ghost" className="w-full text-red-500 font-bold" onClick={handleSignOut}><LogOut className="w-5 h-5 mr-3"/>Quitter</Button></div>
      </aside>
    );
  }

  return (
    <aside className={cn(
      "relative bg-white border-r border-gray-100 flex flex-col pt-8 pb-6 transition-all duration-500 ease-in-out shrink-0",
      isCollapsed ? "w-24" : "w-72"
    )}>
      {/* Bouton Toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 bg-white border border-gray-100 rounded-full p-1.5 shadow-md hover:text-primary transition-colors z-50 text-gray-400"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Logo */}
      <div className={cn(
        "px-6 mb-10 flex items-center gap-3",
        isCollapsed && "justify-center px-0"
      )}>
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-100">
          <span className="font-black text-xl">S</span>
        </div>
        {!isCollapsed && (
          <div className="text-2xl font-black tracking-tighter text-gray-900 uppercase">
            SHEVA<span className="text-primary">OS</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar",
        isCollapsed && "px-3"
      )}>
          {allowedItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.children?.some(child => child.href === pathname));
            const isSubmenuOpen = openSubmenu === item.label;

            return (
              <div key={item.label}>
                <button
                  onClick={() => item.children ? toggleSubmenu(item.label) : null}
                  className="w-full"
                >
                  {item.children ? (
                    <div
                      className={cn(
                        "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group mb-1 cursor-pointer",
                        isActive 
                          ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                          : "text-gray-500 hover:bg-gray-50 hover:text-primary"
                      )}
                    >
                      <Icon className={cn(
                        "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                        isActive ? "text-white" : "text-gray-400 group-hover:text-primary"
                      )} />
                      {!isCollapsed && (
                        <span className="font-bold text-sm flex-1 text-left">{item.label}</span>
                      )}
                      {!isCollapsed && (
                        <ChevronRight className={cn(
                          "w-4 h-4 transition-transform duration-300",
                          isSubmenuOpen && "rotate-90 text-white"
                        )} />
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group mb-1",
                        isActive 
                          ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                          : "text-gray-500 hover:bg-gray-50 hover:text-primary"
                      )}
                    >
                      <Icon className={cn(
                        "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                        isActive ? "text-white" : "text-gray-400 group-hover:text-primary"
                      )} />
                      {!isCollapsed && (
                        <span className="font-bold text-sm flex-1 text-left">{item.label}</span>
                      )}
                    </Link>
                  )}
                </button>

                {!isCollapsed && item.children && isSubmenuOpen && (
                  <div className="ml-12 mb-4 space-y-1 mt-1 border-l-2 border-primary/10 pl-4 animate-in slide-in-from-left-2 duration-300">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className={cn(
                          "block py-2 text-sm font-semibold transition-colors",
                          pathname === child.href ? "text-primary" : "text-gray-400 hover:text-primary"
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
      </nav>

      {/* Pied de page Sidebar */}
      <div className={cn(
        "mt-auto px-4 pt-4 border-t border-gray-50",
        isCollapsed && "px-2"
      )}>
        {!isCollapsed && (
          <div className="mb-6 px-4 py-3 bg-gray-50/50 rounded-2xl">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Session</div>
            <div className="text-xs font-bold text-gray-900 truncate">{role ? role.replace('_', ' ') : 'Agent'}</div>
          </div>
        )}

        <Button 
          variant="ghost" 
          onClick={handleSignOut}
          className={cn(
            "w-full justify-start rounded-2xl text-red-400 hover:bg-red-50 hover:text-red-500 font-bold transition-all h-12",
            isCollapsed ? "justify-center p-0" : "px-4 gap-4"
          )}
          title={isCollapsed ? "Déconnexion" : ""}
        >
          <LogOut className={isCollapsed ? "w-6 h-6" : "w-5 h-5"} />
          {!isCollapsed && <span>Quitter</span>}
        </Button>
      </div>
    </aside>
  );
}
