"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Megaphone, 
  Facebook, 
  Video, 
  SearchIcon, 
  MoreVertical,
  Calendar,
  CheckCircle2,
  Pause,
  Play,
  Loader2,
  BarChart3
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { upsertMarketingCampaign, deleteMarketingCampaign } from "@/features/marketing/actions/campaign-actions";

interface Props {
  initialCampaigns: any[];
  accounts: any[];
}

const PLATFORMS: Record<string, { icon: any, color: string }> = {
  'FB': { icon: Facebook, color: 'text-blue-600 bg-blue-50' },
  'TIKTOK': { icon: Video, color: 'text-black bg-gray-100' },
  'GOOGLE': { icon: SearchIcon, color: 'text-red-500 bg-red-50' },
  'AUTRE': { icon: Megaphone, color: 'text-primary bg-primary/10' }
};

export function CampaignsClient({ initialCampaigns, accounts }: Props) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filtered = campaigns.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.marketing_account?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      id: editingItem?.id,
      marketing_account_id: formData.get("marketing_account_id"),
      name: formData.get("name"),
      platform: formData.get("platform"),
      daily_budget: parseFloat(formData.get("daily_budget") as string || "0"),
      total_budget: parseFloat(formData.get("total_budget") as string || "0"),
      start_date: formData.get("start_date") || null,
      end_date: formData.get("end_date") || null,
      status: editingItem?.status || 'ACTIVE'
    };

    setIsSyncing(true);
    try {
      await upsertMarketingCampaign(data);
      toast.success("Campagne enregistrée");
      setIsDialogOpen(false);
      setEditingItem(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleToggleStatus = async (campaign: any) => {
    const newStatus = campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await upsertMarketingCampaign({ ...campaign, status: newStatus });
      toast.success(`Campagne ${newStatus === 'ACTIVE' ? 'activée' : 'mise en pause'}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette campagne ?")) return;
    try {
      await deleteMarketingCampaign(id);
      toast.success("Campagne supprimée");
      router.refresh();
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
               <Megaphone className="w-6 h-6" />
             </div>
             <Badge variant="outline" className="rounded-full border-primary/20 text-primary font-black text-[10px] uppercase tracking-widest px-3">
               Campaign Center
             </Badge>
           </div>
           <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Liste des <span className="text-primary">Campagnes</span></h1>
           <p className="text-gray-500 font-bold mt-1 uppercase text-xs tracking-widest">Gérez vos diffusions par plateforme et budgets</p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
           <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                 placeholder="Rechercher une campagne..." 
                 className="pl-12 h-14 rounded-2xl border-gray-100 bg-white shadow-sm font-bold"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           
           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger
                render={
                  <Button onClick={() => setEditingItem(null)} className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-black font-black gap-2 shadow-lg shadow-orange-100 transition-all active:scale-95 text-xs">
                    <Plus className="w-5 h-5" /> NOUVELLE CAMPAGNE
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-10">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black uppercase tracking-tight">
                    {editingItem ? "Modifier" : "Créer"} une <span className="text-primary">Campagne</span>
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSave} className="space-y-6 pt-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Client / Marque</label>
                      <Select name="marketing_account_id" defaultValue={editingItem?.marketing_account_id}>
                        <SelectTrigger className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold">
                          <SelectValue placeholder="Sélectionner un client" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          {accounts.map(acc => (
                            <SelectItem key={acc.id} value={acc.id} className="rounded-xl p-3">{acc.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Nom de la Campagne</label>
                      <Input name="name" defaultValue={editingItem?.name} required placeholder="Ex: Promo Ramadan 2024" className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Plateforme</label>
                      <Select name="platform" defaultValue={editingItem?.platform || 'FB'}>
                        <SelectTrigger className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          <SelectItem value="FB" className="rounded-xl">Facebook / Instagram</SelectItem>
                          <SelectItem value="TIKTOK" className="rounded-xl">TikTok Ads</SelectItem>
                          <SelectItem value="GOOGLE" className="rounded-xl">Google / YouTube</SelectItem>
                          <SelectItem value="SNAPCHAT" className="rounded-xl">Snapchat</SelectItem>
                          <SelectItem value="AUTRE" className="rounded-xl">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Budget Quotidien (F)</label>
                      <Input name="daily_budget" type="number" defaultValue={editingItem?.daily_budget} placeholder="0" className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold text-emerald-600" />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Budget Total Alloué (Optional)</label>
                      <Input name="total_budget" type="number" defaultValue={editingItem?.total_budget} placeholder="Illimité" className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold text-orange-600" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Date début</label>
                      <Input name="start_date" type="date" defaultValue={editingItem?.start_date?.split('T')[0]} className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Date fin</label>
                      <Input name="end_date" type="date" defaultValue={editingItem?.end_date?.split('T')[0]} className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold" />
                    </div>
                  </div>

                  <DialogFooter className="pt-6">
                    <Button type="submit" disabled={isSyncing} className="w-full h-14 rounded-2xl bg-gray-900 text-white font-black uppercase tracking-widest hover:bg-black gap-2 transition-all">
                      {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                      {editingItem ? 'METTRE À JOUR' : 'CRÉER LA CAMPAGNE'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
           </Dialog>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filtered.map((c) => {
          const platform = PLATFORMS[c.platform] || PLATFORMS['AUTRE'];
          const Icon = platform.icon;
          
          return (
            <Card key={c.id} className="group relative overflow-hidden rounded-[2.5rem] border-gray-100 bg-white p-8 transition-all hover:shadow-2xl hover:shadow-orange-100/50">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${platform.color}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">{c.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                       <Badge variant="outline" className="rounded-full bg-gray-50 text-[9px] font-black text-gray-400 border-gray-100 px-2 py-0">
                         {c.marketing_account?.name}
                       </Badge>
                       <Badge className={`rounded-full text-[9px] font-black uppercase ${
                          c.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                       }`}>
                         {c.status === 'ACTIVE' ? 'En cours' : 'En pause'}
                       </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`rounded-xl ${c.status === 'ACTIVE' ? 'text-orange-600 hover:bg-orange-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                    onClick={() => handleToggleStatus(c)}
                  >
                    {c.status === 'ACTIVE' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-gray-50 text-gray-400">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[160px]">
                       <DropdownMenuItem 
                         className="rounded-xl p-3 cursor-pointer"
                         onClick={() => {
                            setEditingItem(c);
                            setIsDialogOpen(true);
                         }}
                       >
                         <Edit2 className="w-4 h-4 mr-2" /> Modifier
                       </DropdownMenuItem>
                       <DropdownMenuItem 
                         className="rounded-xl p-3 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
                         onClick={() => handleDelete(c.id)}
                       >
                         <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                       </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Budget Jour</p>
                  <p className="text-sm font-black text-gray-900">{Number(c.daily_budget).toLocaleString()} F</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Budget Total</p>
                  <p className="text-sm font-black text-emerald-600">{c.total_budget ? `${Number(c.total_budget).toLocaleString()} F` : 'Illimité'}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Plateforme</p>
                   <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{c.platform}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Période</p>
                   <p className="text-[10px] font-bold text-gray-500 leading-tight">
                     {c.start_date ? new Date(c.start_date).toLocaleDateString() : '...'} - {c.end_date ? new Date(c.end_date).toLocaleDateString() : '...'}
                   </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-gray-400">
                        S{i}
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Suivi des dépenses activé</span>
                </div>
                <div className="flex items-center gap-1 text-primary animate-pulse">
                   <BarChart3 className="w-4 h-4" />
                   <span className="text-[10px] font-black uppercase tracking-widest">ROAS Direct</span>
                </div>
              </div>

              {/* Decorative Platform Logo */}
              <div className="absolute -top-6 -right-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                 <Icon className="w-40 h-40" />
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <Card className="col-span-full py-20 border-dashed border-2 flex flex-col items-center justify-center text-center space-y-4 rounded-[2.5rem] bg-gray-50/50">
             <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center text-gray-300">
                <Megaphone className="w-10 h-10" />
             </div>
             <div>
                <p className="text-xl font-black text-gray-900 uppercase tracking-tight">Aucune campagne</p>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Lancez votre première acquisition client</p>
             </div>
          </Card>
        )}
      </div>
    </div>
  );
}
