"use client";

import { useState } from "react";
import { 
  Wallet, 
  ArrowLeftRight, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Smartphone, 
  CreditCard, 
  Banknote,
  Building2,
  Clock,
  ArrowRight,
  MoreVertical,
  AlertCircle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Props {
  initialAccounts: any[];
  initialTransfers: any[];
}

export function AccountsClient({ initialAccounts, initialTransfers }: Props) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [transfers, setTransfers] = useState(initialTransfers);

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'OM': return <Smartphone className="w-5 h-5" />;
      case 'WAVE': return <Smartphone className="w-5 h-5" />;
      case 'CASH': return <Banknote className="w-5 h-5" />;
      case 'BANC': return <Building2 className="w-5 h-5" />;
      default: return <Wallet className="w-5 h-5" />;
    }
  };

  const getAccountColor = (type: string) => {
    switch (type) {
      case 'OM': return 'bg-orange-500 text-white';
      case 'WAVE': return 'bg-blue-400 text-white';
      case 'CASH': return 'bg-emerald-500 text-white';
      case 'BANC': return 'bg-indigo-900 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const totalLiquidity = accounts.reduce((acc, curr) => acc + (curr.balance || 0), 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/50">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[2rem] bg-gray-900 text-white flex items-center justify-center shadow-2xl shadow-gray-200">
            <Building2 className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Multi-Compte <span className="text-indigo-600">Finance</span></h1>
            <p className="text-gray-500 font-bold mt-1 uppercase text-xs tracking-widest">Gestion de la Trésorerie & Transferts Internes</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="px-8 py-5 bg-indigo-50 rounded-[2rem] text-right border border-indigo-100">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Liquidité Totale</p>
            <p className="text-2xl font-black text-indigo-600">
              {totalLiquidity.toLocaleString('fr-FR')} <span className="text-sm">F</span>
            </p>
          </div>
          <Button className="h-16 px-8 rounded-[2rem] bg-gray-900 hover:bg-black shadow-xl shadow-gray-200 font-black gap-3 text-lg">
            <Plus className="w-6 h-6" /> NOUVEAU COMPTE
          </Button>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {accounts.map((account) => (
          <Card key={account.id} className="p-8 rounded-[3rem] border-2 border-transparent hover:border-indigo-100 bg-white transition-all group relative overflow-hidden h-full flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110", getAccountColor(account.type))}>
                  {getAccountIcon(account.type)}
                </div>
                <Badge variant="outline" className="rounded-full border-gray-100 font-bold uppercase text-[9px] tracking-widest px-3 py-1">
                  {account.type}
                </Badge>
              </div>
              
              <div>
                <h3 className="text-lg font-black text-gray-900 truncate uppercase">{account.name}</h3>
                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-tighter">N° {account.account_number || "---"}</p>
              </div>
            </div>

            <div className="mt-10">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Solde Actuel</p>
              <div className="flex items-end gap-2 text-2xl font-black text-gray-900">
                {account.balance.toLocaleString('fr-FR')}
                <span className="text-sm text-gray-400 font-bold mb-1 uppercase tracking-widest">FCFA</span>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -right-6 w-24 h-24 opacity-5 pointer-events-none transition-all group-hover:opacity-10 group-hover:scale-125">
               {getAccountIcon(account.type)}
            </div>
          </Card>
        ))}

        {accounts.length === 0 && (
           <div className="col-span-full py-12 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-400 gap-3">
             <AlertCircle className="w-10 h-10 opacity-20" />
             <p className="font-bold uppercase tracking-widest text-sm">Aucun compte configuré</p>
           </div>
        )}
      </div>

      {/* Main Content: Transfers & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left: Recent Transfers */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-6">
            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Mouvements de Fonds</h2>
            <Button variant="ghost" className="text-indigo-600 font-black text-xs uppercase tracking-widest">Voir Tout</Button>
          </div>

          <div className="space-y-4">
            {transfers.map((transfer) => (
              <Card key={transfer.id} className="p-6 rounded-[2.5rem] border-gray-50 bg-white hover:border-gray-100 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                     <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                        <ArrowLeftRight className="w-6 h-6" />
                     </div>
                     <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-gray-900 uppercase">{transfer.from_account?.name}</span>
                          <ArrowRight className="w-3 h-3 text-gray-300" />
                          <span className="text-sm font-black text-gray-900 uppercase">{transfer.to_account?.name}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {format(new Date(transfer.created_at), "eeee dd MMMM", { locale: fr })}
                          </span>
                          <Badge variant="outline" className="text-[8px] font-black uppercase text-emerald-500 border-emerald-100 bg-emerald-50 px-2 leading-none h-4">
                            {transfer.status}
                          </Badge>
                        </div>
                     </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-black text-gray-900">
                      {transfer.amount.toLocaleString('fr-FR')} <span className="text-[10px] text-gray-400 tracking-widest">F</span>
                    </div>
                    <p className="text-[10px] font-medium text-gray-400 italic truncate max-w-[200px]">"{transfer.description}"</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right: Transfer Action */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase px-6">Effectuer un Transfert</h2>
          <Card className="p-10 rounded-[3rem] bg-gray-900 text-white relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 p-10 opacity-10">
                <ArrowLeftRight className="w-32 h-32" />
             </div>

             <div className="space-y-8 relative z-10">
                <div className="space-y-2">
                   <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Compte Source</p>
                   <div className="h-14 bg-gray-800 rounded-2xl border border-gray-700 flex items-center px-4 text-sm font-bold text-gray-400 cursor-pointer hover:border-indigo-500 transition-all">
                      Sélectionner un compte
                   </div>
                </div>

                <div className="space-y-2">
                   <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Compte Destination</p>
                   <div className="h-14 bg-gray-800 rounded-2xl border border-gray-700 flex items-center px-4 text-sm font-bold text-gray-400 cursor-pointer hover:border-indigo-500 transition-all">
                      Sélectionner un compte
                   </div>
                </div>

                <div className="space-y-2">
                   <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Montant à transférer</p>
                   <Input 
                    type="number" 
                    placeholder="0" 
                    className="h-14 bg-transparent border-t-0 border-x-0 border-b-2 border-indigo-500 rounded-none text-4xl font-black focus-visible:ring-0 placeholder:text-gray-700"
                   />
                </div>

                <Button className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-900/20 transform hover:scale-[1.02] transition-all">
                   VALIDER LE TRANSFERT
                </Button>
             </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
