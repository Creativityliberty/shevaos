import { z } from "zod";

export const customerSchema = z.object({
  full_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  phone: z.string().min(8, "Le numéro de téléphone est invalide"),
  secondary_phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  zone_id: z.string().optional(),
  status: z.enum(["ACTIVE", "VIP", "BLACKLISTED", "INACTIVE"]).default("ACTIVE"),
  notes: z.string().optional(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
