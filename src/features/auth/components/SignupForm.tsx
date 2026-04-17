"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Loader2, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { createClient } from "@/lib/supabase/client";

const signupSchema = z.object({
    fullName: z.string().min(2, { message: "Minimum 2 caractères" }),
    email: z.string().email({ message: "Email invalide" }),
    role: z.string().min(2, { message: "Rôle requis" }),
    password: z.string().min(6, { message: "Minimum 6 caractères" }),
    confirmPassword: z.string().min(6, { message: "Minimum 6 caractères" }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});

type SignupValues = z.infer<typeof signupSchema>;

export function SignupForm() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const form = useForm<SignupValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            fullName: "",
            email: "",
            role: "ceo",
            password: "",
            confirmPassword: "",
        },
    });

    async function onSubmit(values: SignupValues) {
        console.log('Signup form values:', values);
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: values.email,
                password: values.password,
                options: {
                    data: {
                        full_name: values.fullName,
                        requested_role: values.role,
                    },
                },
            });

            if (error) {
                toast.error("Échec de l'inscription", {
                    description: error.message,
                });
                return;
            }

            if (data.user) {
                toast.success("Inscription réussie", {
                    description: "Un email de confirmation a été envoyé.",
                });

                router.refresh();
                router.push("/login");
            }
        } catch (error) {
            toast.error("Erreur inattendue");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }: { field: any }) => (
                        <FormItem>
                            <FormLabel className="text-gray-700">Nom complet</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Votre nom complet"
                                        className="pl-10 rounded-2xl border-gray-200 focus:border-primary focus:ring-primary h-12"
                                        {...field}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }: { field: any }) => (
                        <FormItem>
                            <FormLabel className="text-gray-700">Email professionnel</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="nom@sheva-os.com"
                                        className="pl-10 rounded-2xl border-gray-200 focus:border-primary focus:ring-primary h-12"
                                        {...field}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }: { field: any }) => (
                        <FormItem>
                            <FormLabel className="text-gray-700">Rôle (Privilèges)</FormLabel>
                            <Select onValueChange={(val: any) => field.onChange(val)} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="rounded-2xl border-gray-200 focus:ring-primary h-12 w-full">
                                        <SelectValue placeholder="Sélectionnez un rôle" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-2xl">
                                    <SelectItem value="ceo">CEO / Gérant</SelectItem>
                                    <SelectItem value="manager">Manager / Directeur</SelectItem>
                                    <SelectItem value="dispatcher">Dispatcher Logistique</SelectItem>
                                    <SelectItem value="driver">Livreur / Chauffeur</SelectItem>
                                    <SelectItem value="hub">Agent Hub / Antenne</SelectItem>
                                    <SelectItem value="finance">Comptable / Finance</SelectItem>
                                    <SelectItem value="sav_agent">Agent SAV</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }: { field: any }) => (
                        <FormItem>
                            <FormLabel className="text-gray-700">Mot de passe</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10 rounded-2xl border-gray-200 focus:border-primary focus:ring-primary h-12"
                                        {...field}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }: { field: any }) => (
                        <FormItem>
                            <FormLabel className="text-gray-700">Confirmer le mot de passe</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10 rounded-2xl border-gray-200 focus:border-primary focus:ring-primary h-12"
                                        {...field}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className="w-full rounded-2xl h-12 text-lg font-semibold shadow-lg shadow-orange-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        "Créer un compte"
                    )}
                </Button>

                <p className="text-center text-sm text-gray-500">
                    Déjà un compte?{" "}
                    <button
                        type="button"
                        onClick={() => router.push("/login")}
                        className="text-primary hover:underline font-medium"
                    >
                        Se connecter
                    </button>
                </p>
            </form>
        </Form>
    );
}