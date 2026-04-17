"use client";

import { useState } from "react";
import { 
  Users, 
  ShieldCheck, 
  UserX, 
  UserCheck, 
  Search, 
  MoreVertical, 
  Mail, 
  Briefcase,
  ExternalLink
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { toggleUserStatus, updateUserRole } from "@/features/users/actions/user-actions";
import { UserRole } from "@/core/auth/roles";

interface Props {
  initialUsers: any[];
}

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  'ceo': { label: 'CEO / Dirigeant', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  'manager': { label: 'Manager General', color: 'text-blue-600', bg: 'bg-blue-50' },
  'sav_agent': { label: 'Agent SAV', color: 'text-orange-600', bg: 'bg-orange-50' },
  'sav_manager': { label: 'Manager SAV', color: 'text-orange-700', bg: 'bg-orange-100' },
  'dispatcher': { label: 'Dispatch / OPS', color: 'text-purple-600', bg: 'bg-purple-50' },
  'finance': { label: 'Trésorier', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  'stock_manager': { label: 'Gestion Stock', color: 'text-cyan-600', bg: 'bg-cyan-50' },
  'driver': { label: 'Livreur Terrain', color: 'text-gray-600', bg: 'bg-gray-100' },
};

export function UserListClient({ initialUsers }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState(initialUsers);

  const onToggleStatus = async (user: any) => {
    try {
      await toggleUserStatus(user.id, user.is_active);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !user.is_active } : u));
      toast.success(`Utilisateur ${!user.is_active ? 'activé' : 'désactivé'}`);
    } catch (err) {
      toast.error("Échec de l'opération");
    }
  };

  const onRoleChange = async (userId: string, role: string) => {
    try {
      await updateUserRole(userId, role as UserRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
      toast.success("Rôle mis à jour");
    } catch (err) {
      toast.error("Échec de la mise à jour");
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
              <ShieldCheck className="w-8 h-8" />
           </div>
           <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Utilisateurs <span className="text-indigo-600">Système</span></h1>
              <p className="text-gray-500 font-medium">Contrôle des accès et permissions de votre équipe.</p>
           </div>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Rechercher un membre..." 
            className="pl-12 h-12 rounded-2xl border-gray-100 bg-gray-50/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid of Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {filteredUsers.map((user) => {
          const config = ROLE_CONFIG[user.role] || { label: user.role, color: 'text-gray-500', bg: 'bg-gray-50' };
          
          return (
            <Card key={user.id} className={cn(
              "p-8 rounded-[3rem] border-2 transition-all relative overflow-hidden group",
              user.is_active ? "bg-white border-transparent hover:border-indigo-100" : "bg-gray-50/50 border-dashed border-gray-200 opacity-60"
            )}>
              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-start">
                   <div className="flex gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center font-black text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                        {user.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                         <h3 className="text-lg font-black text-gray-900 tracking-tight leading-tight uppercase truncate max-w-[150px]">{user.full_name}</h3>
                         <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 mt-1">
                            <Mail className="w-3 h-3" /> {user.email}
                         </div>
                      </div>
                   </div>
                   
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-gray-300 hover:text-gray-900">
                           <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="rounded-xl p-2 border-gray-100 shadow-xl" align="end">
                         <DropdownMenuItem onClick={() => onToggleStatus(user)} className="rounded-lg font-bold gap-2 cursor-pointer">
                            {user.is_active ? <><UserX className="w-4 h-4 text-red-500" /> Désactiver</> : <><UserCheck className="w-4 h-4 text-emerald-500" /> Réactiver</>}
                         </DropdownMenuItem>
                         <DropdownMenuItem className="rounded-lg font-bold gap-2 cursor-pointer">
                            <Briefcase className="w-4 h-4" /> Modifier Contrat
                         </DropdownMenuItem>
                      </DropdownMenuContent>
                   </DropdownMenu>
                </div>

                <div className="space-y-4">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none">Rôle Actuel</p>
                      <Select value={user.role} onValueChange={(val: any) => onRoleChange(user.id, val)}>
                         <SelectTrigger className={cn("rounded-2xl h-12 border-none font-black text-xs uppercase px-4 shadow-none focus:ring-0", config.bg, config.color)}>
                            <SelectValue />
                         </SelectTrigger>
                         <SelectContent className="rounded-2xl border-gray-100 font-bold">
                            {Object.entries(ROLE_CONFIG).map(([val, info]) => (
                               <SelectItem key={val} value={val} className="focus:bg-indigo-50">{info.label}</SelectItem>
                            ))}
                         </SelectContent>
                      </Select>
                   </div>
                   
                   <div className="flex items-center justify-between pt-2">
                       <Badge className={cn(
                          "rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border-none",
                          user.is_active ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                       )}>
                          {user.is_active ? "ACTIF" : "DÉSACTIVÉ"}
                       </Badge>
                       <span className="text-[10px] font-bold text-gray-300">ID: {user.id.slice(0, 8)}</span>
                   </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 w-24 h-24 opacity-5 group-hover:scale-125 transition-transform pointer-events-none">
                 <ShieldCheck className="w-full h-full" />
              </div>
            </Card>
          );
        })}

        {filteredUsers.length === 0 && (
           <div className="col-span-full py-24 text-center space-y-4 bg-gray-50 rounded-[4rem] border-2 border-dashed border-gray-100">
              <Users className="w-16 h-16 text-gray-200 mx-auto" />
              <p className="font-black text-gray-900 text-xl tracking-tight">Aucun utilisateur trouvé</p>
           </div>
        )}
      </div>
    </div>
  );
}
