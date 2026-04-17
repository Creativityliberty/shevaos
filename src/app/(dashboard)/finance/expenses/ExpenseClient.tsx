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
  ArrowDownCircle,
  PlusCircle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
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
import { createExpense } from "@/features/finance/actions/expense-actions";
import { createExpenseCategory } from "@/features/finance/actions/category-actions";
import { toast } from "sonner";

interface Props {
  initialExpenses: any[];
  initialCategories: any[];
}

import { ExpenseTemplates } from "./ExpenseTemplates";

export function ExpenseClient({ initialExpenses, initialCategories }: Props) {
  const [activeView, setActiveView] = useState<"flux" | "modeles">("flux");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isNewCatOpen, setIsNewCatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  
  const [categories, setCategories] = useState(initialCategories);
  const [newCatName, setNewCatName] = useState("");

  const [formData, setFormData] = useState({
    amount: "",
    category: "",
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
        category: formData.category as any,
        description: formData.description,
        expense_date: formData.expense_date
      });
      toast.success("Dépense enregistrée");
      setIsAddOpen(false);
      window.location.reload(); // Simple way to refresh for now
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatName) return;
    setIsCategoryLoading(true);
    try {
      const newCat = await createExpenseCategory(newCatName);
      setCategories([...categories, newCat]);
      setFormData({...formData, category: newCat.name});
      setIsNewCatOpen(false);
      setNewCatName("");
      toast.success("Nouvelle catégorie créée");
    } catch (err: any) {
      toast.error("Erreur creation catégorie");
    } finally {
      setIsCategoryLoading(false);
    }
  };

  const totalMonthly = initialExpenses.reduce((acc: number, curr: any) => acc + parseFloat(curr.amount), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/50 transition-all">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[2rem] bg-red-900 text-white flex items-center justify-center shadow-2xl shadow-red-100">
            <TrendingDown className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 uppercase">Flux de <span className="text-red-500">Dépenses</span></h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">Pilotage des sorties de trésorerie</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="bg-gray-50 p-1.5 rounded-2xl flex border border-gray-100 shadow-inner">
             <button 
               onClick={() => setActiveView("flux")}
               className={cn(
                 "px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                 activeView === "flux" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
               )}
             >
               Journalier
             </button>
             <button 
               onClick={() => setActiveView("modeles")}
               className={cn(
                 "px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                 activeView === "modeles" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
               )}
             >
               Modèles Fixes
             </button>
           </div>
           
           <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
             <DialogTrigger asChild>
               <Button className="h-14 px-8 rounded-2xl bg-red-500 hover:bg-black text-white font-black shadow-xl shadow-red-100 transition-all active:scale-95 flex gap-3">
                 <Plus className="w-5 h-5" /> NOUVELLE DÉPENSE
               </Button>
             </DialogTrigger>

             <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-8">
               <DialogHeader>
                 <DialogTitle className="text-2xl font-black uppercase">Enregistrer une <span className="text-red-500">Dépense</span></DialogTitle>
               </DialogHeader>
               <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Montant (FCFA)</label>
                   <Input 
                     type="number" 
                     placeholder="0"
                     className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 text-2xl font-black focus:ring-red-500 text-red-500"
                     value={formData.amount}
                     onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, amount: e.target.value})}
                     required
                   />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Catégorie</label>
                     <div className="flex gap-2">
                        <Select 
                          value={formData.category} 
                          onValueChange={(val: string | null) => setFormData({...formData, category: val ?? ""})}
                          required
                        >
                          <SelectTrigger className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold">
                            <SelectValue placeholder="Choisir..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            {categories.map((cat: any) => (
                              <SelectItem key={cat.id} value={cat.name} className="font-bold py-3">{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-14 w-14 rounded-2xl bg-gray-50 text-gray-400 hover:text-primary hover:bg-gray-100"
                          onClick={() => setIsNewCatOpen(true)}
                        >
                           <PlusCircle className="w-6 h-6" />
                        </Button>
                     </div>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Date</label>
                     <Input 
                       type="date" 
                       className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold"
                       value={formData.expense_date}
                       onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, expense_date: e.target.value})}
                       required
                     />
                   </div>
                 </div>

                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Description / Libellé</label>
                   <Input 
                     placeholder="Ex: Facture CIE, Salaire Lionel..."
                     className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold"
                     value={formData.description}
                     onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, description: e.target.value})}
                   />
                 </div>

                 <Button 
                   type="submit" 
                   className="w-full h-16 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black text-lg transition-all shadow-xl shadow-red-100"
                   disabled={isLoading}
                 >
                   {isLoading ? <Loader2 className="animate-spin" /> : "CONFIRMER LA SORTIE D'ARGENT"}
                 </Button>
               </form>
             </DialogContent>
           </Dialog>
        </div>
      </div>
       {activeView === "modeles" ? (
         <div className="animate-in slide-in-from-right-4 duration-500">
           <ExpenseTemplates />
         </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
          <div className="flex flex-wrap items-center gap-3 px-8 py-4 bg-gray-50/50 rounded-[2rem] border border-gray-100/50">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest mr-2">Analyse par Nature :</span>
            {categories.map((cat: any) => (
              <Badge key={cat.id} className={cn("rounded-xl border-none font-black text-[10px] uppercase tracking-widest px-5 py-2.5 shadow-sm transition-all hover:scale-105", cat.color || "bg-white text-gray-600")}>
                {cat.name}
              </Badge>
            ))}
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-xl border-2 border-dashed border-gray-200 text-gray-400 h-10 px-4 gap-2 hover:bg-white hover:text-red-500 hover:border-red-100 font-black transition-all"
              onClick={() => setIsNewCatOpen(true)}
            >
              <PlusCircle className="w-4 h-4" /> NOUVELLE CATÉGORIE
            </Button>
          </div>

          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-2xl font-black uppercase flex items-center gap-3">
                 Journal des Dépenses
                 <Badge variant="outline" className="rounded-xl font-black bg-gray-50 border-gray-100 h-8 px-4">
                   {initialExpenses.length} flux
                 </Badge>
              </h2>
              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Mois</p>
                  <p className="text-xl font-black text-red-500 tabular-nums">-{totalMonthly.toLocaleString()} F</p>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    placeholder="Filtrer..." 
                    className="pl-12 h-12 rounded-2xl border-gray-100 bg-gray-50/50 shadow-inner"
                  />
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-10 py-6 text-[10px] font-black uppercase text-gray-400 tracking-widest underline decoration-gray-200">Date</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase text-gray-400 tracking-widest underline decoration-gray-200">Bénéficiaire / Description</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase text-gray-400 tracking-widest underline decoration-gray-200">Nature</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right underline decoration-gray-200">Montant Décaissé</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 pb-10">
                  {initialExpenses.map((expense: any) => {
                    const categoryInfo = categories.find((c: any) => c.name === expense.category) || { name: expense.category, color: "bg-gray-100 text-gray-700" };
                    return (
                      <tr key={expense.id} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="px-10 py-8">
                          <div className="flex flex-col">
                            <span className="font-black text-gray-900 text-base">{format(new Date(expense.expense_date), "dd MMM yyyy", { locale: fr })}</span>
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Enregistré à {format(new Date(expense.created_at), "HH:mm")}</span>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex flex-col">
                            <p className="font-black text-gray-800 uppercase text-sm">{expense.description || "-"}</p>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter flex items-center gap-1.5 mt-1">
                               <User className="w-3 h-3" /> par {expense.operator?.full_name || "Système"}
                            </span>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                           <Badge className={cn("rounded-lg border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1", categoryInfo.color)}>
                             {categoryInfo.name}
                           </Badge>
                        </td>
                        <td className="px-10 py-8 text-right font-black text-red-500 text-xl tabular-nums">
                          {parseFloat(expense.amount).toLocaleString()} <span className="text-xs text-gray-300">F</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
