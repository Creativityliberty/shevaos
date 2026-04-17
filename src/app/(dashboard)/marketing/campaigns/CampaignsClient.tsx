"use client";

import { useState } from "react";
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
      status: editingItem?.status || 'RUNNING',
      notes: formData.get("notes")
    };

    setIsSyncing(true);
    try {
      await upsertMarketingCampaign(data);
      toast.success("Campagne enregistrée");
      setIsDialogOpen(false);
      setEditingItem(null);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la sauvegarde");
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleStatus = async (campaign: any) => {
    const newStatus = campaign.status === 'RUNNING' ? 'PAUSED' : 'RUNNING';
    try {
      await upsertMarketingCampaign({ ...campaign, status: newStatus });
      toast.success(`Campagne ${newStatus === 'RUNNING' ? 'relancée' : 'mise en pause'}`);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette campagne ? Les données de dépenses historiques seront conservées.")) return;
    try {
      await deleteMarketingCampaign(id);
      toast.success("Campagne supprimée");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header */}
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
              <DialogTrigger asChild>
                <Button onClick={() => setEditingItem(null)} className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-black font-black gap-2 shadow-lg shadow-orange-100 transition-all active:scale-95">
                  <Plus className="w-5 h-5" /> NOUVELLE CAMPAGNE
                </Button>
              </DialogTrigger>
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
                      <Select name="marketing_account_id" defaultValue={editingItem?.marketing_account_id} required>
                        <SelectTrigger className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold">
                          <SelectValue placeholder="Choisir un compte" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {accounts.map(acc => (
                            <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Nom de la campagne</label>
                      <Input name="name" defaultValue={editingItem?.name} required placeholder="Ex: SOLDES_ETE_2024" className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Plateforme</label>
                       <Select name="platform" defaultValue={editingItem?.platform || 'FB'} required>
                        <SelectTrigger className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="FB">Facebook / Meta</SelectItem>
                          <SelectItem value="TIKTOK">TikTok Ads</SelectItem>
                          <SelectItem value="GOOGLE">Google Ads</SelectItem>
                          <SelectItem value="AUTRE">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Budget Quotidien (F)</label>
                      <Input name="daily_budget" type="number" defaultValue={editingItem?.daily_budget} placeholder="0" className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold text-orange-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Notes & Instructions</label>
                    <textarea name="notes" defaultValue={editingItem?.notes} className="w-full min-h-[80px] p-4 rounded-2xl border-gray-100 bg-gray-50/50 font-medium text-sm focus:outline-none" />
                  </div>
                  <DialogFooter className="pt-6">
                    <Button type="submit" disabled={isSyncing} className="w-full h-14 rounded-2xl bg-gray-900 text-white font-black uppercase tracking-widest hover:bg-black gap-2 transition-all">
                      {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                      LANCER LA CAMPAGNE
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
           </Dialog>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((c) => {
          const PlatformIcon = PLATFORMS[c.platform]?.icon || Megaphone;
          const platformStyle = PLATFORMS[c.platform]?.color || 'bg-gray-50';

          return (
            <Card key={c.id} className="relative overflow-hidden rounded-[2.5rem] border-gray-100 bg-white p-8 transition-all hover:shadow-xl group">
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${platformStyle}`}>
                    <PlatformIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none mb-1">{c.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px] font-black uppercase rounded-full border-gray-200">
                        {c.marketing_account?.name}
                      </Badge>
                      <Badge className={`rounded-full text-[9px] font-black uppercase ${
                        c.status === 'RUNNING' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
                      }`}>
                        {c.status === 'RUNNING' ? 'Active' : 'En Pause'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                   <Button 
                     variant="ghost" 
                     size="icon" 
                     className="w-10 h-10 rounded-xl hover:bg-gray-100"
                     onClick={() => toggleStatus(c)}
                     title={c.status === 'RUNNING' ? "Mettre en pause" : "Relancer"}
                   >
                     {c.status === 'RUNNING' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-500" />}
                   </Button>
                   <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-10 h-10 rounded-xl hover:bg-gray-100"
                      onClick={() => {
                        setEditingItem(c);
                        setIsDialogOpen(true);
                      }}
                   >
                      <Edit2 className="w-4 h-4" />
                   </Button>
                   <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-10 h-10 rounded-xl hover:bg-red-50 hover:text-red-500"
                      onClick={() => handleDelete(c.id)}
                   >
                      <Trash2 className="w-4 h-4" />
                   </Button>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Budget Jour</p>
                  <p className="text-sm font-black text-gray-900">{Number(c.daily_budget).toLocaleString()} F</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Plateforme</p>
                   <p className="text-sm font-black text-gray-900 uppercase">{c.platform}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Créée le</p>
                   <p className="text-sm font-bold text-gray-500">{new Date(c.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Quick Link to Spend */}
              <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                <Button variant="ghost" className="text-[10px] font-black uppercase text-primary hover:bg-orange-50 gap-2">
                   <BarChart3 className="w-3 h-3" /> VOIR ANALYTIQUES
                </Button>
                <div className="text-[10px] font-bold text-gray-300 uppercase">ID: {c.platform_campaign_id || 'LOCAL_ONLY'}</div>
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
              <Megaphone className="w-10 h-10" />
            </div>
            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Aucune campagne trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
}
