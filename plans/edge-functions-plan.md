# Plan d'automatisation SHEVA OS (Edge Functions)

Ce plan définit les fonctions serveur (Supabase Edge Functions) à déployer pour automatiser les Process 1 (Vente/Livraison) et Process 2 (Retour/Gestion).

## 1. Réconciliation Quotidienne (`daily-reconciliation`)
- **Fréquence** : Chaque jour à 23:59.
- **Logique Process 1** : 
    - Scanner les missions non clôturées.
    - Calculer les écarts de stock théorique vs réel.
    - Générer les écritures de régularisation automatique si de petits écarts sont tolérés.
    - Déclencher une alerte critique en cas d'écart majeur non déclaré par le livreur.

## 2. Notification Client WhatsApp (`customer-messenger`)
- **Déclencheur** : Webhook sur changement de statut `orders`.
- **Logique Process 1** :
    - Quand `status` passe de `CHARGÉE` à `EN_LIVRAISON` -> Envoyer SMS/WhatsApp avec le lien de suivi et le numéro du livreur.
    - Quand `status` = `LIVRÉE` -> Envoyer message de remerciement + lien vers la facture PDF.

## 3. Moteur de Facturation PDF (`pdf-invoicer`)
- **Déclencheur** : Appel RPC ou Webhook.
- **Logique** :
    - Générer un PDF professionnel avec QR Code.
    - Stocker le PDF dans Supabase Storage.
    - Lier l'URL à l'objet `order`.

## 4. Scanner d'Alertes Stock (`inventory-alert-engine`)
- **Déclencheur** : Cron (toutes les heures).
- **Logique Process 2** :
    - Vérifier `stock_levels` par rapport aux `min_stock_level` configurés par le manager.
    - Si critique -> Envoyer notification Realtime au Dashboard CEO.

## 5. Calcul des Commissions (`driver-rewards-calculator`)
- **Fréquence** : Hebdomadaire.
- **Logique** :
    - Analyser le Grand Livre (`ledger_entries`) pour les types `CASH_VERIFIED`.
    - Calculer le montant à payer au livreur selon sa grille tarifaire.
    - Créer un `PAYOUT` en attente de validation Finance.

---

### Prochaine étape immédiate :
Si validé, je commence par déployer la structure de **`daily-reconciliation`** dans le dossier `supabase/functions/`.
