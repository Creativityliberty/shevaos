"use client";

import { useState, useEffect } from "react";
import { 
  Zap, 
  Plus, 
  Trash2, 
  Settings2, 
  Calendar, 
  DollarSign, 
  Loader2,
  RefreshCcw,
  CheckCircle2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { 
  getExpenseTemplates, 
  createExpenseTemplate, 
  deleteExpenseTemplate,
  runTemplateGeneration
} from "@/features/finance/actions/expense-template-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ExpenseTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category: "divers",
    day_of_period: "1"
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const data = await getExpenseTemplates();
      setTemplates(data);
    } catch (err: any) {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await createExpenseTemplate({
        ...formData,
        category: formData.category as any,
        amount: parseFloat(formData.amount),
        day_of_period: parseInt(formData.day_of_period)
      });
      toast.success("Modèle ajouté");
      setIsAddOpen(false);
      setFormData({ name: "", amount: "", category: "divers", day_of_period: "1" });
      fetchTemplates();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce modèle ?")) return;
    try {
      await deleteExpenseTemplate(id);
      toast.success("Modèle supprimé");
      fetchTemplates();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await runTemplateGeneration();
      toast.success(`${result.count} dépenses générées pour ce mois !`, {
        icon: <CheckCircle2 className="text-emerald-500" />
      });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <Settings2 className="w-5 h-5 text-gray-400" />
          <h3 className="font-black text-gray-900 uppercase text-sm tracking-tight">Modèles Récurrents</h3>
        </div>
        <div className="flex gap-2">
           <Button 
             variant="outline" 
             onClick={handleGenerate} 
             disabled={isGenerating || templates.length === 0}
             className="h-9 px-4 rounded-xl border-indigo-100 bg-indigo-50/30 text-indigo-600 font-bold text-xs gap-2 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
           >
             {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
             GÉNÉRER CE MOIS ({templates.length})
           </Button>

           <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-9 rounded-xl font-bold gap-2">
                <Plus className="w-4 h-4" /> NOUVEAU MODÈLE
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] p-10 max-w-md border-none">
              <DialogHeader>
                 <DialogTitle className="text-2xl font-black uppercase">Frais <span className="text-primary">Récurrent</span></DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-6 pt-6">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Nom de la dépense</label>
                    <Input 
                      placeholder="Ex: Loyer Mensuel, Fibre..." 
                      className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold px-6"
                      value={formData.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Montant Fixe</label>
                        <Input 
                          type="number"
                          placeholder="0" 
                          className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-black text-primary px-6"
                          value={formData.amount}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, amount: e.target.value})}
                          required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Jour du mois</label>
                        <Input 
                          type="number"
                          min="1"
                          max="31"
                          placeholder="1" 
                          className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold px-6 text-center"
                          value={formData.day_of_period}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, day_of_period: e.target.value})}
                          required
                        />
                    </div>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Catégorie</label>
                    <Select value={formData.category} onValueChange={(val: string | null) => setFormData({...formData, category: val ?? ""})}>
                       <SelectTrigger className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 font-bold px-6">
                          <SelectValue placeholder="Choisir..." />
                       </SelectTrigger>
                       <SelectContent className="rounded-2xl">
                          <SelectItem value="loyer_bureau" className="font-bold">Loyer & Charges</SelectItem>
                          <SelectItem value="rh_salaire" className="font-bold">Salaires</SelectItem>
                          <SelectItem value="marketing_ads" className="font-bold">Marketing</SelectItem>
                          <SelectItem value="divers" className="font-bold">Autres Charges fixes</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
                 <Button type="submit" disabled={isSaving} className="w-full h-16 rounded-2xl bg-primary text-black font-black text-lg shadow-xl shadow-orange-100">
                    {isSaving ? <Loader2 className="animate-spin" /> : "AJOUTER LE MODÈLE"}
                 </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((tpl) => (
          <Card key={tpl.id} className="p-4 rounded-[1.5rem] border-gray-50 bg-white hover:border-indigo-100 transition-all group flex items-center justify-between overflow-hidden relative">
            <div className="flex items-center gap-4 relative z-10">
               <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                  <Calendar className="w-5 h-5" />
               </div>
               <div>
                  <h4 className="font-black text-gray-900 text-sm uppercase leading-none">{tpl.name}</h4>
                  <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">
                    Chaque mois le {tpl.day_of_period} • {tpl.amount.toLocaleString()} F
                  </p>
               </div>
            </div>
            <button 
              onClick={() => handleDelete(tpl.id)}
              className="p-2 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </Card>
        ))}
        {templates.length === 0 && (
          <div className="col-span-2 py-10 text-center bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-100">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Aucun modèle récurrent défini</p>
          </div>
        )}
      </div>
    </div>
  );
}
