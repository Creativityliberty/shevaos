# 🛠️ Implémentation technique de Supabase Storage (SHEVA OS)

Ce guide détaille comment intégrer techniquement le stockage de fichiers dans le code de **SHEVA OS**.

## 1. Choix du type d'Upload

| Type | Limite conseillée | Cas d'utilisation SHEVA OS |
| :--- | :--- | :--- |
| **Standard** | < 6 MB | Logos, avatars agents, petites photos produits. |
| **Resumable (TUS)** | > 6 MB / Réseau instable | Bordereaux de livraison HD, vidéos de formation, archives PDF. |

### Exemple : Upload Standard (Client-side)
```typescript
import { createClient } from '@/lib/supabase/client';

async function uploadAvatar(file: File) {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(`public/${Date.now()}.png`, file, {
      upsert: true
    });

  if (error) throw error;
  return data.path;
}
```

## 2. Accès aux fichiers (Serving)

### Buckets Publics (Ex: Catalogue Produit)
Les fichiers sont accessibles via une URL fixe. Idéal pour les images qui ne sont pas sensibles.
- **URL** : `https://[project_ref].supabase.co/storage/v1/object/public/[bucket]/[path]`

### Buckets Privés (Ex: Pièces d'identité RH)
Nécessite une URL signée temporaire (Signed URL) générée côté serveur.
```typescript
const { data } = await supabase.storage
  .from('hr-documents')
  .createSignedUrl('id-card-driver-001.pdf', 3600); // Valide 1 heure
```

## 3. Sécurité (RLS) sur les Objets

Le stockage utilise les politiques RLS pour sécuriser les fichiers. Par exemple, pour permettre à un livreur de ne voir que **ses propres** preuves de livraison :

```sql
CREATE POLICY "Livreurs voir leurs POD"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'proof-of-delivery' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## 4. Optimisation des Images (On-the-fly)

Grâce à l'option activée dans vos paramètres, vous pouvez redimensionner les images directement via l'URL :
`.../object/public/products/iphone.jpg?width=200&height=200&resize=contain`
