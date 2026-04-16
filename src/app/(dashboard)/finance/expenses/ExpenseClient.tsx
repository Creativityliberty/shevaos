"use client";

import { useState } from "react";
import { 
  TrendingDown, 
  Plus, 
  Receipt, 
  Calendar, 
  Tag, 
  User, 
  Camera,
  Search,
  Filter,
  ArrowDownCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { createExpense, ExpenseCategory } from "@/features/finance/actions/expense-actions";
import { toast } from "sonner";

interface Props {
  initialExpenses: any[];
}

const CATEGORIES: Record<ExpenseCategory, { label: string, color: string }> = {
  marketing_ads: { label: "Marketing & Ads", color: "bg-blue-100 text-blue-700" },
  carburant: { label: "Carburant", color: "bg-orange-100 text-orange-700" },
  loyer_bureau: { label: "Loyer & Bureau", color: "bg-purple-100 text-purple-700" },
  rh_salaire: { label: "RH & Salaires", color: "bg-green-100 text-green-700" },
  stock_achat: { label: "Achats Stock", color: "bg-emerald-100 text-emerald-700" },
  logistique_transitaire: { label: "Logistique", color: "bg-indigo-100 text-indigo-700" },
  frais_bancaires: { label: "Frais Bancaires", color: "bg-slate-100 text-slate-700" },
  divers: { label: "Divers", color: "bg-gray-100 text-gray-700" }
};

export function ExpenseClient({ initialExpenses }: Props) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    amount: "",
    category: "" as ExpenseCategory,
    description: "",
    expense_date: format(new Date(), "yyyy-MM-dd")
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.category) return;

    setIsLoading(true);
    try {
      await createExpense({
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        expense_date: formData.expense_date
      });
      toast.success("Dépense enregistrée avec succès");
      setIsAddOpen(false);
      setFormData({
        amount: "",
        category: "" as ExpenseCategory,
        description: "",
        expense_date: format(new Date(), "yyyy-MM-dd")
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const totalMonthly = initialExpenses.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2 flex items-center gap-4">
            <span className="p-3 bg-red-50 rounded-2xl">
              <TrendingDown className="w-8 h-8 text-red-500" />
            </span>
            Gestion des <span className="text-red-500 underline decoration-red-100 underline-offset-8">Dépenses</span>
          </h1>
          <p className="text-gray-500 font-medium">Contrôlez vos sorties d'argent et optimisez votre profit net.</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-6">
             <div className="text-right">
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total ce mois</p>
               <p className="text-2xl font-black text-red-500">-{totalMonthly.toLocaleString()} F</p>
             </div>
             
             <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
               <DialogTrigger 
                 render={
                   <Button className="h-14 px-8 rounded-2xl bg-black hover:bg-gray-800 text-white font-bold shadow-xl shadow-gray-200 transition-all hover:scale-[1.03] active:scale-95 flex gap-3">
                     <Plus className="w-5 h-5" />
                     Saisir une Dépense
                   </Button>
                 }
               />
               <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-none shadow-2xl">
                 <DialogHeader>
                   <DialogTitle className="text-2xl font-black">Nouvelle Dépense</DialogTitle>
                 </DialogHeader>
                 <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                   <div className="space-y-2">
                     <label className="text-xs font-black uppercase text-gray-400 tracking-tighter">Montant (FCFA)</label>
                     <div className="relative">
                       <Input 
                         type="number" 
                         placeholder="0"
                         className="h-14 rounded-xl border-gray-100 bg-gray-50/50 text-xl font-black focus:ring-red-500"
                         value={formData.amount}
                         onChange={(e) => setFormData({...formData, amount: e.target.value})}
                         required
                       />
                       <ArrowDownCircle className="absolute right-4 top-4 text-red-500 w-6 h-6" />
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <label className="text-xs font-black uppercase text-gray-400 tracking-tighter text-left block w-full">Catégorie</label>
                       <Select 
                         value={formData.category} 
                         onValueChange={(val: any) => setFormData({...formData, category: val as ExpenseCategory})}
                         required
                       >
                         <SelectTrigger className="h-14 rounded-xl border-gray-100 bg-gray-50/50 font-bold">
                           <SelectValue placeholder="Choisir..." />
                         </SelectTrigger>
                         <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                           {Object.entries(CATEGORIES).map(([key, { label }]) => (
                             <SelectItem key={key} value={key} className="font-bold py-3">{label}</SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </div>
                     <div className="space-y-2 text-left block w-full">
                       <label className="text-xs font-black uppercase text-gray-400 tracking-tighter">Date</label>
                       <Input 
                         type="date" 
                         className="h-14 rounded-xl border-gray-100 bg-gray-50/50 font-bold"
                         value={formData.expense_date}
                         onChange={(e) => setFormData({...formData, expense_date: e.target.value})}
                         required
                       />
                     </div>
                   </div>

                   <div className="space-y-2">
                     <label className="text-xs font-black uppercase text-gray-400 tracking-tighter text-left block w-full">Description / Libellé</label>
                     <Input 
                       placeholder="Ex: Facture CIE, Salaire Lionel..."
                       className="h-14 rounded-xl border-gray-100 bg-gray-50/50 font-medium"
                       value={formData.description}
                       onChange={(e) => setFormData({...formData, description: e.target.value})}
                     />
                   </div>

                   <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <Camera className="w-5 h-5 text-gray-400" />
                       <span className="text-sm font-bold text-gray-500">Justificatif (reçu)</span>
                     </div>
                     <Button size="sm" variant="outline" type="button" className="rounded-xl font-bold bg-white h-10 border-gray-200">
                       Ajouter
                     </Button>
                   </div>

                   <Button 
                     type="submit" 
                     className="w-full h-14 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black text-lg transition-all"
                     disabled={isLoading}
                   >
                     {isLoading ? "Enregistrement..." : "Confirmer la Sortie"}
                   </Button>
                 </form>
               </DialogContent>
             </Dialog>
          </div>
        </div>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(CATEGORIES).slice(0, 4).map(([key, { label, color }]) => {
          const catTotal = initialExpenses
            .filter(e => e.category === key)
            .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
          
          return (
            <Card key={key} className="p-6 rounded-[2rem] border-none bg-white shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
              <div className="relative z-10">
                <Badge className={cn("mb-4 rounded-lg font-bold border-none", color)}>{label}</Badge>
                <p className="text-xl font-black text-gray-900">{catTotal.toLocaleString()} F</p>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <TrendingDown className="w-24 h-24 rotate-12 text-gray-900" />
              </div>
            </Card>
          )
        })}
      </div>

      {/* Main List */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-black flex items-center gap-3">
            Historique des Flux
            <Badge variant="outline" className="rounded-lg font-black bg-gray-50 border-gray-100">
              {initialExpenses.length} entrées
            </Badge>
          </h2>
          <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 h-12 w-full md:w-96">
            <Search className="w-5 h-5 text-gray-400" />
            <input 
              placeholder="Rechercher une dépense..." 
              className="bg-transparent border-none focus:ring-0 w-full text-sm font-medium"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Date</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Opérateur</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Désignation</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Catégorie</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {initialExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-gray-400 font-bold uppercase tracking-tighter italic">
                    Aucune dépense enregistrée sur cette période
                  </td>
                </tr>
              ) : (
                initialExpenses.map((expense) => (
                  <tr key={expense.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3 font-bold text-gray-900">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {format(new Date(expense.expense_date), "dd MMMM yyyy", { locale: fr })}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3 font-semibold text-gray-500">
                        <User className="w-4 h-4" />
                        {expense.operator?.full_name || "Système"}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-gray-800 line-clamp-1">{expense.description || "-"}</p>
                    </td>
                    <td className="px-8 py-6">
                      <Badge className={cn("rounded-lg border-none font-bold", CATEGORIES[expense.category as ExpenseCategory]?.color)}>
                        {CATEGORIES[expense.category as ExpenseCategory]?.label}
                      </Badge>
                    </td>
                    <td className="px-8 py-6 text-right font-black text-red-500 text-lg">
                      -{parseFloat(expense.amount).toLocaleString()} F
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Utility to merge classnames
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
