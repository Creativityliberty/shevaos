"use client";

import { useState } from "react";
import { 
  Wallet, 
  ArrowLeftRight, 
  Plus, 
  Smartphone, 
  Banknote,
  Building2,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { createFinanceAccount, createInternalTransfer } from "@/features/finance/actions/account-actions";

const accountSchema = z.object({
  name: z.string().min(2, "Nom trop court"),
  type: z.enum(['OM', 'WAVE', 'CASH', 'BANC']),
  account_number: z.string().min(1, "Numéro requis"),
  balance: z.coerce.number().min(0, "Solde positif requis")
});

const transferSchema = z.object({
  from_account_id: z.string().min(1, "Compte source requis"),
  to_account_id: z.string().min(1, "Compte destination requis"),
  amount: z.coerce.number().min(1, "Montant minimum 1 F"),
  description: z.string().min(2, "Description requise")
}).refine(data => data.from_account_id !== data.to_account_id, {
  message: "Les comptes doivent être différents",
  path: ["to_account_id"]
});

interface Props {
  initialAccounts: any[];
  initialTransfers: any[];
}

export function AccountsClient({ initialAccounts, initialTransfers }: Props) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [transfers, setTransfers] = useState(initialTransfers);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);

  const accountForm = useForm<{
    name: string;
    type: 'OM' | 'WAVE' | 'CASH' | 'BANC';
    account_number: string;
    balance: number;
  }>({
    resolver: zodResolver(accountSchema),
    defaultValues: { name: "", type: "CASH", account_number: "", balance: 0 }
  });

  const transferForm = useForm<{
    from_account_id: string;
    to_account_id: string;
    amount: number;
    description: string;
  }>({
    resolver: zodResolver(transferSchema),
    defaultValues: { from_account_id: "", to_account_id: "", amount: 0, description: "Transfert interne" }
  });

  const onAddAccount = async (values: z.infer<typeof accountSchema>) => {
    try {
      const newAcc = await createFinanceAccount(values);
      setAccounts([newAcc, ...accounts]);
      setIsAddAccountOpen(false);
      accountForm.reset();
      toast.success("Compte créé avec succès");
    } catch (err: any) {
      toast.error(err.message || "Erreur de création");
    }
  };

  const onTransfer = async (values: z.infer<typeof transferSchema>) => {
    setIsSubmittingTransfer(true);
    try {
      const newTransfer = await createInternalTransfer(values);
      // On recharge ou on simule l'update local
      // Pour faire simple on refresh les data via un refresh window ou on update le state
      setTransfers([newTransfer, ...transfers]);
      
      // Update local balances for immediate feedback
      setAccounts(prev => prev.map(acc => {
        if (acc.id === values.from_account_id) return { ...acc, balance: acc.balance - values.amount };
        if (acc.id === values.to_account_id) return { ...acc, balance: acc.balance + values.amount };
        return acc;
      }));

      transferForm.reset();
      toast.success("Transfert effectué");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors du transfert");
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

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

  const totalLiquidity = accounts.reduce((acc, curr) => acc + (Number(curr.balance) || 0), 0);

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
            <p className="text-2xl font-black text-indigo-600 tabular-nums">
              {totalLiquidity.toLocaleString('fr-FR')} <span className="text-sm">F</span>
            </p>
          </div>
          
          <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
            <DialogTrigger
               render={
                 <Button className="h-16 px-8 rounded-[2rem] bg-gray-900 hover:bg-black shadow-xl shadow-gray-200 font-black gap-3 text-lg">
                   <Plus className="w-6 h-6" /> NOUVEAU COMPTE
                 </Button>
               }
             />
            <DialogContent className="rounded-[2.5rem] p-8 max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Ajouter un <span className="text-indigo-600">Compte</span></DialogTitle>
              </DialogHeader>
              <Form {...accountForm}>
                <form onSubmit={accountForm.handleSubmit(onAddAccount)} className="space-y-6 pt-4">
                   <FormField control={accountForm.control} name="name" render={({field}) => (
                      <FormItem>
                         <FormLabel className="text-xs font-black uppercase text-gray-400">Nom du Compte</FormLabel>
                         <FormControl><Input placeholder="Caisse Douala, Mobile Money CEO..." className="rounded-xl h-12" {...field}/></FormControl>
                         <FormMessage/>
                      </FormItem>
                   )}/>
                   <div className="grid grid-cols-2 gap-4">
                      <FormField control={accountForm.control} name="type" render={({field}) => (
                        <FormItem>
                           <FormLabel className="text-xs font-black uppercase text-gray-400">Type</FormLabel>
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger className="rounded-xl h-12"><SelectValue/></SelectTrigger>
                              <SelectContent className="rounded-xl">
                                 <SelectItem value="CASH">Espèces (Cash)</SelectItem>
                                 <SelectItem value="OM">Orange Money</SelectItem>
                                 <SelectItem value="WAVE">Wave</SelectItem>
                                 <SelectItem value="BANC">Banque</SelectItem>
                              </SelectContent>
                           </Select>
                        </FormItem>
                      )}/>
                      <FormField control={accountForm.control} name="balance" render={({field}) => (
                        <FormItem>
                           <FormLabel className="text-xs font-black uppercase text-gray-400">Solde Initial</FormLabel>
                           <FormControl><Input type="number" className="rounded-xl h-12" {...field}/></FormControl>
                        </FormItem>
                      )}/>
                   </div>
                   <FormField control={accountForm.control} name="account_number" render={({field}) => (
                      <FormItem>
                         <FormLabel className="text-xs font-black uppercase text-gray-400">Identifiant / N° de Compte</FormLabel>
                         <FormControl><Input placeholder="+237..., N° RIB..." className="rounded-xl h-12" {...field}/></FormControl>
                      </FormItem>
                   )}/>
                   <Button type="submit" className="w-full h-14 rounded-2xl bg-indigo-600 font-black text-lg mt-4">CRÉER LE COMPTE</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {accounts.length === 0 && (
           <Card 
            className="md:col-span-2 lg:col-span-4 p-20 border-dashed border-4 border-gray-100 bg-gray-50/50 flex flex-col items-center justify-center text-center rounded-[4rem] group cursor-pointer hover:bg-white hover:border-indigo-200 transition-all"
            onClick={() => setIsAddAccountOpen(true)}
           >
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-xl mb-6 group-hover:scale-110 transition-transform">
                <Wallet className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-4xl font-black text-gray-900 uppercase">Zéro <span className="text-indigo-600">Compte</span> Actif</h3>
              <p className="text-gray-400 font-bold mt-2 max-w-md uppercase text-[10px] tracking-[0.2em] leading-relaxed">
                Configurez une Caisse physique, un compte Wave ou Orange Money pour commencer.
              </p>
              <Button className="mt-8 h-16 px-12 rounded-[2rem] bg-black text-white font-black text-lg shadow-2xl shadow-gray-200">
                <Plus className="w-6 h-6 mr-3" /> INITIALISER MON PREMIER COMPTE
              </Button>
           </Card>
        )}
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
              <div className="flex items-end gap-2 text-2xl font-black text-gray-900 tabular-nums">
                {(Number(account.balance) || 0).toLocaleString('fr-FR')}
                <span className="text-sm text-gray-400 font-bold mb-1 uppercase tracking-widest">FCFA</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-6">
            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Mouvements de Fonds</h2>
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
                    <div className="text-lg font-black text-gray-900 tabular-nums">
                      {Number(transfer.amount).toLocaleString('fr-FR')} <span className="text-[10px] text-gray-400 tracking-widest">F</span>
                    </div>
                    <p className="text-[10px] font-medium text-gray-400 italic truncate max-w-[200px]">"{transfer.description}"</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase px-6">Effectuer un Transfert</h2>
          <Card className="p-10 rounded-[3rem] bg-gray-900 text-white relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 p-10 opacity-10"><ArrowLeftRight className="w-32 h-32" /></div>
             <Form {...transferForm}>
                <form onSubmit={transferForm.handleSubmit(onTransfer)} className="space-y-6 relative z-10">
                   <FormField control={transferForm.control} name="from_account_id" render={({field}) => (
                      <FormItem>
                         <FormLabel className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Compte Source</FormLabel>
                         <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                               <SelectTrigger className="h-14 bg-gray-800 border-gray-700 rounded-2xl text-white">
                                  <SelectValue placeholder="Sélectionner source"/>
                               </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl bg-gray-800 text-white border-gray-700">
                               {accounts.map(acc => <SelectItem key={acc.id} value={acc.id} className="focus:bg-gray-700 focus:text-white">{acc.name} ({acc.balance} F)</SelectItem>)}
                            </SelectContent>
                         </Select>
                      </FormItem>
                   )}/>
                   <FormField control={transferForm.control} name="to_account_id" render={({field}) => (
                      <FormItem>
                         <FormLabel className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Compte Destination</FormLabel>
                         <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                               <SelectTrigger className="h-14 bg-gray-800 border-gray-700 rounded-2xl text-white">
                                  <SelectValue placeholder="Sélectionner destination"/>
                               </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl bg-gray-800 text-white border-gray-700">
                               {accounts.map(acc => <SelectItem key={acc.id} value={acc.id} className="focus:bg-gray-700 focus:text-white">{acc.name}</SelectItem>)}
                            </SelectContent>
                         </Select>
                         <FormMessage/>
                      </FormItem>
                   )}/>
                   <FormField control={transferForm.control} name="amount" render={({field}) => (
                      <FormItem>
                         <FormLabel className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Montant à transférer</FormLabel>
                         <FormControl>
                            <Input type="number" className="h-14 bg-transparent border-t-0 border-x-0 border-b-2 border-indigo-500 rounded-none text-4xl font-black focus-visible:ring-0 placeholder:text-gray-700 px-0" {...field}/>
                         </FormControl>
                      </FormItem>
                   )}/>
                   <Button type="submit" disabled={isSubmittingTransfer} className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-900/20 transform hover:scale-[1.02] transition-all">
                      {isSubmittingTransfer ? <Loader2 className="animate-spin" /> : "VALIDER LE TRANSFERT"}
                   </Button>
                </form>
             </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}
