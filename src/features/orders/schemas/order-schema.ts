import * as z from "zod";

export const orderItemSchema = z.object({
  product_id: z.string().min(1, "Un produit est requis"),
  quantity: z.number().int("La quantité doit être un entier").min(1, "La quantité minimum est 1"),
  unit_price: z.number().min(0, "Le prix ne peut pas être négatif"),
});

export const createOrderSchema = z.object({
  customer_id: z.string().min(1, "Veuillez choisir un client valide"),
  zone_id: z.string().min(1, "Veuillez choisir une zone géographique"),
  delivery_address: z.string().min(5, "L'adresse de livraison est trop courte et imprécise"),
  delivery_fee: z.number().min(0, "Les frais de livraison ne peuvent pas être négatifs"),
  secondary_phone: z.string().optional(),
  delivery_window: z.enum(["MATIN", "MIDI", "SOIR"]),
  items: z.array(orderItemSchema).min(1, "Vous devez ajouter au moins un article à la commande"),
});

// Use z.input so the form type matches what zodResolver expects (input shape, not output shape)
export type CreateOrderInput = z.input<typeof createOrderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
