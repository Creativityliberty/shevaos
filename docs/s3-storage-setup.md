# 📦 Configuration Supabase Storage S3 (SHEVA OS)

Ce document récapitule la configuration du stockage S3 pour **SHEVA OS**. Le stockage S3 permet de manipuler les fichiers du projet (images produits, PDFs de factures, preuves de livraison) avec une rapidité supérieure et une compatibilité standard (SDK AWS).

## 🔑 Identifiants S3 (À déplacer dans .env.local)

> [!CAUTION]
> Ne jamais committer ces clés sur GitHub. Elles doivent rester dans votre fichier `.env.local`.

- **Endpoint (Hôte direct)** : `https://gtenkjvlnwspxcosbybp.storage.supabase.co/storage/v1/s3`
- **Région** : `eu-west-3`
- **Access Key ID** : `419e8ada8e8f099ea73e072bfb0cb997`
- **Secret Access Key** : `1a3469d34e6cd00916000e0da2c48ebd91bf749d26d5067a6777269ecc234755`

## 🚀 À quoi ça sert pour SHEVA OS ?

L'activation du protocole S3 sur Supabase est un atout stratégique pour plusieurs modules :

1.  **Catalogue Produits** : Permet d'uploader et de transformer (redimensionner) les photos des produits pour un affichage rapide sur mobile.
2.  **Module Logistique (Preuve de livraison)** : Les livreurs peuvent uploader une photo du colis déposé ou du bordereau signé comme preuve légale.
3.  **Finance & Facturation** : Stockage sécurisé des factures fournisseurs (PDF) et des reçus de dépôts bancaires.
4.  **Documents RH** : Stockage des pièces d'identité des agents et livreurs (restreint par RLS).

## 🛠️ Exemple d'implémentation (Node.js)

```typescript
import { S3Client } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  forcePathStyle: true,
  region: 'eu-west-3',
  endpoint: 'https://gtenkjvlnwspxcosbybp.storage.supabase.co/storage/v1/s3',
  credentials: {
    accessKeyId: process.env.STORAGE_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.STORAGE_S3_SECRET_ACCESS_KEY,
  }
});
```

## 🔐 Recommandation Sécurité
Pour le client (navigateur), utilisez toujours les **Session Tokens** avec RLS pour éviter d'exposer vos clés maîtresses. Les clés ci-dessus sont réservées à un usage **Serveur** (Server Actions ou Edge Functions).
