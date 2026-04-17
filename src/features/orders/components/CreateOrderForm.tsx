"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  User, 
  MapPin, 
  Package, 
  Calculator, 
  Loader2,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { suggestZoneAction } from "../actions/suggest-zone";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { createOrder } from "../actions/create-order";
import { createOrderSchema, CreateOrderInput } from "../schemas/order-schema";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { createCustomer } from "@/features/customers/actions/customer-actions";

interface CreateOrderFormProps {
  customers: any[];
  products: any[];
  zones: any[];
}

export function CreateOrderForm({ customers, products, zones }: CreateOrderFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestingZone, setIsSuggestingZone] = useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const router = useRouter();

  const form = useForm<CreateOrderInput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      customer_id: "",
      zone_id: "",
      delivery_address: "",
      delivery_fee: 0,
      secondary_phone: "",
      delivery_window: "MATIN",
      items: [{ product_id: "", quantity: 1, unit_price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Mise à jour automatique des frais de livraison selon la zone
  const selectedZoneId = form.watch("zone_id");
  useEffect(() => {
    if (selectedZoneId) {
      const zone = zones.find(z => z.id === selectedZoneId);
      if (zone) form.setValue("delivery_fee", zone.delivery_fee || 0);
    }
  }, [selectedZoneId, zones, form]);

  // Pré-remplissage de l'adresse si un client est choisi
  const selectedCustomerId = form.watch("customer_id");
  useEffect(() => {
    if (selectedCustomerId) {
      const customer = customers.find(c => c.id === selectedCustomerId);
      if (customer) form.setValue("delivery_address", customer.address || "");
    }
  }, [selectedCustomerId, customers, form]);

  // AUTO-DISPATCH : Détection de zone par adresse
  const deliveryAddress = form.watch("delivery_address");
  useEffect(() => {
    const suggestZone = async () => {
      if (deliveryAddress && deliveryAddress.length > 3) {
        setIsSuggestingZone(true);
        try {
          const suggestedId = await suggestZoneAction(deliveryAddress);
          if (suggestedId && suggestedId !== form.getValues("zone_id")) {
            form.setValue("zone_id", suggestedId);
            toast.info("Zone détectée automatiquement !", {
              description: `L'adresse semble correspondre à la zone : ${zones.find(z => z.id === suggestedId)?.name}`,
              icon: <Sparkles className="w-4 h-4 text-indigo-500" />
            });
          }
        } finally {
          setIsSuggestingZone(false);
        }
      }
    };

    const timer = setTimeout(suggestZone, 800);
    return () => clearTimeout(timer);
  }, [deliveryAddress, zones, form]);

  // Calcul du total
  const watchedItems = form.watch("items");
  const subtotal = watchedItems.reduce((acc: number, item: any) => acc + (item.quantity * item.unit_price || 0), 0);
  const deliveryFee = form.watch("delivery_fee") || 0;
  const totalCOD = subtotal + deliveryFee;

  async function handleCreateCustomer() {
    const name = (document.getElementById("cust_name") as HTMLInputElement)?.value;
    const phone = (document.getElementById("cust_phone") as HTMLInputElement)?.value;
    const address = (document.getElementById("cust_address") as HTMLInputElement)?.value;

    if (!name || !phone) {
      toast.error("Champs requis", { description: "Le nom et le téléphone sont obligatoires." });
      return;
    }

    setIsCreatingCustomer(true);
    try {
      const newCustomer = await createCustomer({
        full_name: name,
        phone,
        address,
        status: "ACTIVE"
      });

      if (newCustomer) {
        toast.success("Client créé !");
        setIsCustomerDialogOpen(false);
        form.setValue("customer_id", newCustomer.id);
        router.refresh();
      }
    } catch (err: any) {
      toast.error("Erreur", { description: err.message });
    } finally {
      setIsCreatingCustomer(false);
    }
  }

  async function onSubmit(values: CreateOrderInput) {
    setIsLoading(true);
    try {
      const result = await createOrder({
        ...values,
        cod_amount: totalCOD,
      });

      if (result.error) {
        toast.error("Erreur", { description: result.error });
      } else {
        toast.success("Succès", { description: "Commande créée et stock réservé." });
        router.push("/orders");
      }
    } catch (err) {
      toast.error("Erreur critique inattendue");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* SECTION CLIENT & LIVRAISON */}
          <div className="space-y-6">
            <Card className="p-6 rounded-[2rem] border-orange-50 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-primary font-black uppercase text-sm tracking-wider">
                <User className="w-4 h-4" /> Client & Livraison
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel>Client</FormLabel>
                  <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
                    <DialogTrigger render={
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] font-black uppercase text-primary hover:bg-orange-50 gap-1 px-2">
                        <Plus className="w-3 h-3" /> Nouveau
                      </Button>
                    } />
                    <DialogContent className="rounded-[2rem] p-8 max-w-sm">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">Ajouter un <span className="text-primary">Client</span></DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Nom Complet</label>
                          <Input id="cust_name" placeholder="Ex: Jean Dupont" className="rounded-xl border-gray-100 h-11" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Téléphone (10 chiffres)</label>
                          <Input id="cust_phone" placeholder="01XXXXXXXX" className="rounded-xl border-gray-100 h-11" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Adresse / Quartier</label>
                          <Input id="cust_address" placeholder="Cocody, Riviera..." className="rounded-xl border-gray-100 h-11" />
                        </div>
                        <Button 
                          className="w-full h-12 rounded-xl bg-gray-900 text-white font-black uppercase tracking-widest hover:bg-black mt-4"
                          onClick={handleCreateCustomer}
                          disabled={isCreatingCustomer}
                        >
                          {isCreatingCustomer ? <Loader2 className="w-4 h-4 animate-spin" /> : "ENREGISTRER LE CLIENT"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <FormField
                  control={form.control}
                  name="customer_id"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={(val: any) => field.onChange(val)} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl h-11 border-gray-100">
                            <SelectValue placeholder="Sélectionner un client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-gray-100">
                          {customers.map((c) => (
                            <SelectItem key={c.id} value={c.id} className="rounded-lg">
                              {c.full_name} ({c.phone})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="zone_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zone</FormLabel>
                      <Select onValueChange={(val: any) => field.onChange(val)} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl h-11 border-gray-100">
                            <SelectValue placeholder="Zone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-gray-100">
                          {zones.map((z) => (
                            <SelectItem key={z.id} value={z.id} className="rounded-lg">
                              {z.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="delivery_fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frais Livr.</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="rounded-xl h-11 border-gray-100" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="delivery_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse de livraison exacte</FormLabel>
                    <FormControl>
                      <div className="relative group/address">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within/address:text-indigo-500 transition-colors" />
                        {isSuggestingZone && (
                          <div className="absolute right-3 top-3">
                            <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                          </div>
                        )}
                        <Input 
                          placeholder="Quartier, Rue, Immeuble..." 
                          className="pl-10 rounded-xl h-24 border-gray-100 align-top pt-2 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all font-medium"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="secondary_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tél. Secondaire</FormLabel>
                      <FormControl>
                        <Input placeholder="Optionnel" className="rounded-xl h-11 border-gray-100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="delivery_window"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fenêtre</FormLabel>
                      <Select onValueChange={(val: any) => field.onChange(val)} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl h-11 border-gray-100">
                            <SelectValue placeholder="Matin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-gray-100">
                          <SelectItem value="MATIN">MATIN (8h-12h)</SelectItem>
                          <SelectItem value="MIDI">MIDI (12h-15h)</SelectItem>
                          <SelectItem value="SOIR">SOIR (15h-19h)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* RECAPITULATIF FINANCIER */}
            <Card className="p-8 rounded-[2rem] bg-gray-900 text-white space-y-6 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                 <Calculator className="w-24 h-24" />
               </div>
               <div className="flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest">
                 <Calculator className="w-4 h-4" /> Récapitulatif COD
               </div>
               
               <div className="space-y-3">
                 <div className="flex justify-between text-sm text-gray-400">
                   <span>Sous-total articles</span>
                   <span>{subtotal.toLocaleString()} FCFA</span>
                 </div>
                 <div className="flex justify-between text-sm text-gray-400">
                   <span>Frais de livraison</span>
                   <span>{deliveryFee.toLocaleString()} FCFA</span>
                 </div>
                 <div className="pt-4 border-t border-gray-800 flex justify-between items-end">
                   <div className="space-y-1">
                     <span className="text-xs font-black text-primary uppercase tracking-tighter">Total à Encaisser</span>
                     <div className="text-4xl font-black">{totalCOD.toLocaleString()} <span className="text-sm text-gray-500 uppercase">FCFA</span></div>
                   </div>
                 </div>
               </div>

               <Button 
                 type="submit" 
                 disabled={isLoading}
                 className="w-full h-14 rounded-2xl bg-primary text-black hover:bg-primary/90 font-black text-lg transition-all hover:scale-[1.02]"
               >
                 {isLoading ? <Loader2 className="animate-spin" /> : "CONFIRMER LA COMMANDE"}
               </Button>
            </Card>
          </div>

          {/* SECTION ARTICLES */}
          <div className="space-y-6">
            <div className="flex justify-between items-center px-4">
              <div className="flex items-center gap-2 text-primary font-black uppercase text-sm tracking-wider">
                <Package className="w-4 h-4" /> Articles ({fields.length})
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => append({ product_id: "", quantity: 1, unit_price: 0 })}
                className="rounded-xl border-primary text-primary hover:bg-orange-50 font-bold"
              >
                <Plus className="w-4 h-4 mr-1" /> Ajouter
              </Button>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {fields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm relative group"
                  >
                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.product_id`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs uppercase font-bold text-gray-400">Produit</FormLabel>
                            <Select 
                              onValueChange={(val: any) => {
                                field.onChange(val);
                                const prod = products.find(p => p.id === val);
                                if (prod) form.setValue(`items.${index}.unit_price`, prod.unit_price);
                              }} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="rounded-xl h-11 border-transparent bg-gray-50 group-hover:bg-white transition-colors">
                                  <SelectValue placeholder="Choisir un produit" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-xl border-gray-100">
                                {products.map((p: any) => (
                                  <SelectItem key={p.id} value={p.id} className="rounded-lg">
                                    {p.name} ({p.sku}) — {p.unit_price.toLocaleString()} F
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs uppercase font-bold text-gray-400">Quantité</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                  className="rounded-xl h-11 border-transparent bg-gray-50" 
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.unit_price`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs uppercase font-bold text-gray-400">Prix unitaire</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  readOnly
                                  className="rounded-xl h-11 border-transparent bg-gray-100 text-gray-500 font-bold" 
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="absolute -top-2 -right-2 p-2 bg-red-50 text-red-500 rounded-full shadow-sm hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {fields.length === 0 && (
                <div className="p-8 border-2 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center justify-center text-gray-400 gap-2">
                  <AlertCircle className="w-8 h-8 opacity-20" />
                  <p className="font-medium">Aucun article sélectionné</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
