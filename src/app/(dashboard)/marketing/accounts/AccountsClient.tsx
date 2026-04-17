"use client";

import { useState } from "react";
import { 
  Building2, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  User, 
  DollarSign, 
  TrendingUp,
  MoreVertical,
  Briefcase,
  CheckCircle2,
  Loader2
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
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { upsertMarketingAccount, deleteMarketingAccount } from "@/features/marketing/actions/account-actions";

interface Props {
  initialAccounts: any[];
}

export function AccountsClient({ initialAccounts }: Props) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filtered = accounts.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      id: editingItem?.id,
      name: formData.get("name"),
      contact_person: formData.get("contact_person"),
      monthly_budget_cap: parseFloat(formData.get("monthly_budget_cap") as string || "0"),
      status: editingItem?.status || 'ACTIVE'
    };

    setIsSyncing(true);
    try {
      await upsertMarketingAccount(data);
      toast.success("Compte marketing enregistré");
      setIsDialogOpen(false);
      setEditingItem(null);
      // Refresh logic would ideally use router.refresh() or local state update
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la sauvegarde");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce compte client ? Cela n'effacera pas les campagnes liées mais rompra le lien.")) return;
    try {
      await deleteMarketingAccount(id);
      toast.success("Compte supprimé");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
               <Briefcase className="w-6 h-6" />
             </div>
             <Badge variant="outline" className="rounded-full border-primary/20 text-primary font-black text-[10px] uppercase tracking-widest px-3">
               Ads Manager
             </Badge>
           </div>
           <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Comptes <span className="text-primary">Clients</span></h1>
           <p className="text-gray-500 font-bold mt-1 uppercase text-xs tracking-widest">Gérez vos marques et budgets publicitaires centralisés</p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
           <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                 placeholder="Rechercher une entreprise..." 
                 className="pl-12 h-14 rounded-2xl border-gray-100 bg-white shadow-sm font-bold"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           
           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingItem(null)} className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-black font-black gap-2 shadow-lg shadow-orange-100 transition-all active:scale-95">
                  <Plus className="w-5 h-5" /> NOUVEAU CLIENT
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-10">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black uppercase tracking-tight">
                    {editingItem ? "Modifier" : "Ajouter"} un <span className="text-primary">Client</span>
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSave} className="space-y-6 pt-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Nom de l'entreprise</label>
                    <Input name="name" defaultValue={editingItem?.name} required placeholder="Ex: Boutique Alpha" className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Personne de contact</label>
                    <Input name="contact_person" defaultValue={editingItem?.contact_person} placeholder="Nom du responsable" className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Budget Mensuel Max (F)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input name="monthly_budget_cap" type="number" defaultValue={editingItem?.monthly_budget_cap} placeholder="0" className="pl-12 h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold text-emerald-600" />
                    </div>
                  </div>
                  <DialogFooter className="pt-6">
                    <Button type="submit" disabled={isSyncing} className="w-full h-14 rounded-2xl bg-gray-900 text-white font-black uppercase tracking-widest hover:bg-black gap-2 transition-all">
                      {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                      ENREGISTRER LE COMPTE
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
           </Dialog>
        </div>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((account) => (
          <Card key={account.id} className="group relative overflow-hidden rounded-[2.5rem] border-gray-100 bg-white p-8 transition-all hover:shadow-2xl hover:shadow-orange-100/50 hover:-translate-y-1">
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:border-primary/20 group-hover:text-primary transition-all">
                <Building2 className="w-8 h-8" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-50">
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-2xl p-2">
                  <DropdownMenuItem 
                    className="rounded-xl p-3 cursor-pointer"
                    onClick={() => {
                        setEditingItem(account);
                        setIsDialogOpen(true);
                    }}
                  >
                    <Edit2 className="w-4 h-4 mr-2" /> Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="rounded-xl p-3 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
                    onClick={() => handleDelete(account.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight line-clamp-1">{account.name}</h3>
              <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                <User className="w-3 h-3" />
                {account.contact_person || "Aucun contact"}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-3xl">
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Budget Max</div>
                <div className="text-sm font-black text-emerald-600">
                  {Number(account.monthly_budget_cap).toLocaleString()} F
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-3xl">
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Statut</div>
                <Badge className={`rounded-full text-[9px] font-black uppercase ${
                    account.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {account.status}
                </Badge>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-tight">
               <span>Créé le {new Date(account.created_at).toLocaleDateString()}</span>
               {account.account_manager?.full_name && (
                 <div className="flex items-center gap-1 text-primary">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{account.account_manager.full_name}</span>
                 </div>
               )}
            </div>
            
            {/* Background Accent */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
              <Building2 className="w-10 h-10" />
            </div>
            <div>
              <p className="text-lg font-black text-gray-900 uppercase tracking-tight">Aucun compte trouvé</p>
              <p className="text-gray-400 font-medium">Commencez par ajouter votre premier client marketing.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
