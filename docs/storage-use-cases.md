# 🚀 Cas d'utilisation de Supabase Storage dans SHEVA OS

Pourquoi avons-nous besoin de stockage alors que pour l'instant nous ne gérons que des données texte ? Voici comment le stockage va transformer SHEVA OS d'un simple registre en un ERP opérationnel complet.

## 1. Module Logistique (Indispensable)
Actuellement, une livraison est juste un statut "LIVRÉE" dans une table.
- **Preuve de Livraison (POD)** : Le livreur prend une photo du bordereau signé ou du client avec le colis via l'application. 
- **Utilité** : Résolution immédiate des litiges "le client dit qu'il n'a rien reçu".
- **Table liée** : `APP LIVREUR` / `RECOUVREMENT_GENERAL`.

## 2. Module Finance & Trésorerie
- **Justificatifs de Dépense** : Chaque dépense enregistrée dans `DÉPENSES` peut être accompagnée d'une photo du ticket de caisse ou de la facture.
- **Preuves de Versement** : Les photos des bordereaux de dépôt bancaire ou captures d'écran Mobile Money pour la table `VERSEMENTS`.
- **Utilité** : Audit comptable simplifié et réduction des fraudes.

## 3. Module RH (Base Livreurs & Staff)
- **Documents d'identité** : Stockage des scans de CNI, Permis de conduire et Contrats dans la table `RH`.
- **Utilité** : Centralisation des dossiers du personnel. Accès restreint via RLS (seuls les admins RH voient ces fichiers).

## 4. Module SAV (Service Client)
- **Captures de Litiges** : Photos ou captures d'écran WhatsApp envoyées par les clients (produit cassé, erreur de couleur).
- **Utilité** : Preuve visuelle pour le traitement des retours et remboursements.
- **Table liée** : `SERVICE CLIENT`.

## 5. Module Stock & Catalogue
- **Photos des Articles** : Un catalogue sans photos n'est pas vendeur. Stockage des images haute définition pour chaque produit.
- **Bons de Réception** : Photos des arrivages de marchandise pour la table `STOCK_APPRO`.
- **Utilité** : Identification visuelle rapide des produits par les agents de stock et commerciaux.

## 6. Module Marketing (Ads)
- **Visuels Créatifs** : Stockage des bannières et vidéos publicitaires utilisées pour les campagnes.
- **Table liée** : `MARKETING_ADS`.

---

### 💡 Conclusion
Le stockage S3 permet à SHEVA OS de devenir la **source unique de vérité**. Au lieu de chercher des photos dans des groupes WhatsApp ou des emails, tout est rattaché directement à la ligne correspondante dans la base de données.
