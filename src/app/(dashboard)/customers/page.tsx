import { Plus, Search, User, Phone, MapPin, Star, AlertOctagon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-blue-50 text-blue-600 border-blue-100",
  VIP: "bg-primary/10 text-primary border-primary/20",
  BLACKLISTED: "bg-red-50 text-red-600 border-red-100",
  INACTIVE: "bg-gray-100 text-gray-500 border-gray-200",
};

export default async function CustomersPage() {
  const supabase = await createClient();

  const { data: customers, error } = await supabase
    .from("customers")
    .select(`
      *,
      zones (name)
    `)
    .order("full_name");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
            Gestion des <span className="text-primary">Clients</span>
          </h1>
          <p className="text-gray-500 font-medium">Bâtissez et fidélisez votre base de données clients.</p>
        </div>
        <Link href="/customers/new">
          <Button className="rounded-2xl font-bold shadow-lg shadow-orange-100 gap-2 h-11 px-6">
            <Plus className="w-5 h-5" />
            Nouveau Client
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input 
          placeholder="Rechercher par nom, téléphone, ville..." 
          className="pl-10 rounded-2xl border-gray-100 h-11 focus:ring-primary focus:border-primary"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent border-gray-100">
              <TableHead className="py-4 pl-8 uppercase text-[10px] font-black tracking-widest text-gray-400">Client</TableHead>
              <TableHead className="py-4 uppercase text-[10px] font-black tracking-widest text-gray-400">Contact</TableHead>
              <TableHead className="py-4 uppercase text-[10px] font-black tracking-widest text-gray-400">Localisation</TableHead>
              <TableHead className="py-4 uppercase text-[10px] font-black tracking-widest text-gray-400 text-center">Statut</TableHead>
              <TableHead className="py-4 uppercase text-[10px] font-black tracking-widest text-gray-400 text-center">Commandes</TableHead>
              <TableHead className="py-4 pr-8 uppercase text-[10px] font-black tracking-widest text-gray-400 text-right">Inscrit le</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {error && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-red-500 font-medium">
                   Une erreur est survenue lors du chargement des clients.
                </TableCell>
              </TableRow>
            )}
            {!customers || customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-24">
                   <div className="flex flex-col items-center gap-2">
                    <User className="w-12 h-12 text-gray-100" />
                    <p className="font-black text-gray-900 text-xl tracking-tight">Aucun client trouvé</p>
                    <p className="text-gray-400 font-medium whitespace-pre-wrap">Votre base de données est vide pour le moment.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer: any) => (
                <TableRow key={customer.id} className="hover:bg-orange-50/10 border-gray-50 transition-colors">
                  <TableCell className="py-5 pl-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-primary font-black uppercase shadow-inner border border-white">
                        {customer.full_name.charAt(0)}
                      </div>
                      <div className="font-black text-gray-900 leading-tight">
                        {customer.full_name}
                        {customer.status === 'VIP' && <Star className="inline w-3 h-3 text-primary ml-1 fill-primary" />}
                        {customer.status === 'BLACKLISTED' && <AlertOctagon className="inline w-3 h-3 text-red-500 ml-1" />}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                        <Phone className="w-3 h-3 text-gray-300" /> {customer.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                      <MapPin className="w-3 h-3 text-gray-300" /> {customer.city || "N/A"}
                      <Badge variant="outline" className="rounded-lg h-5 px-1.5 text-[9px] border-gray-100 bg-gray-50 text-gray-400 font-black tracking-tighter">
                        {customer.zones?.name || "Sans zone"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 text-center">
                    <Badge className={`rounded-xl px-2.5 py-0.5 border font-black text-[10px] ${STATUS_COLORS[customer.status]}`}>
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-5 text-center">
                     <span className="font-black text-gray-900 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                        {customer.total_orders || 0}
                     </span>
                  </TableCell>
                  <TableCell className="py-5 pr-8 text-right text-gray-400 font-bold text-[11px] uppercase whitespace-nowrap">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
