"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lock, ArrowDownRight, ArrowUpRight, Scale } from "lucide-react";

const TYPE_COLORS: Record<string, any> = {
  CASH_VERIFIED: { color: "text-emerald-500", bg: "bg-emerald-50", icon: ArrowDownRight, label: "Recette Validée" },
  EXPENSE: { color: "text-red-500", bg: "bg-red-50", icon: ArrowUpRight, label: "Dépense" },
  ADJUSTMENT: { color: "text-amber-500", bg: "bg-amber-50", icon: Scale, label: "Ajustement" },
  COUNTER_ENTRY: { color: "text-purple-500", bg: "bg-purple-50", icon: Scale, label: "Contre-écriture" },
};

export function LedgerClient({ entries }: { entries: any[] }) {
  if (!entries || entries.length === 0) {
     return (
        <Card className="p-16 border-dashed border-2 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-[3xl]">
          <Lock className="w-12 h-12 opacity-20 mb-4" />
          <p className="font-bold text-xl">Ledger Vierge</p>
          <p className="font-medium text-center text-sm max-w-sm mt-2">Aucun événement financier n'a encore été gravé dans la base.</p>
        </Card>
     );
  }

  return (
    <Card className="rounded-[2.5rem] border-gray-100 shadow-sm overflow-hidden bg-white">
      <div className="p-6 pb-2 border-b border-gray-50 flex items-center gap-3">
        <Lock className="w-4 h-4 text-primary" />
        <span className="text-xs font-black uppercase text-gray-400 tracking-widest">Journal Immuable Sécurisé</span>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent border-gray-100">
              <TableHead className="w-[180px] font-bold text-gray-400 py-4 pl-8 uppercase text-xs tracking-widest">Date / Heure</TableHead>
              <TableHead className="font-bold text-gray-400 py-4 uppercase text-xs tracking-widest">Nature</TableHead>
              <TableHead className="font-bold text-gray-400 py-4 uppercase text-xs tracking-widest">Description</TableHead>
              <TableHead className="font-bold text-gray-400 py-4 uppercase text-xs tracking-widest">Opérateur</TableHead>
              <TableHead className="font-bold text-gray-400 py-4 pr-8 uppercase text-xs tracking-widest text-right">Mouvement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => {
              const typeConfig = TYPE_COLORS[entry.type] || { color: "text-gray-500", bg: "bg-gray-100", icon: Lock, label: entry.type };
              const Icon = typeConfig.icon;
              const isPositive = Number(entry.amount) > 0;

              return (
                <TableRow key={entry.id} className="hover:bg-orange-50/10 border-gray-50 transition-colors">
                  <TableCell className="py-5 pl-8">
                    <div className="font-bold text-gray-800">{new Date(entry.created_at).toLocaleDateString()}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase">{new Date(entry.created_at).toLocaleTimeString()}</div>
                  </TableCell>
                  
                  <TableCell className="py-5">
                    <Badge variant="outline" className={`border-none rounded-lg font-bold flex items-center w-max gap-1.5 ${typeConfig.bg} ${typeConfig.color}`}>
                      <Icon className="w-3 h-3" />
                      {typeConfig.label}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="py-5">
                    <div className="font-bold text-sm text-gray-900 max-w-md truncate">{entry.description}</div>
                    {entry.reference_id && (
                      <div className="text-[10px] text-gray-400 font-medium font-mono mt-1 w-max">
                        Ref: {entry.reference_table}#{entry.reference_id.split('-')[0]}
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell className="py-5 font-bold text-gray-600 text-sm">
                    {entry.user_profiles?.full_name || 'Système'}
                  </TableCell>
                  
                  <TableCell className="py-5 pr-8 text-right font-black">
                    <span className={isPositive ? "text-emerald-500" : "text-gray-900"}>
                      {isPositive ? "+" : ""}{Number(entry.amount).toLocaleString()} F
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
