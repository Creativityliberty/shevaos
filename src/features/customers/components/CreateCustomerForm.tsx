"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Phone, MapPin, AlignLeft, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { CustomBadge } from "@/components/ui/custom-badge";

import { customerSchema, CustomerFormValues } from "../schemas/customer-schema";
import { createCustomer } from "../actions/customer-actions";

export function CreateCustomerForm({ zones }: { zones: any[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      secondary_phone: "",
      address: "",
      city: "",
      zone_id: undefined,
      status: "ACTIVE",
      notes: ""
    }
  });

  const onSubmit = async (values: CustomerFormValues) => {
    setIsSubmitting(true);
    try {
      await createCustomer(values);
      toast.success("Client créé avec succès", {
        description: "Le client a été ajouté au CRM.",
      });
      router.push("/customers");
    } catch (error: any) {
      toast.error("Erreur de création", {
        description: error.message || "Impossible de créer ce client.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-700 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          <div className="md:col-span-8 space-y-6">
            {/* Identity section */}
            <Card className="p-8 rounded-[2.5rem] bg-white border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-primary">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Identité complète</h3>
                  <p className="text-sm font-medium text-gray-400">Informations nominatives du client</p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest font-bold text-gray-500">Nom Complet *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Jean Dupont" className="h-12 rounded-2xl border-gray-200 focus:border-primary text-base px-4" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest font-bold text-gray-500">Téléphone Principal *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                          <Input placeholder="+237 ..." className="h-12 rounded-2xl border-gray-200 pl-12 text-base font-medium" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secondary_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest font-bold text-gray-400">Téléphone Secondaire</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-4 top-3.5 h-5 w-5 text-gray-300" />
                          <Input placeholder="Optionnel" className="h-12 rounded-2xl border-gray-200 pl-12 text-base" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* Address */}
            <Card className="p-8 rounded-[2.5rem] bg-white border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Localisation</h3>
                  <p className="text-sm font-medium text-gray-400">Détails pour faciliter les livraisons</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest font-bold text-gray-500">Ville</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Douala" className="h-12 rounded-2xl border-gray-200 px-4" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zone_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest font-bold text-gray-500">Zone de Livraison</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-2xl border-gray-200 px-4">
                            <SelectValue placeholder="Sélectionner la zone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-2xl">
                          {zones.map((z: any) => (
                            <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest font-bold text-gray-500">Adresse de Domicile exacte</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Indiquez des repères clairs (carrefour, couleur portail...)" className="rounded-2xl border-gray-200 min-h-[100px] resize-none p-4" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>
          </div>

          <div className="md:col-span-4 space-y-6">
            <Card className="p-8 rounded-[2.5rem] bg-gray-900 border-none shadow-xl sticky top-8 text-white space-y-8">
              <div>
                <h3 className="text-xl font-black tracking-tight mb-2">Paramètres CRM</h3>
                <p className="text-gray-400 text-sm font-medium">Définissez la priorité du client</p>
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest font-bold text-gray-400">Statut du Compte</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-white/5 text-white pr-4">
                          <SelectValue placeholder="Actif" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-2xl bg-gray-800 text-white border-white/10">
                        <SelectItem value="ACTIVE" className="focus:bg-gray-700 focus:text-white">Actif (Standard)</SelectItem>
                        <SelectItem value="VIP" className="focus:bg-gray-700 focus:text-white">VIP (Prioritaire)</SelectItem>
                        <SelectItem value="BLACKLISTED" className="text-red-400 focus:bg-gray-700 focus:text-red-400">Blacklisté</SelectItem>
                        <SelectItem value="INACTIVE" className="focus:bg-gray-700 focus:text-white">Inactif</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest font-bold text-gray-400">Notes internes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Préférences, horaires..." className="rounded-2xl border-white/10 bg-white/5 min-h-[120px] resize-none text-white p-4" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-black font-black text-lg transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Création...</span>
                ) : (
                  "CRÉER LE CLIENT"
                )}
              </Button>
            </Card>
          </div>

        </div>
      </form>
    </Form>
  );
}
