
SHEVA OS
Cahier des Charges Stratégique, Produit & Technique


Version 1.0 — Document Principal de Référence
Classification : Confidentiel — Usage Interne

Commandé ≠ Livré ≠ Encaissé ≠ Déposé ≠ Vérifié

 

TABLE DES MATIÈRES


1. Résumé exécutif
2. Vision produit
3. Problèmes métier réels
4. Objectifs métier
5. Ce que fait l'application au quotidien
6. Organisation par départements
7. Machines à états
8. Rôles et permissions
9. Règles métier critiques
10. KPIs et alertes
11. Architecture fonctionnelle
12. Plan complet de l'application
13. Architecture technique complète
14. Directives de connexion Figma + Next.js + Supabase
15. Modèle de données de haut niveau
16. UX / UI
17. MVP
18. Feuille de route
19. Zones à confirmer
20. Recommandations CTO finales

 

SHEVA OS — CAHIER DES CHARGES STRATÉGIQUE, PRODUIT ET TECHNIQUE

Version 1.0 — Document Principal de Référence
Classification : Confidentiel — Usage Interne




1. RÉSUMÉ EXÉCUTIF

SHEVA OS est le système nerveux central des opérations COD (Cash on Delivery) et de prestations de service. Il s'agit d'un ERP opérationnel nouvelle génération conçu pour des entreprises africaines à fort volume transactionnel, fonctionnant principalement sur le modèle de livraison contre remboursement.

Le problème fondamental que SHEVA OS résout peut être résumé en une équation :

Commandé ≠ Livré ≠ Encaissé ≠ Déposé ≠ Vérifié

Cette rupture de chaîne entre la confirmation d'une commande et la vérification du cash réel est la source principale de pertes, de décisions erronées et d'instabilité opérationnelle dans toute entreprise COD. Les dirigeants pilotent avec de fausses données, les marketeurs dépensent sur des produits indisponibles, les livreurs encaissent sans que la finance soit alertée, et le stock s'évapore sans traçabilité.

SHEVA OS met fin à cela. L'application connecte en temps réel tous les départements — du call center au CEO, du livreur terrain à la trésorerie, du stock aux achats — dans un seul système de vérité opérationnelle.

Périmètre couvert :
•	Gestion des commandes de bout en bout
•	Dispatch et suivi des livraisons terrain
•	Collecte, dépôt et vérification du cash COD
•	Gestion du stock et des entrepôts
•	Pilotage financier et trésorerie
•	Suivi des campagnes publicitaires et performances marketing
•	Achats fournisseurs et importations Chine
•	Abonnements et services récurrents
•	Dashboard CEO et alertes automatiques
•	Préparation complète à l'intégration d'agents IA

Stack technologique :
•	Frontend : Next.js 14+ (App Router), TypeScript, Tailwind CSS, Shadcn UI
•	Backend : Supabase (PostgreSQL, RLS, RPC, Realtime, Edge Functions)
•	Design : Figma (design system unifié)
•	Versionning : GitHub
•	Hébergement : Hostinger




2. VISION PRODUIT


2.1 Ambition

SHEVA OS n'est pas un outil de gestion. C'est une infrastructure de pilotage. La vision est de créer le système d'exploitation standard des entreprises COD en Afrique — le même niveau d'ambition que ce qu'Odoo a représenté pour les PME européennes, mais conçu nativement pour les réalités terrain africaines : connectivité variable, paiement cash dominant, opérations terrain à fort volume, besoin de décision rapide.


2.2 Positionnement


Dimension	Positionnement SHEVA OS
Type de produit	ERP opérationnel + outil de pilotage en temps réel
Utilisateurs cibles	Entreprises COD, e-commerce, services avec livraison
Marché principal	Afrique francophone (Côte d'Ivoire, Sénégal, Cameroun, Mali...)
Modèle de déploiement	SaaS multi-tenant ou instance dédiée
Différenciation	Conçu pour COD, cash-first, terrain-first, IA-ready



2.3 Principes produit non négociables

Principe 1 — La donnée entre une fois, circule partout.
Chaque information saisie dans un département alimente automatiquement tous les autres. Une commande confirmée au call center déclenche immédiatement le stock, le dispatch, la finance et le marketing analytics.

Principe 2 — Chaque état métier est un état système.
Il n'existe pas d'état "en attente de confirmation verbale". Chaque transition opérationnelle — livraison, encaissement, dépôt, vérification — est un événement tracé, horodaté et signé par un rôle autorisé.

Principe 3 — Le cash réel est la seule vérité.
Le chiffre d'affaires n'existe qu'au moment où le cash est vérifié par la finance. Aucun dashboard ne présente des commandes comme du CA avant vérification complète.

Principe 4 — Mobile-first pour le terrain, desktop-first pour le pilotage.
Les livreurs opèrent sur mobile. Les responsables financiers et les managers opèrent sur desktop. L'interface s'adapte au contexte d'usage.

Principe 5 — Alertes avant problèmes.
SHEVA OS anticipe les anomalies : stock critique, livreur non connecté, cash non déposé depuis 48h, écart de caisse, budget ads dépassé. Le système alerte avant que le problème devienne une perte.


2.4 Cible utilisateurs


Profil	Usage principal	Interface
CEO / Directeur	Pilotage global, alertes, KPIs	Dashboard exécutif
Responsable SAV	Gestion appels, commandes, clients	CRM + ticketing
Responsable OPS	Dispatch, planning livraisons	Vue carte + listes
Livreur	Livraisons, encaissements, dépôts	App mobile simplifiée
Chef de Hub	Gestion entrepôt, vérification cash	Interface hub
Responsable Finance	Trésorerie, rapprochements, bilans	Dashboard financier
Responsable Ads	Campagnes, ROAS, attribution	Dashboard marketing
Acheteur	Fournisseurs, commandes, délais	Interface achats
Responsable Stock	Inventaire, alertes, mouvements	Interface stock





3. PROBLÈMES MÉTIER RÉELS


3.1 Le problème fondamental : la rupture de chaîne

Dans une entreprise COD classique, voici ce qui se passe réellement :

Scénario type :
Un client passe commande par téléphone. L'agent SAV enregistre la commande dans un Excel ou un Google Sheet. Le dispatcher envoie un message WhatsApp au livreur. Le livreur livre, encaisse 25 000 FCFA en cash. Il rentre le soir avec 180 000 FCFA collectés sur 12 livraisons. Il dépose une partie à son chef de hub. Le chef de hub note sur un carnet. Le directeur financier ne voit les chiffres que le lendemain matin, au mieux. Entre-temps, le stock a été décrémenté manuellement (ou pas). Le marketing a peut-être dépensé 50 000 FCFA sur des publicités pour un produit en rupture.

Ce que cela coûte :
•	Pertes sur cash non tracé : 3 à 8% du CA selon les entreprises
•	Surcoûts publicitaires sur produits indisponibles : 5 à 15% du budget ads gaspillé
•	Décisions erronées basées sur des données décalées de 24 à 72h
•	Litiges livreurs impossibles à trancher faute de preuves
•	Impossibilité de prévoir les achats fournisseurs avec précision


3.2 Cartographie des ruptures


COMMANDE
   ↓ [rupture possible : enregistrement incomplet, doublon, erreur produit]
PRÉPARATION STOCK
   ↓ [rupture possible : stock non vérifié, picking incorrect]
DISPATCH
   ↓ [rupture possible : assignment sans confirmation livreur, zone incorrecte]
LIVRAISON
   ↓ [rupture possible : livraison non reportée, cash non remis, fausse livraison]
ENCAISSEMENT
   ↓ [rupture possible : montant incorrect, reçu non généré, livreur qui retient]
DÉPÔT
   ↓ [rupture possible : délai > 48h, montant partiel, pas de reçu]
VÉRIFICATION FINANCE
   ↓ [rupture possible : rapprochement manuel, erreurs, délai]
VÉRIFICATION DIRECTION
   [résultat : chiffres J-2 ou J-3, décision basée sur passé]



3.3 Les 7 douleurs critiques

Douleur 1 : Données en silo
Stock ne parle pas à Finance, Finance ne parle pas à Ads, Dispatch ne parle pas à Stock. Chaque département a sa propre vérité.

Douleur 2 : Cash non tracé
Le cash collecté par les livreurs n'est pas réconcilié en temps réel. Les dépôts sont manuels, tardifs, partiels.

Douleur 3 : Décisions à l'aveugle
Le CEO prend des décisions basées sur des données du lendemain ou d'avant-hier. Les alertes arrivent trop tard.

Douleur 4 : Ads sur ruptures
Le département marketing dépense sur des produits que le stock ne peut pas honorer. Coût en publicité + coût en annulations + coût en image.

Douleur 5 : Litige livreur non arbitrable
Sans trace numérique de chaque livraison, encaissement et dépôt, les litiges livreurs sont impossibles à résoudre équitablement.

Douleur 6 : Stock fantôme
Le stock théorique diverge du stock réel. On vend ce qu'on n'a pas, on ne vend pas ce qu'on a.

Douleur 7 : Prévision achats impossible
Sans historique fiable de ventes, de stocks et de délais fournisseurs, les achats sont réactifs et coûteux.




4. OBJECTIFS MÉTIER


4.1 Objectifs primaires


Objectif	Mesure de succès	Délai cible
Éliminer les ruptures de chaîne COD	Écart Commandé/Vérifié < 2%	3 mois post-lancement
Tracer 100% du cash terrain	0 dépôt non tracé	J+1 du lancement
Alertes proactives en temps réel	Alerte < 30 min après anomalie	Dès MVP
Dashboard CEO en temps réel	Données < 5 min de retard	Dès MVP
Synchroniser stock et ventes	Rupture de stock détectée avant vente	3 mois
Réconciliation financière automatique	0 réconciliation manuelle quotidienne	6 mois



4.2 Objectifs secondaires

•	Préparer l'intégration d'agents IA pour dispatch automatique
•	Fournir une base de données propre pour analyse prédictive
•	Permettre un audit complet de chaque transaction
•	Créer une source de vérité unique consultable par tous les départements


4.3 Ce que SHEVA OS ne fait PAS (dans le MVP)

•	Comptabilité analytique avancée (pas de plan comptable complet)
•	Facturation client automatique (phase 2)
•	Application mobile native (PWA mobile-responsive dans le MVP)
•	Intégration API opérateurs téléphoniques (phase 2)
•	Marketplace fournisseurs (phase 3)




5. CE QUE FAIT L'APPLICATION AU QUOTIDIEN


5.1 La journée type d'une entreprise COD avec SHEVA OS

06h00 — Ouverture système
Le responsable hub ouvre SHEVA OS. Il voit les commandes préparées la veille, prêtes à dispatcher. Le stock est synchronisé automatiquement depuis les mouvements du jour précédent.

07h00 — Dispatch du matin
Le dispatcher consulte la vue carte des livreurs disponibles et des commandes à livrer. SHEVA OS suggère les assignments optimaux par zone. Chaque livreur reçoit sa liste de livraisons sur son interface mobile.

08h00 — 18h00 — Opérations terrain
Les livreurs confirment chaque livraison en temps réel depuis leur mobile : statut livré, encaissé, ou échec avec motif. Le stock est décrémenté automatiquement à la livraison confirmée. La finance voit l'encaissement entrant en temps réel.

18h00 — Clôture terrain
Le responsable hub déclenche la procédure de retour. Chaque livreur dépose son cash. Le hub enregistre chaque dépôt dans SHEVA OS avec montant, heure et reçu numérique. La finance voit le dépôt instantanément.

19h00 — Réconciliation automatique
SHEVA OS compare automatiquement : commandes livrées vs cash attendu vs cash déposé. Les écarts sont flaggés en rouge, un ticket d'anomalie est créé automatiquement.

20h00 — Dashboard CEO
Le CEO ouvre son dashboard : CA du jour (vérifié), taux de livraison, coût d'acquisition, stock critique, alertes actives. Toutes les données sont réelles, pas des estimations.


5.2 Fonctions principales de l'application

CRM & Commandes
Enregistrement des commandes (manuel ou import), suivi de statut en temps réel, historique client, gestion des réclamations, suivi des appels SAV.

Dispatch & Livraisons
Assignment des livreurs, vue carte zones, suivi GPS optionnel, confirmation de livraison mobile, gestion des retours et échecs.

Cash & Dépôts
Enregistrement des encaissements terrain, procédure de dépôt hub, vérification finance, réconciliation automatique, alertes d'écart.

Stock & Entrepôt
Gestion des emplacements, mouvements entrants/sortants, alertes seuils critiques, préparation des commandes, inventaire.

Finance & Trésorerie
Ledger append-only, réconciliation journalière, rapports financiers, gestion des décaissements, tableau de bord trésorerie.

Ads & Marketing
Suivi des campagnes par canal, ROAS par produit, coût d'acquisition, alertes budget, synchronisation avec performances ventes.

Achats & Fournisseurs
Gestion des bons de commande fournisseurs, suivi des expéditions (notamment Chine), réception, validation qualité.

Dashboard CEO
Vue consolidée temps réel, KPIs opérationnels et financiers, alertes prioritaires, tendances et comparatifs.




6. ORGANISATION PAR DÉPARTEMENTS


6.1 CEO / Direction

Rôle métier
Piloter l'entreprise avec des données réelles, décider vite, détecter les anomalies avant qu'elles deviennent des crises.

•	Vision consolidée de tous les départements en temps réel
•	Alertes proactives sur anomalies critiques
•	Comparatifs période sur période
•	Capacité de drill-down sur n'importe quelle métrique

Interface dédiée
Dashboard exécutif avec widgets personnalisables. Vue desktop prioritaire. Accès lecture seule sur tous les modules.

Données manipulées
•	CA du jour (livré, encaissé, vérifié)
•	Taux de livraison et d'échec
•	Cash en circulation (en transit, déposé, vérifié)
•	Stock critique et ruptures
•	Budget ads vs dépensé vs ROAS
•	Top produits, top livreurs, zones problématiques
•	Alertes actives et historique

Actions possibles
•	Consulter tous les dashboards en lecture
•	Valider des décisions exceptionnelles (dépassement budget, remise spéciale)
•	Exporter des rapports
•	Paramétrer des alertes personnalisées
•	Accéder à l'historique complet

Flux entrants
Données agrégées de tous les départements en temps réel

Flux sortants
Décisions, validations exceptionnelles, paramétrage des seuils

Tous les départements. Le dashboard CEO est le résultat de toutes les données remontées.

KPIs clés
•	CA vérifié J / CA vérifié M / CA vérifié trimestre
•	Taux de livraison (livré / dispatché)
•	Cash en transit (alerte si > 24h non déposé)
•	Taux d'annulation SAV
•	ROAS global
•	Rotation stock
•	Marge brute opérationnelle

Règles critiques
•	Aucun chiffre présenté comme CA avant vérification Finance
•	Les alertes CEO ont priorité maximale dans le système
•	Le CEO ne peut pas modifier de données opérationnelles (lecture seule opérationnel)




6.2 SAV / Call Center

Rôle métier
Point d'entrée des commandes clients, gestion des réclamations, suivi des dossiers, réactivation clients.

•	Enregistrer 100% des commandes entrantes sans perte
•	Résoudre les réclamations en moins de 24h
•	Maintenir un historique client complet
•	Fournir des données fiables au dispatch

Interface dédiée
Interface CRM orientée liste + formulaires. Vue commandes par statut. Fiche client complète. Historique d'appels. Suggestions produits.

Données manipulées
•	Fiches clients (nom, téléphone, adresse, historique)
•	Commandes (produit, quantité, adresse, créneaux)
•	Réclamations et tickets
•	Statuts de livraison (retour terrain)
•	Script d'appel et notes

Actions possibles
•	Créer une commande
•	Modifier une commande (avant dispatch)
•	Annuler une commande (avec motif obligatoire)
•	Créer un ticket réclamation
•	Ajouter une note client
•	Reprogrammer une livraison
•	Marquer un client VIP / blacklist

Flux entrants
•	Appels clients entrants
•	Retours d'échec de livraison (pour reprogrammation)
•	Stock disponible (pour confirmer avant enregistrement)

Flux sortants
•	Commandes validées vers OPS/Dispatch
•	Tickets escaladés vers management
•	Données clients vers CRM central

•	Stock (vérifier disponibilité avant confirmation)
•	OPS (transmettre les commandes confirmées)
•	Finance (informer des remboursements)

•	Taux de décroché
•	Temps de traitement moyen
•	Taux de confirmation commande
•	Taux d'annulation SAV
•	NPS client
•	Délai moyen résolution réclamation

Règles critiques
•	Aucune commande ne peut être confirmée si le produit est en rupture de stock
•	Toute annulation doit avoir un motif sélectionné dans une liste fermée
•	Un client blacklisté ne peut pas recevoir de nouvelle commande sans validation manager




6.3 OPS / Dispatch

Rôle métier
Orchestrer la logistique terrain : assignment des livreurs, optimisation des tournées, suivi en temps réel, gestion des exceptions.

•	0 commande non assignée à J+1 de sa confirmation
•	Maximiser le taux de livraison première tentative
•	Réagir en moins de 30 minutes à tout incident terrain

Interface dédiée
Vue carte avec livreurs et commandes. Liste de dispatch avec filtres zone/livreur/produit. Tableau de bord opérationnel temps réel.

Données manipulées
•	Commandes à dispatcher
•	Livreurs disponibles (statut, zone, charge actuelle)
•	Zones de livraison
•	Historique de performance livreur
•	Incidents et exceptions terrain

Actions possibles
•	Assigner une commande à un livreur
•	Réassigner en cas d'incident
•	Créer une tournée groupée
•	Clôturer une journée de dispatch
•	Générer le bon de livraison
•	Signaler un incident livreur
•	Bloquer un livreur (avec motif)

Flux entrants
•	Commandes confirmées depuis SAV
•	Disponibilité livreurs (depuis interface livreur)
•	Alertes terrain (depuis interface livreur)

Flux sortants
•	Assignments vers livreurs
•	Résultats terrain vers SAV (pour reprogrammations)
•	Données livraison vers Finance

•	SAV (source des commandes)
•	Livreurs (exécution)
•	Stock/Hub (disponibilité physique)
•	Finance (performance livraison pour réconciliation)

•	Taux de dispatch J0 (commande du jour livrée le jour même)
•	Taux de livraison première tentative
•	Nombre moyen de livraisons par livreur/jour
•	Délai moyen assignation → livraison
•	Taux de réassignation

Règles critiques
•	Un livreur ne peut pas recevoir plus de N commandes/jour (paramétrable)
•	Un livreur suspendu ne peut pas recevoir d'assignments
•	Toute réassignation doit être enregistrée avec motif




6.4 Livreurs / Terrain

Rôle métier
Livrer les commandes, encaisser le cash COD, déposer au hub, signaler les incidents.

•	Livrer le maximum de commandes assignées
•	Encaisser exactement le montant dû à chaque livraison
•	Déposer le cash dans les délais (max 24h)
•	Signaler tout incident en temps réel

Interface dédiée
Interface mobile ultra-simplifiée. Liste des livraisons du jour. Fiche livraison avec adresse + montant + actions. Bouton dépôt de cash. Zéro formation requise.

Données manipulées
•	Liste de livraisons assignées
•	Détails de chaque livraison (client, adresse, montant)
•	Statut de chaque livraison
•	Montants encaissés
•	Photos de preuve (optionnel)

Actions possibles
•	Confirmer une livraison réussie (avec montant encaissé)
•	Signaler un échec (avec motif : absent, refus, mauvaise adresse...)
•	Signaler un incident
•	Enregistrer un dépôt de cash
•	Demander une reprogrammation

Flux entrants
•	Assignments depuis OPS
•	Mises à jour d'adresse depuis SAV

Flux sortants
•	Confirmations de livraison → Stock, Finance, OPS
•	Encaissements → Finance
•	Dépôts → Finance, Hub
•	Incidents → OPS, SAV

•	OPS (source des assignments)
•	Hub (lieu de dépôt du cash)
•	Finance (réconciliation des encaissements)

•	Taux de livraison (livré / assigné)
•	Taux d'encaissement (encaissé / livré)
•	Délai moyen de dépôt
•	Écart encaissé / déposé
•	Score performance mensuel

Règles critiques
•	Impossible de marquer "livré" sans saisir le montant encaissé
•	Un dépôt doit être validé par le hub pour être comptabilisé
•	Tout écart encaissé/déposé > X FCFA génère une alerte automatique




6.5 Hub / Entrepôt

Rôle métier
Gérer le stock physique, préparer les commandes, réceptionner les dépôts de cash livreurs, valider les dépôts.

•	Stock physique = stock système à tout moment
•	0 commande préparée incorrectement
•	Validation de 100% des dépôts cash le jour même

Interface dédiée
Interface de gestion entrepôt. Vue par emplacement. Liste des commandes à préparer. Interface de réception de dépôts.

Données manipulées
•	Emplacements de stock
•	Mouvements de stock (entrée, sortie, ajustement)
•	Commandes à préparer
•	Dépôts livreurs (validation)
•	Inventaires

Actions possibles
•	Enregistrer une entrée de stock (réception fournisseur)
•	Préparer une commande (décrémentation stock)
•	Valider un dépôt livreur (avec montant vérifié)
•	Signaler un écart de stock
•	Déclencher un inventaire
•	Transférer entre hubs

Flux entrants
•	Réceptions fournisseurs (depuis Achats)
•	Commandes à préparer (depuis OPS)
•	Dépôts livreurs (depuis interface Livreur)

Flux sortants
•	Commandes préparées vers Dispatch
•	Validations dépôts vers Finance
•	Mouvements stock vers Stock/Inventaire

•	Précision de préparation (préparé juste / total préparé)
•	Délai moyen préparation commande
•	Taux de validation dépôt J0
•	Précision inventaire (stock physique vs système)

Règles critiques
•	Tout mouvement de stock doit être tracé avec opérateur + heure
•	Un dépôt ne peut être validé qu'avec un montant physiquement compté
•	Aucune sortie de stock sans commande associée (sauf ajustement inventaire avec validation manager)




6.6 Trésorerie / Finance

Rôle métier
Tracer tout le cash de l'entreprise, réconcilier les encaissements terrain, valider les dépôts, gérer les décaissements, produire les rapports financiers.

•	Cash tracé à 100% entre collecte et compte bancaire
•	Réconciliation quotidienne automatisée
•	0 dépôt non vérifié sous 24h
•	Rapports financiers disponibles J+1 au lieu de J+7

Interface dédiée
Dashboard financier temps réel. Ledger (journal) append-only. Interface de vérification dépôts. Rapports exportables.

Données manipulées
•	Ledger de transactions (append-only, immuable)
•	Dépôts livreurs (à vérifier)
•	Encaissements terrain vs CA attendu
•	Décaissements (fournisseurs, salaires, charges)
•	Soldes de trésorerie par compte/caisse

Actions possibles
•	Vérifier et valider un dépôt
•	Enregistrer un décaissement
•	Rapprocher des transactions
•	Générer un rapport financier
•	Signaler un écart
•	Clôturer une période
•	Exporter vers comptabilité externe

Flux entrants
•	Dépôts validés depuis Hub
•	Encaissements depuis Livreurs
•	Paiements fournisseurs depuis Achats
•	Dépenses depuis tous départements

Flux sortants
•	Rapports vers CEO
•	Confirmations paiement vers Achats
•	Données P&L vers Direction

•	Cash en transit (alerte si > 24h)
•	Écart réconciliation (cible : 0)
•	Délai moyen vérification dépôt
•	Taux de dépôts conformes
•	Trésorerie nette en temps réel

Règles critiques
•	Le ledger est append-only : aucune transaction ne peut être modifiée, seulement corrigée par une contre-écriture
•	Toute vérification de dépôt doit être réalisée par un agent Finance (pas Hub, pas Livreur)
•	Un CA n'est comptabilisé qu'après vérification Finance




6.7 Ads / Marketing

Rôle métier
Piloter les campagnes publicitaires, mesurer le retour sur investissement, allouer les budgets par produit/canal, éviter les dépenses sur ruptures.

•	ROAS (Return on Ad Spend) > seuil cible par produit
•	0 dépense sur produit en rupture de stock
•	Attribution précise des commandes aux campagnes
•	Alertes budgétaires proactives

Interface dédiée
Dashboard marketing avec métriques campagnes. Vue par canal (Facebook, TikTok, WhatsApp...). Intégration stock pour alertes ruptures.

Données manipulées
•	Dépenses par campagne/canal/produit
•	Commandes attribuées par source
•	ROAS par produit et campagne
•	Disponibilité stock par produit
•	Budget alloué vs consommé

Actions possibles
•	Enregistrer une dépense publicitaire
•	Associer une campagne à un produit
•	Consulter le ROAS en temps réel
•	Activer/désactiver manuellement une campagne
•	Recevoir une alerte rupture avant dépense
•	Exporter les rapports de performance

Flux entrants
•	Commandes et leur source (depuis SAV)
•	Stock disponible (depuis Stock)
•	Dépenses ads (saisie manuelle ou import)

Flux sortants
•	Données de coût d'acquisition vers Finance
•	Alertes vers CEO si ROAS < seuil

•	ROAS par produit / canal / campagne
•	Coût d'acquisition client (CAC)
•	Taux de conversion lead → commande confirmée
•	Budget consommé vs alloué (par produit)
•	Revenu attribué par source

Règles critiques
•	Si stock d'un produit = 0, alerte automatique vers Ads + blocage optionnel campagne
•	Le ROAS est calculé uniquement sur CA vérifié (pas sur commandes)
•	Aucune dépense ads n'est enregistrée sans produit et canal associés




6.8 Achats / Fournisseurs / Chine

Rôle métier
Gérer les relations fournisseurs, émettre les bons de commande, suivre les expéditions (notamment Chine → Afrique), réceptionner les marchandises.

•	Zéro rupture de stock imprévisible
•	Délai d'approvisionnement maîtrisé et suivi
•	Coût moyen pondéré des achats tracé
•	Fournisseurs évalués sur performance

Interface dédiée
Interface achats avec liste fournisseurs, bons de commande, suivi expéditions, réceptions.

Données manipulées
•	Fiches fournisseurs (contact, conditions, délais)
•	Bons de commande (produit, quantité, prix, délai)
•	Statuts expédition (commandé, en transit, dédouanement, livré)
•	Coûts d'import (transport, taxes, douane)
•	Historique achats

Actions possibles
•	Créer un bon de commande fournisseur
•	Mettre à jour le statut d'une expédition
•	Valider une réception (avec quantité et qualité)
•	Signaler un litige fournisseur
•	Évaluer un fournisseur
•	Générer une prévision d'achat

Flux entrants
•	Alertes stock critique (depuis Stock)
•	Prévisions de vente (depuis OPS/SAV)
•	Budget disponible (depuis Finance)

Flux sortants
•	Bons de commande vers fournisseurs
•	Notifications réception vers Hub/Stock
•	Coûts d'achat vers Finance

•	Délai moyen fournisseur (commande → réception)
•	Taux de conformité réception (quantité et qualité)
•	Coût moyen pondéré par produit
•	Taux de rupture imputable aux achats

Règles critiques
•	Aucun paiement fournisseur sans bon de commande approuvé
•	Toute réception doit être validée physiquement au hub
•	Un litige fournisseur bloque les paiements futurs jusqu'à résolution




6.9 Stock / Inventaire

Rôle métier
Maintenir l'exactitude du stock en temps réel, gérer les emplacements, prévenir les ruptures, suivre les mouvements.

•	Précision inventaire > 99%
•	Alerte rupture avant le dernier article
•	Zéro vente sur produit épuisé
•	Traçabilité complète de chaque mouvement

Interface dédiée
Interface entrepôt par emplacement. Vue globale des niveaux de stock. Historique des mouvements. Alertes configurables.

Données manipulées
•	SKUs et variantes produit
•	Niveaux de stock par emplacement/hub
•	Mouvements (entrées, sorties, transferts, ajustements)
•	Seuils d'alerte par produit
•	Inventaires périodiques

Actions possibles
•	Consulter le stock en temps réel
•	Enregistrer un ajustement d'inventaire
•	Configurer les seuils d'alerte
•	Déclencher un comptage
•	Valider un inventaire
•	Visualiser l'historique des mouvements

Flux entrants
•	Réceptions fournisseurs (depuis Achats)
•	Sorties commandes (depuis Hub/Dispatch)
•	Retours (depuis Livreurs)
•	Ajustements (depuis Hub)

Flux sortants
•	Disponibilité vers SAV (blocage confirmation)
•	Disponibilité vers Ads (blocage campagnes)
•	Alertes rupture vers Achats et CEO
•	Données valorisation stock vers Finance

•	Précision inventaire (physique vs système)
•	Taux de rupture (jours de rupture / jours actifs)
•	Rotation de stock par produit
•	Valeur totale du stock

Règles critiques
•	Aucune décrémentation sans commande ou motif tracé
•	Toute rupture génère une alerte immédiate vers Achats + CEO
•	Les ajustements d'inventaire nécessitent validation manager




6.10 Expéditions Intérieur

Rôle métier
Gérer les expéditions entre hubs, les transferts de stock inter-villes, les livraisons grandes distances.

•	Traçabilité complète des expéditions intérieures
•	Délais respectés et documentés
•	0 perte de marchandise sans traçabilité

Interface dédiée
Module dédié aux expéditions inter-hubs. Bons de transport. Suivi de statut.

Données manipulées
•	Bons d'expédition (hub source, hub destination, produits, quantités)
•	Transporteurs et véhicules
•	Statuts (préparé, en transit, livré, réceptionné)
•	Documents de transport

•	Délai moyen expédition inter-hub
•	Taux de conformité réception (quantité envoyée = quantité reçue)
•	Incidents de transport




6.11 Abonnements

Rôle métier
Gérer les clients avec des commandes récurrentes, les contrats de service, les renouvellements.

•	0 abonnement en retard de renouvellement sans alerte
•	Historique complet des paiements
•	Alertes proactives avant expiration

Interface dédiée
Vue liste des abonnements actifs/expirés/à renouveler. Fiche abonnement. Historique paiements.

Données manipulées
•	Clients abonnés
•	Plans et tarifs
•	Dates de début/fin
•	Historique paiements
•	Statuts de renouvellement

•	MRR (Monthly Recurring Revenue)
•	Taux de churn
•	Taux de renouvellement
•	Délai moyen de renouvellement




7. MACHINES À ÉTATS


7.1 Cycle Commande


BROUILLON
   ↓ [Agent SAV confirme stock + valide]
CONFIRMÉE
   ↓ [Dispatcher assigne un livreur]
ASSIGNÉE
   ↓ [Livreur démarre la tournée]
EN_LIVRAISON
   ↓ [Livreur confirme livraison + montant]          ↓ [Livreur signale échec]
LIVRÉE                                              ÉCHEC_LIVRAISON
   ↓ [Finance vérifie encaissement]                     ↓ [SAV reprogramme]
ENCAISSÉE                                          REPROGRAMMÉE → ASSIGNÉE
   ↓ [Hub valide dépôt]
DÉPOSÉE
   ↓ [Finance vérifie dépôt]
VÉRIFIÉE ✓ (= CA réel comptabilisé)


États complets :

État	Description	Propriétaire
BROUILLON	Saisie en cours par SAV	SAV
CONFIRMÉE	Stock validé, commande prête à dispatcher	SAV
ASSIGNÉE	Livreur désigné	OPS
EN_LIVRAISON	Livreur en route	Livreur
LIVRÉE	Livraison confirmée terrain	Livreur
ECHEC_LIVRAISON	Non livrée (absent, refus, erreur adresse...)	Livreur
ANNULÉE	Annulée par SAV ou manager	SAV/Manager
REPROGRAMMÉE	Nouvel essai planifié	SAV
ENCAISSÉE	Cash collecté enregistré	Livreur
DÉPOSÉE	Cash déposé au hub	Hub
VÉRIFIÉE	Cash confirmé par Finance	Finance


Transitions interdites :
•	Impossible de passer de CONFIRMÉE directement à LIVRÉE (doit passer par ASSIGNÉE + EN_LIVRAISON)
•	Impossible de passer à VÉRIFIÉE sans DÉPOSÉE préalable
•	Une commande ANNULÉE ne peut pas être rouvertée (doit être recréée)

Exceptions :
•	Livraison partielle : état PARTIELLEMENT_LIVRÉE avec gestion des articles restants
•	Retour client : état RETOURNÉE avec réintégration stock




7.2 Cycle Cash


CASH_COLLECTÉ (par livreur à la livraison)
   ↓ [Livreur enregistre dans son interface]
CASH_ENREGISTRÉ
   ↓ [Livreur remet au hub à la fin de tournée]
CASH_REMIS_HUB
   ↓ [Hub compte et valide le montant]
CASH_VALIDÉ_HUB
   ↓ [Finance effectue la vérification comptable]
CASH_VÉRIFIÉ_FINANCE ✓
   ↓ [Virement ou dépôt bancaire]
CASH_DÉPOSÉ_BANQUE


Règle critique :
L'écart entre CASH_COLLECTÉ et CASH_VALIDÉ_HUB doit être ≤ seuil défini (ex: 500 FCFA). Tout écart supérieur génère un ticket d'anomalie automatique.




7.3 Cycle Dépôt


DÉPÔT_INITIÉ (livreur déclare vouloir déposer)
   ↓ [Hub prépare la réception]
DÉPÔT_EN_COURS
   ↓ [Comptage physique cash par hub]
DÉPÔT_COMPTÉ
   ↓ [Hub valide le montant dans le système]
DÉPÔT_VALIDÉ_HUB
   ↓ [Finance vérifie et rapproche avec livraisons]
DÉPÔT_VÉRIFIÉ_FINANCE ✓





7.4 Cycle Abonnement


ABONNEMENT_CRÉÉ
   ↓ [Paiement initial validé]
ABONNEMENT_ACTIF
   ↓ [J-7 avant expiration]
EN_PRÉAVIS_RENOUVELLEMENT (alerte automatique)
   ↓ [Paiement renouvellement reçu]     ↓ [Pas de paiement à J0]
RENOUVELÉ → ABONNEMENT_ACTIF           EXPIRÉ
                                           ↓ [Tentative de réactivation]
                                        EN_RÉACTIVATION
                                           ↓ [Paiement reçu]
                                        ABONNEMENT_ACTIF





7.5 Cycle Transaction (Ledger)


TRANSACTION_INITIÉE
   ↓ [Validation par système ou opérateur]
TRANSACTION_VALIDÉE
   ↓ [Comptabilisée dans le ledger]
TRANSACTION_COMPTABILISÉE (append-only, immuable)
   
[En cas d'erreur]
TRANSACTION_COMPTABILISÉE + CONTRE-ÉCRITURE_CRÉÉE (jamais de modification)


Règle fondamentale du ledger :
Le ledger financier est IMMUABLE. Aucune transaction ne peut être modifiée ou supprimée. Les corrections se font exclusivement par contre-écriture (débit/crédit compensatoire) avec motif obligatoire.




7.6 Cycle Expédition


EXPÉDITION_CRÉÉE (bon de transport généré)
   ↓ [Chargement validé au hub source]
EXPÉDITION_CHARGÉE
   ↓ [Départ transporteur]
EN_TRANSIT
   ↓ [Arrivée hub destination déclarée]
ARRIVÉE_DÉCLARÉE
   ↓ [Réception physique et comptage]
RÉCEPTIONNÉE
   ↓ [Validation quantité et qualité]
VALIDÉE ✓    OU    LITIGE (écart ou dommage)











8. RÔLES ET PERMISSIONS


8.1 Matrice RBAC (Role-Based Access Control)


Module	CEO	SAV_AGENT	SAV_MANAGER	DISPATCHER	LIVREUR	HUB_MANAGER	FINANCE	ADS	ACHATS	STOCK
Dashboard CEO	R	-	-	-	-	-	R	-	-	-
Commandes	R	CRUD	CRUD	R	R(own)	R	R	R	-	-
Clients	R	CRUD	CRUD	R	-	-	R	R	-	-
Dispatch	R	R	R	CRUD	R(own)	R	-	-	-	-
Livraisons	R	R	R	R	CU(own)	R	R	-	-	-
Cash/Dépôts	R	-	-	-	C(own)	CU	CRUD	-	-	-
Finance/Ledger	R	-	-	-	-	R	CRUD	R	R	-
Stock	R	R	R	R	-	CRUD	R	R	R	CRUD
Ads/Marketing	R	-	-	-	-	-	R	CRUD	-	-
Achats	R	-	-	-	-	R	R	-	CRUD	R
Abonnements	R	CRUD	CRUD	-	-	-	R	-	-	-
Paramètres	RU	-	-	-	-	-	-	-	-	-
Utilisateurs	CRUD	-	-	-	-	-	-	-	-	-


R=Read, C=Create, U=Update, D=Delete, CRUD=Tous droits, (own)=seulement ses propres données


8.2 Rôles système

SUPER_ADMIN : Accès total, configuration multi-tenant, gestion des instances
CEO : Lecture totale, validations exceptionnelles, paramétrage alertes
MANAGER : Accès total département + lecture inter-départements
AGENT : Accès opérationnel limité à son département
LIVREUR : Accès mobile uniquement, données propres


8.3 Règles RBAC critiques

•	Un livreur ne voit QUE ses propres livraisons et encaissements
•	Un agent SAV ne peut pas modifier une commande après dispatch
•	Seul Finance peut valider un dépôt (jamais Hub seul)
•	Les exports financiers sont réservés aux rôles Finance et CEO
•	La suppression de données est impossible pour tous (soft-delete uniquement)







9. RÈGLES MÉTIER CRITIQUES


9.1 Règles de commandes

R-CMD-001 : Une commande ne peut être confirmée que si le produit a un stock disponible ≥ quantité commandée.

R-CMD-002 : Toute annulation de commande doit avoir un motif parmi : [Doublon, Client injoignable, Client a annulé, Produit indisponible, Adresse incorrecte, Hors zone, Autre (avec description)].

R-CMD-003 : Une commande ne peut être modifiée après dispatch que par un SAV Manager ou supérieur.

R-CMD-004 : Un client blacklisté génère une alerte automatique à la création d'une nouvelle commande.


9.2 Règles de livraison

R-LIV-001 : Un livreur ne peut confirmer une livraison sans saisir le montant exact encaissé.

R-LIV-002 : Un échec de livraison doit spécifier le motif parmi une liste fermée.

R-LIV-003 : Une livraison ne peut pas être marquée "livrée" depuis une zone géographique incompatible avec l'adresse de livraison (si GPS activé).

R-LIV-004 : Le délai maximum entre livraison et dépôt cash est de 24h. Passé ce délai, alerte automatique.





9.3 Règles financières

R-FIN-001 : Le ledger financier est IMMUABLE. Toute correction passe par une contre-écriture.

R-FIN-002 : Un CA n'est comptabilisé qu'après statut VÉRIFIÉE (Finance a validé le dépôt).

R-FIN-003 : Tout écart entre cash attendu (livraisons confirmées) et cash déposé > seuil (paramétrable, ex: 1000 FCFA) génère un ticket d'anomalie automatique.

R-FIN-004 : Aucun décaissement fournisseur sans bon de commande approuvé.


9.4 Règles stock

R-STK-001 : Quand le stock d'un produit tombe sous le seuil d'alerte, notification automatique à Achats + CEO.

R-STK-002 : Quand le stock = 0, blocage automatique des nouvelles commandes SAV pour ce produit.

R-STK-003 : Tout mouvement de stock est tracé : opérateur, heure, type, référence commande associée.

R-STK-004 : Un ajustement d'inventaire (modification manuelle de stock) nécessite validation d'un manager.


9.5 Règles ads

R-ADS-001 : Quand stock produit = 0, alerte automatique vers responsable Ads.

R-ADS-002 : Quand budget campagne > 90% consommé, alerte automatique.

R-ADS-003 : ROAS calculé exclusivement sur CA vérifié (pas sur commandes en cours).




10. KPIs ET ALERTES


10.1 KPIs opérationnels


KPI	Formule	Fréquence	Alerte
Taux de livraison	Livrées / Assignées × 100	Temps réel	< 70%
Taux d'encaissement	Encaissé / Livré × 100	Temps réel	< 95%
Cash en transit	∑ cash livreurs non déposés	Temps réel	> 24h
Précision stock	Stock physique / Stock système	Quotidien	< 98%
Délai dispatch	Heure confirmation → Heure livraison	J	> objectif
Taux de première tentative	1ère livraison OK / total	J	< 75%















10.2 KPIs financiers


KPI	Formule	Fréquence	Alerte
CA vérifié J	∑ montants statut VÉRIFIÉE	Quotidien	Var > 20% vs J-7
CA vérifié M	∑ CA vérifié du mois	Mensuel	Var > 15% vs M-1
Marge brute	CA vérifié - coût achat - coût livraison	Mensuel	< seuil cible
Trésorerie nette	Total entrées - Total sorties	Temps réel	< seuil sécurité
Écart réconciliation	Cash attendu - Cash déposé vérifié	Quotidien	> 0 FCFA



10.3 KPIs marketing


KPI	Formule	Fréquence	Alerte
CAC	Dépenses Ads / Nouveaux clients acheteurs	Hebdo	> seuil cible
ROAS	CA vérifié attribué / Dépenses Ads	Temps réel	< seuil cible
Taux conv. lead	Commandes confirmées / Contacts entrants	Quotidien	< 30%
Budget consommé	Dépenses / Budget alloué × 100	Quotidien	> 90%



10.4 Système d'alertes

Niveau CRITIQUE (rouge) — Action immédiate requise
•	Cash en transit > 48h sans dépôt
•	Écart de caisse > seuil critique
•	Stock produit = 0 avec commandes actives
•	Livreur non connecté depuis > 4h pendant tournée active
•	Tentative d'accès non autorisé

Niveau ATTENTION (orange) — Action requise dans 4h
•	Stock produit < seuil alerte
•	Cash en transit > 24h
•	Budget ads > 90% consommé
•	ROAS < seuil sur 3 jours consécutifs
•	Taux de livraison < 70% sur la journée

Niveau INFO (bleu) — À surveiller
•	Nouveau client VIP créé
•	Commande > montant élevé
•	Fournisseur livraison confirmée
•	Rapport journalier disponible


10.5 Canal des alertes

Les alertes sont délivrées via :
•	Notification in-app (temps réel, tous rôles)
•	Email (alertes critiques et rapports)
•	WhatsApp/SMS (alertes critiques terrain — phase 2)






11. ARCHITECTURE FONCTIONNELLE


11.1 Vue d'ensemble

SHEVA OS est organisé en couches qui communiquent verticalement :


[UTILISATEURS / INTERFACES]
CEO · SAV · OPS · Livreur · Hub · Finance · Ads · Achats · Stock

[FRONTEND — Next.js App Router]
Pages · Server Actions · Server Components · Client Components

[BACKEND — Supabase]
PostgreSQL · RLS · RPC · Triggers · Realtime · Edge Functions

[DONNÉES — Ledger + State Machines]
Commandes · Cash · Stock · Finance · Alertes · Logs


Chaque département dispose d'une interface dédiée qui lit et écrit dans le même backend central. Aucune donnée ne vit en dehors de Supabase. Aucun département ne contient sa propre base de données. La connexion entre tous les modules passe par les tables partagées et les clés étrangères.


11.2 Flux de données principal


CLIENT
  │ (appel/web)
  ▼
SAV AGENT ──────────────────────────────► STOCK CHECK
  │ (commande créée)                        (disponible?)
  ▼
COMMANDE CONFIRMÉE ──────────────────────────────────►
  │
  ▼
OPS DISPATCHER ─────────────────────────► LIVREUR ASSIGNÉ
                                               │
                                         (livraison terrain)
                                               │
                                         LIVRAISON CONFIRMÉE
                                               │
                                         HUB (dépôt cash)
                                               │
                                         FINANCE (vérification)
                                               │
                                         CA VÉRIFIÉ → LEDGER
                                               │
                                         CEO DASHBOARD



11.3 Principes d'intégration inter-départements

Chaque module expose des événements. Chaque événement alimente les autres modules sans couplage direct. La commande confirmée déclenche la réservation stock. La livraison confirmée déclenche l'encaissement. La vérification Finance déclenche l'écriture ledger et la mise à jour du CA vérifié dans le dashboard CEO. Ce sont des triggers PostgreSQL et des RPC, pas des appels API chaînés.




12. PLAN COMPLET DE L'APPLICATION


12.1 Arborescence globale


/
├── (auth)
│   ├── /login
│   ├── /forgot-password
│   └── /reset-password
│
└── (dashboard)
    ├── /dashboard
    ├── /orders
    ├── /orders/new
    ├── /orders/[id]
    ├── /orders/[id]/edit
    ├── /customers
    ├── /customers/new
    ├── /customers/[id]
    ├── /dispatch
    ├── /dispatch/map
    ├── /dispatch/plan
    ├── /deliveries
    ├── /deliveries/[id]
    ├── /driver/deliveries
    ├── /driver/deliveries/[id]
    ├── /driver/deposit
    ├── /hub/deposits
    ├── /hub/deposits/[id]
    ├── /hub/stock
    ├── /stock/products
    ├── /stock/products/[id]
    ├── /stock/movements
    ├── /stock/inventory
    ├── /stock/alerts
    ├── /finance
    ├── /finance/ledger
    ├── /finance/deposits
    ├── /finance/deposits/[id]
    ├── /finance/reconciliation
    ├── /finance/reports
    ├── /finance/disbursements
    ├── /ads
    ├── /ads/campaigns
    ├── /ads/campaigns/[id]
    ├── /ads/performance
    ├── /ads/budget
    ├── /purchases/suppliers
    ├── /purchases/suppliers/[id]
    ├── /purchases/orders
    ├── /purchases/orders/[id]
    ├── /purchases/shipments
    ├── /subscriptions
    ├── /subscriptions/[id]
    ├── /shipments
    ├── /alerts
    └── /settings/company
        /settings/users
        /settings/zones
        /settings/thresholds
        /settings/integrations





12.2 Détail des pages critiques

PAGE /login
Objectif : Authentifier l'utilisateur et rediriger vers son interface selon son rôle.
Données affichées : Formulaire email + mot de passe.
Actions : Se connecter, Mot de passe oublié.
Tables Supabase : auth.users, user_profiles.
Server Action : signIn() → Supabase Auth → lecture rôle → redirect conditionnel.
Retour : Redirect vers /dashboard ou /driver selon rôle. Toast erreur si identifiants invalides.

PAGE /dashboard
Objectif : Tableau de bord exécutif consolidé. Vue temps réel des KPIs clés.
Données affichées : CA vérifié J/M, cash en transit, taux de livraison, stock critique, alertes actives, courbe CA 30 jours, top 5 produits.
Actions : Drill-down sur widgets, export rapport, accéder alertes.
Rôles autorisés : CEO, MANAGER.
Tables : Vues SQL agrégées (v_daily_revenue, v_cash_in_transit, v_delivery_metrics).
RPC : get_dashboard_metrics(date_from, date_to).
Realtime : Subscription sur alerts pour notifications live.

PAGE /orders
Objectif : Liste paginée de toutes les commandes avec filtres avancés.
Données affichées : Tableau ID, client, produit(s), montant, statut, zone, livreur, date. Filtres statut/date/zone/livreur. Compteurs par statut.
Actions : Créer commande, voir détail, changer statut selon rôle, exporter.
Rôles : SAV, OPS, CEO, FINANCE (lecture).
Tables : orders, customers, products, deliveries, users.

PAGE /orders/new
Objectif : Créer une nouvelle commande.
Données : Formulaire client (recherche existant ou nouveau), produit avec vérification stock live, adresse, créneau, montant COD, notes. Indicateur disponibilité stock temps réel.
Actions : Confirmer commande, Sauvegarder brouillon, Annuler.
Rôles : SAV_AGENT, SAV_MANAGER.
RPC : create_order_with_stock_check(order_data) — transaction atomique.
Règles : Blocage si stock = 0. Alerte si client blacklisté.
Retour : Redirect vers /orders/[id] avec toast succès ou toast erreur si stock insuffisant.

PAGE /orders/[id]
Objectif : Vue complète d'une commande avec timeline des événements.
Données : Statut actuel coloré, montant, client, produit(s), livreur assigné, timeline d'événements horodatés, section cash (attendu/encaissé/déposé/vérifié), notes.
Actions : Selon rôle et statut : Assigner, Modifier, Annuler, Reprogrammer, Voir reçu.
Tables : orders, order_events, deliveries, cash_collections, deposits.

PAGE /dispatch
Objectif : Interface principale du dispatcher pour gérer les assignments.
Données : Liste commandes CONFIRMÉES non assignées (gauche). Liste livreurs disponibles avec charge actuelle (droite). Drag & drop pour assignment.
Actions : Assigner commande à livreur, Grouper en tournée, Lancer dispatch.
Rôles : DISPATCHER, OPS_MANAGER, CEO.
RPC : bulk_assign_deliveries(assignments[]) — transaction atomique.

PAGE /driver/deliveries
Objectif : Interface mobile livreur — liste des livraisons du jour.
Données : Liste simplifiée client/adresse/montant/statut. Total encaissé de la journée.
Actions : Confirmer livraison (avec montant), Signaler échec (avec motif), Appeler client, Déposer cash.
Rôles : LIVREUR uniquement. RLS : WHERE driver_id = auth.uid().
Server Actions : confirmDelivery(deliveryId, amountCollected), reportFailure(deliveryId, reason).

PAGE /driver/deposit
Objectif : Déclarer un dépôt de cash au hub.
Données : Total cash collecté non déposé, détail par livraison, champ montant, sélection hub.
Server Action : createDeposit(driverId, amount, hubId) → statut DÉPÔT_INITIÉ → notifie Hub.

PAGE /hub/deposits
Objectif : Hub valide les dépôts annoncés par les livreurs.
Données : Liste dépôts INITIÉ/EN_COURS. Livreur, montant déclaré, heure.
Actions : Ouvrir fiche, Valider avec montant compté, Signaler écart.
Server Action : validateDeposit(depositId, countedAmount) → si écart > seuil : ticket anomalie → sinon : statut VALIDÉ_HUB → notifie Finance.

PAGE /finance/deposits
Objectif : Finance vérifie et comptabilise les dépôts validés Hub.
Données : Dépôts en statut VALIDÉ_HUB, montant hub, livraisons associées, écart attendu.
Actions : Vérifier dépôt, Comptabiliser dans ledger, Signaler anomalie.
RPC : verify_and_ledger_deposit(depositId, verifiedAmount) — atomique : statut VÉRIFIÉ + écriture ledger.

PAGE /finance/ledger
Objectif : Journal comptable append-only. Source de vérité financière.
Données : Tableau chronologique date/type/description/débit/crédit/solde. Filtres période/type.
Actions : Consulter (lecture seule), Exporter, Créer contre-écriture (Finance Manager uniquement).
Rôles : FINANCE, CEO (lecture). Aucune modification possible. Insert uniquement via RPC sécurisée.

PAGE /stock/products
Objectif : Catalogue produits avec niveaux de stock en temps réel.
Données : SKU, nom, stock total, disponible, réservé, seuil alerte, valeur. Indicateurs couleur vert/orange/rouge.
Actions : Voir fiche, Modifier seuils, Déclencher commande achat, Ajustement inventaire.
Tables : products, stock_levels, stock_alerts_config.

PAGE /ads/campaigns
Objectif : Suivi des performances publicitaires par campagne.
Données : Campagne, canal, produit, dépenses, commandes attribuées, CA vérifié, ROAS. Alerte si produit en rupture.
Rôles : ADS_MANAGER, CEO.
Tables : campaigns, campaign_expenses, orders.

PAGE /purchases/orders
Objectif : Gérer les bons de commande fournisseurs.
Données : BC#, fournisseur, produits, quantités, montant, statut, délai prévu.
Statuts : Brouillon, Approuvé, En Transit, Reçu, Annulé.
Server Action : approvePurchaseOrder(id) → notifie Finance pour paiement.

PAGE /settings/users
Objectif : Gérer les utilisateurs, rôles et permissions.
Données : Liste utilisateurs avec rôle, statut, dernière connexion.
Actions : Créer utilisateur, Modifier rôle, Désactiver, Réinitialiser mot de passe.
Rôles autorisés : CEO, SUPER_ADMIN.


12.3 Navigation par rôle

Sidebar CEO/MANAGER : Dashboard → Commandes → Clients → Dispatch → Livraisons → Stock → Finance → Ads → Achats → Abonnements → Alertes → Paramètres.

Sidebar SAV : Commandes → Clients → Tickets SAV → Abonnements.

Sidebar OPS/Dispatcher : Dispatch → Livraisons → Livreurs → Carte.

Interface Livreur (mobile) : Mes livraisons → Déposer cash → Mon profil.

Sidebar Hub : Dépôts à valider → Stock entrepôt → Préparation commandes.

Sidebar Finance : Ledger → Dépôts à vérifier → Réconciliation → Rapports → Décaissements.

Sidebar Ads : Dashboard Ads → Campagnes → Performance → Budget.

Sidebar Achats : Fournisseurs → Bons de commande → Expéditions → Réceptions.


12.4 Structure Next.js recommandée


src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              ← Layout avec sidebar conditionnelle par rôle
│   │   ├── dashboard/page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── customers/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── dispatch/
│   │   │   ├── page.tsx
│   │   │   └── map/page.tsx
│   │   ├── driver/
│   │   │   ├── deliveries/page.tsx
│   │   │   ├── deliveries/[id]/page.tsx
│   │   │   └── deposit/page.tsx
│   │   ├── hub/
│   │   │   ├── deposits/page.tsx
│   │   │   └── stock/page.tsx
│   │   ├── stock/
│   │   │   ├── products/page.tsx
│   │   │   ├── movements/page.tsx
│   │   │   └── inventory/page.tsx
│   │   ├── finance/
│   │   │   ├── page.tsx
│   │   │   ├── ledger/page.tsx
│   │   │   ├── deposits/page.tsx
│   │   │   ├── reconciliation/page.tsx
│   │   │   └── reports/page.tsx
│   │   ├── ads/
│   │   │   ├── page.tsx
│   │   │   └── campaigns/page.tsx
│   │   ├── purchases/
│   │   │   ├── suppliers/page.tsx
│   │   │   └── orders/page.tsx
│   │   ├── subscriptions/page.tsx
│   │   ├── alerts/page.tsx
│   │   └── settings/
│   │       ├── users/page.tsx
│   │       └── thresholds/page.tsx
│   ├── api/webhooks/route.ts
│   └── middleware.ts               ← Protège toutes les routes dashboard
│
├── features/                       ← Logique métier par domaine
│   ├── orders/
│   │   ├── actions.ts              ← Server Actions
│   │   ├── queries.ts              ← Requêtes Supabase
│   │   ├── types.ts
│   │   ├── validations.ts          ← Schémas Zod
│   │   └── components/
│   ├── deliveries/
│   ├── stock/
│   ├── finance/
│   ├── dispatch/
│   ├── ads/
│   └── purchases/
│
├── components/
│   ├── ui/                         ← Shadcn components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MobileNav.tsx
│   ├── shared/
│   │   ├── DataTable.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── AlertBanner.tsx
│   │   ├── StatCard.tsx
│   │   ├── Timeline.tsx
│   │   └── ConfirmDialog.tsx
│   └── forms/
│       ├── OrderForm.tsx
│       └── DepositForm.tsx
│
├── core/
│   ├── supabase/
│   │   ├── client.ts               ← Client browser
│   │   ├── server.ts               ← Client serveur
│   │   └── middleware.ts
│   ├── auth/
│   │   ├── roles.ts                ← Définitions RBAC
│   │   └── guards.ts
│   └── constants/
│       ├── order-statuses.ts
│       └── alert-levels.ts
│
└── lib/
    ├── utils.ts
    ├── formatters.ts               ← Formatage FCFA, dates
    └── validators.ts





13. ARCHITECTURE TECHNIQUE COMPLÈTE


13.1 Frontend

Framework : Next.js 14+ (App Router)
L'App Router est utilisé exclusivement. Les Server Components sont le mode par défaut — ils fetchen les données directement depuis Supabase sans passer par une API intermédiaire. Les Client Components (marqués 'use client') sont uniquement utilisés pour les interactions utilisateur (formulaires, état de filtre, subscriptions Realtime). Les Server Actions gèrent toutes les mutations de données. Le streaming Next.js et les composants Suspense gèrent les états de chargement.

TypeScript strict. Aucun any dans le code de production. Les types sont générés depuis le schéma Supabase via la commande : npx supabase gen types typescript.

Tailwind CSS + Shadcn UI. Design system cohérent basé sur Shadcn pour les composants de base. Variables CSS pour le theming. Responsive mobile-first pour les interfaces terrain, desktop-first pour administration.

React Hook Form + Zod. Validation côté client et côté serveur avec le même schéma Zod. Gestion granulaire des erreurs de validation. Jamais de validation uniquement côté client.

État global minimal. Zustand pour les préférences UI légères (filtres actifs, sidebar ouverte/fermée). Pas de Redux. Les Server Components gèrent la majorité de l'état applicatif.


13.2 Backend — Supabase

PostgreSQL 15+ via Supabase. Schéma unique public pour toutes les données métier. Extensions activées : uuid-ossp, pgcrypto, pg_stat_statements.

Row Level Security (RLS) — non négociable. RLS activé sur toutes les tables sans exception. Aucune table n'est accessible sans policy explicite. Les policies sont basées sur auth.uid() et le rôle dans user_profiles.

Exemple de policy livreur :

CREATE POLICY "drivers_see_own_deliveries" ON deliveries
FOR SELECT USING (driver_id = auth.uid());


RPC (Remote Procedure Calls) — pour toutes les actions critiques.
Les opérations touchant plusieurs tables sont des fonctions PostgreSQL exposées via l'API Supabase. Exemples : create_order_with_stock_check, confirm_delivery, verify_and_ledger_deposit, get_dashboard_metrics, reconcile_daily_cash. Ces fonctions sont des transactions atomiques : tout réussit ou tout échoue ensemble.

Triggers PostgreSQL — pour la cohérence automatique.
after_order_confirmed : décrémente le stock réservé.
after_delivery_confirmed : crée l'entrée cash_collections, met à jour le statut commande.
after_deposit_verified : écrit dans le ledger, met à jour le CA vérifié.
check_stock_alert : après update stock_levels, si stock < seuil → insert dans alerts.

Vues SQL — pour les performances dashboard.
v_daily_revenue : CA vérifié agrégé par jour.
v_cash_in_transit : cash non déposé par livreur.
v_delivery_metrics : taux de livraison par zone et livreur.
v_stock_status : niveaux de stock avec indicateur d'alerte.

Realtime — pour les mises à jour live.
Subscriptions Supabase Realtime sur les tables alerts, orders, deliveries. Le dashboard CEO reçoit les alertes et les mises à jour de KPIs sans rafraîchissement manuel.

Edge Functions — pour les traitements asynchrones.
process-daily-reconciliation : lancée chaque soir à 23h30 via cron.
send-alert-notifications : triggered par insert dans alerts, envoie les emails.
generate-daily-report : rapport PDF automatique J+1.


13.3 Dev et Versionning — GitHub

Structure de branches :
main : production stable, déploiement automatique.
develop : intégration continue, tests.
feature/[nom] : chaque nouvelle fonctionnalité.
fix/[nom] : corrections de bugs.
hotfix/[nom] : corrections urgentes directement depuis main.

Conventions de commit (Conventional Commits) :
feat(orders): add bulk assignment to dispatch.
fix(finance): correct ledger balance calculation.
chore(db): add migration for deposit validation.
docs(api): document RPC create_order.

Pull Request rules. Minimum 1 reviewer pour les branches feature. Tests CI obligatoires avant merge. Lint + TypeScript check bloquants. Les migrations SQL doivent être reviewées par le tech lead.

GitHub Actions CI :
Sur chaque push et PR : ESLint, TypeScript check (tsc --noEmit), tests Vitest.
Sur merge vers main : build Next.js, déploiement automatique Hostinger.


13.4 Hébergement — Hostinger

VPS Hostinger recommandé. Configuration minimale : 4 vCPU, 8GB RAM, 100GB SSD NVMe. OS : Ubuntu 22.04 LTS. Node.js 20 LTS. PM2 pour process management. Nginx comme reverse proxy.

Variables d'environnement obligatoires :

NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx     (jamais exposé côté client)
NEXT_PUBLIC_APP_URL=https://app.sheva-os.com
NODE_ENV=production


Build et déploiement :
npm run build puis pm2 start ecosystem.config.js.
Le fichier ecosystem.config.js configure le process Next.js sur le port 3000.
Nginx redirige le port 443 (SSL) vers le port 3000.

SSL : Let's Encrypt via Certbot. Renouvellement automatique.
Domaine : DNS configuré sur Hostinger. A record vers l'IP du VPS.




14. DIRECTIVES DE CONNEXION FIGMA + NEXT.JS + SUPABASE


14.1 Rôle de Figma

Figma est la source de vérité du design. Aucun écran ne peut être développé sans avoir été d'abord designé dans Figma.



Organisation du fichier Figma :
Le fichier est organisé en quatre sections : Foundations (couleurs, typographie, spacing, icônes), Components (boutons, inputs, badges, cartes, tableaux, sidebar, modals, toasts), Mobile Screens (interface livreur), Desktop Screens (tous les autres départements, un frame par page).

Conventions de nommage Figma :
Frames : [Rôle] / [Section] / [Page] → exemple : CEO / Dashboard / Main.
Components : [Catégorie] / [Nom] / [Variante] → exemple : Badge / Order Status / Confirmed.
Chaque frame correspond à une route Next.js.

États à designer pour chaque écran :
État normal avec données réelles (pas de Lorem Ipsum), état vide (empty state avec illustration et CTA), état d'erreur, état de chargement (skeleton), versions mobile et desktop si applicable.


14.2 Rôle de Next.js

Next.js est le pont entre le design et les données.

Règle de correspondance Figma → Next.js :
Chaque frame Figma nommée "CEO / Dashboard / Main" devient app/(dashboard)/dashboard/page.tsx.
Chaque frame "SAV / Orders / New" devient app/(dashboard)/orders/new/page.tsx.

Server vs Client Components :
Les pages sont des Server Components qui fetchent les données directement via le client Supabase server. Les composants interactifs (formulaires, filtres, tableaux avec tri) sont des Client Components marqués 'use client'.

Server Actions — le pont mutations frontend/backend :

'use server'
export async function createOrder(formData: FormData) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autorisé' }
  const parsed = orderSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.flatten() }
  const { data, error } = await supabase.rpc('create_order_with_stock_check', {
    order_data: parsed.data
  })
  if (error) return { error: error.message }
  revalidatePath('/orders')
  return { success: true, orderId: data.id }
}


Protection des routes :
Le middleware Next.js vérifie la session Supabase sur toutes les routes /dashboard/*. Les fonctions de guards vérifient les rôles sur les routes sensibles et redirigent si non autorisé.


14.3 Rôle de Supabase

Supabase est le backend complet : base de données, authentification, stockage fichiers, temps réel et fonctions serveur.

Le ledger financier est la pièce la plus critique. Il est append-only : aucune ligne ne peut être modifiée ou supprimée. Les corrections passent exclusivement par des contre-écritures. Cela est enforced par des RLS policies bloquant UPDATE et DELETE sur la table ledger_entries.


14.4 Connexion réelle frontend/backend — Méthode par écran

Pour chaque écran, la séquence est toujours identique :

Étape 1 — Frame Figma designée et approuvée.
Étape 2 — Page Next.js créée avec Server Component fetching les données.
Étape 3 — Composants UI construits depuis le design Figma.
Étape 4 — Server Action créée pour chaque mutation.
Étape 5 — RPC Supabase créée pour chaque action atomique.
Étape 6 — RLS policies vérifiées et testées.
Étape 7 — Test end-to-end avec un utilisateur réel.

Exemple complet : Vérification d'un dépôt Finance
Figma frame : Finance / Deposits / Verify. Composants : statut dépôt, détail livraisons, champ montant vérifié, bouton valider.
Page Next.js : app/(dashboard)/finance/deposits/[id]/page.tsx. Server Component fetche le dépôt par ID.
Client Component : DepositVerificationForm avec React Hook Form + Zod.
Server Action : verifyDeposit(depositId, verifiedAmount) → auth check → validation → RPC.
RPC Supabase : verify_and_ledger_deposit() → UPDATE deposit status → INSERT ledger_entry → UPDATE orders status → INSERT alert si écart → RETURN success.
Retour : Toast "Dépôt vérifié et comptabilisé". revalidatePath('/finance/deposits'). Dashboard CEO mis à jour via Realtime.


14.5 Outils Supabase

Client browser (composants Client) : createBrowserClient depuis @supabase/ssr avec les variables NEXT_PUBLIC_*.

Client serveur (Server Components, Server Actions) : createServerClient depuis @supabase/ssr avec les cookies Next.js.

Génération des types TypeScript : npx supabase gen types typescript --project-id [ref] > src/lib/supabase.types.ts. À relancer après chaque migration SQL.

CLI Supabase : supabase migration new [nom] pour créer une migration. supabase db push pour appliquer en production. supabase db pull pour synchroniser depuis production.

Realtime abonnements :

const channel = supabase
  .channel('alerts')
  .on('postgres_changes', {
    event: 'INSERT', schema: 'public', table: 'alerts'
  }, (payload) => { addAlert(payload.new) })
  .subscribe()



14.6 Discipline de connexion — Règles absolues

Règle 1 : Zéro page décorative. Chaque page affiche des données réelles.
Règle 2 : Donnée saisie une fois, propagée partout. Une commande alimente stock, dispatch, finance et analytics automatiquement.
Règle 3 : Toute action critique = RPC atomique. Jamais de multiples appels API séquentiels pour une opération logiquement indivisible.
Règle 4 : Le frontend reflète l'état backend. Pas d'état optimiste non confirmé pour les actions financières.
Règle 5 : RLS est la dernière ligne de défense. Même si le frontend cache un bouton selon le rôle, le backend rejette toute requête non autorisée.
Règle 6 : Aucun département en silo. Toutes les tables sont liées par des clés étrangères. L'intégrité référentielle est enforced en base de données.




15. MODÈLE DE DONNÉES DE HAUT NIVEAU


15.1 Tables principales


-- ORGANISATION
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  tenant_id UUID REFERENCES tenants(id),
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN (
    'CEO','SAV_AGENT','SAV_MANAGER','DISPATCHER','LIVREUR',
    'HUB_MANAGER','FINANCE','ADS_MANAGER','ACHATS','STOCK_MANAGER','SUPER_ADMIN'
  )),
  zone_id UUID REFERENCES zones(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- GÉOGRAPHIE
CREATE TABLE zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  name TEXT NOT NULL,
  city TEXT NOT NULL
);

CREATE TABLE hubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  name TEXT NOT NULL,
  zone_id UUID REFERENCES zones(id),
  manager_id UUID REFERENCES user_profiles(id)
);

-- CLIENTS
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  zone_id UUID REFERENCES zones(id),
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','VIP','BLACKLISTED','INACTIVE')),
  total_orders INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- PRODUITS & STOCK
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  unit_price NUMERIC(10,2),
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE stock_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  hub_id UUID REFERENCES hubs(id),
  quantity_available INT DEFAULT 0,
  quantity_reserved INT DEFAULT 0,
  alert_threshold INT DEFAULT 10,
  UNIQUE(product_id, hub_id)
);

CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  hub_id UUID REFERENCES hubs(id),
  type TEXT NOT NULL CHECK (type IN (
    'IN_PURCHASE','OUT_ORDER','IN_RETURN','ADJUSTMENT','TRANSFER_OUT','TRANSFER_IN'
  )),
  quantity INT NOT NULL,
  reference_id UUID,
  operator_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- COMMANDES
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  zone_id UUID REFERENCES zones(id),
  status TEXT NOT NULL DEFAULT 'BROUILLON' CHECK (status IN (
    'BROUILLON','CONFIRMÉE','ASSIGNÉE','EN_LIVRAISON','LIVRÉE',
    'ECHEC_LIVRAISON','REPROGRAMMÉE','ANNULÉE','ENCAISSÉE','DÉPOSÉE','VÉRIFIÉE'
  )),
  cod_amount NUMERIC(10,2) NOT NULL,
  delivery_address TEXT NOT NULL,
  source TEXT,
  campaign_id UUID REFERENCES campaigns(id),
  sav_agent_id UUID REFERENCES user_profiles(id),
  attempt_count INT DEFAULT 0,
  confirmed_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  quantity INT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL
);

CREATE TABLE order_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  event_type TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT,
  operator_id UUID REFERENCES user_profiles(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- LIVRAISONS & CASH
CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) UNIQUE,
  driver_id UUID REFERENCES user_profiles(id),
  hub_id UUID REFERENCES hubs(id),
  status TEXT NOT NULL DEFAULT 'ASSIGNÉE',
  assigned_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_reason TEXT
);

CREATE TABLE cash_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID REFERENCES deliveries(id) UNIQUE,
  driver_id UUID REFERENCES user_profiles(id),
  expected_amount NUMERIC(10,2) NOT NULL,
  collected_amount NUMERIC(10,2) NOT NULL,
  collected_at TIMESTAMPTZ NOT NULL,
  deposited BOOLEAN DEFAULT false,
  deposit_id UUID REFERENCES deposits(id)
);

CREATE TABLE deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES user_profiles(id),
  hub_id UUID REFERENCES hubs(id),
  declared_amount NUMERIC(10,2) NOT NULL,
  hub_counted_amount NUMERIC(10,2),
  verified_amount NUMERIC(10,2),
  status TEXT DEFAULT 'INITIÉ' CHECK (status IN (
    'INITIÉ','EN_COURS','VALIDÉ_HUB','VÉRIFIÉ_FINANCE','ANOMALIE'
  )),
  hub_validated_by UUID REFERENCES user_profiles(id),
  finance_verified_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- LEDGER FINANCIER — IMMUABLE
CREATE TABLE ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  type TEXT NOT NULL CHECK (type IN (
    'CASH_VERIFIED','DISBURSEMENT_SUPPLIER','DISBURSEMENT_SALARY',
    'DISBURSEMENT_ADS','DISBURSEMENT_OPEX','CORRECTION','TRANSFER'
  )),
  direction TEXT NOT NULL CHECK (direction IN ('CREDIT','DEBIT')),
  amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  reference_id UUID,
  description TEXT NOT NULL,
  operator_id UUID REFERENCES user_profiles(id),
  balance_after NUMERIC(15,2),
  created_at TIMESTAMPTZ DEFAULT now()
  -- PAS de updated_at : append-only
);

-- RLS : bloquer UPDATE et DELETE sur ledger_entries
CREATE POLICY "ledger_no_update" ON ledger_entries FOR UPDATE USING (false);
CREATE POLICY "ledger_no_delete" ON ledger_entries FOR DELETE USING (false);

-- MARKETING & ADS
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  name TEXT NOT NULL,
  channel TEXT NOT NULL,
  product_id UUID REFERENCES products(id),
  budget NUMERIC(10,2),
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE campaign_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id),
  amount NUMERIC(10,2) NOT NULL,
  expense_date DATE NOT NULL,
  recorded_by UUID REFERENCES user_profiles(id)
);

-- ACHATS & FOURNISSEURS
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  name TEXT NOT NULL,
  country TEXT DEFAULT 'CN',
  contact_phone TEXT,
  avg_lead_days INT,
  rating NUMERIC(3,1)
);

CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  po_number TEXT UNIQUE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id),
  status TEXT DEFAULT 'BROUILLON' CHECK (status IN (
    'BROUILLON','APPROUVÉ','EN_TRANSIT','DÉDOUANEMENT','REÇU','ANNULÉ','LITIGE'
  )),
  total_amount NUMERIC(15,2),
  expected_arrival DATE,
  approved_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ABONNEMENTS
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  customer_id UUID REFERENCES customers(id),
  plan_name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  billing_period TEXT DEFAULT 'MONTHLY',
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN (
    'ACTIVE','EXPIRED','CANCELLED','PENDING_RENEWAL'
  ))
);

-- ALERTES SYSTÈME
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  level TEXT NOT NULL CHECK (level IN ('CRITICAL','WARNING','INFO')),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  reference_id UUID,
  target_roles TEXT[],
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);



15.2 Index critiques pour les performances


CREATE INDEX idx_orders_tenant_status ON orders(tenant_id, status);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_deliveries_driver ON deliveries(driver_id);
CREATE INDEX idx_ledger_tenant_date ON ledger_entries(tenant_id, created_at DESC);
CREATE INDEX idx_stock_product_hub ON stock_levels(product_id, hub_id);
CREATE INDEX idx_alerts_tenant_resolved ON alerts(tenant_id, is_resolved, created_at DESC);



15.3 Vues SQL pour le dashboard


-- CA vérifié par jour
CREATE VIEW v_daily_revenue AS
SELECT
  tenant_id,
  date_trunc('day', created_at)::date AS day,
  SUM(amount) AS verified_revenue,
  COUNT(*) AS order_count
FROM ledger_entries
WHERE type = 'CASH_VERIFIED' AND direction = 'CREDIT'
GROUP BY tenant_id, 2;

-- Cash en transit (non déposé)
CREATE VIEW v_cash_in_transit AS
SELECT
  d.driver_id,
  up.full_name AS driver_name,
  SUM(cc.collected_amount) AS amount_in_transit,
  MIN(cc.collected_at) AS oldest_collection,
  NOW() - MIN(cc.collected_at) AS time_in_transit
FROM cash_collections cc
JOIN deliveries d ON d.id = cc.delivery_id
JOIN user_profiles up ON up.id = d.driver_id
WHERE cc.deposited = false
GROUP BY d.driver_id, up.full_name;

-- Métriques livraison
CREATE VIEW v_delivery_metrics AS
SELECT
  o.tenant_id,
  date_trunc('day', d.assigned_at)::date AS day,
  COUNT(*) AS total_assigned,
  SUM(CASE WHEN d.status = 'LIVRÉ' THEN 1 ELSE 0 END) AS delivered,
  ROUND(SUM(CASE WHEN d.status = 'LIVRÉ' THEN 1 ELSE 0 END)::numeric
        / COUNT(*) * 100, 1) AS delivery_rate
FROM deliveries d
JOIN orders o ON o.id = d.order_id
GROUP BY o.tenant_id, 2;



15.4 Préparation à l'IA

Les tables suivantes stockent les données granulaires nécessaires aux futurs agents IA :
order_events : historique complet de chaque transition d'état avec timestamp et opérateur.
stock_movements : chaque mouvement de stock avec contexte.
cash_collections : chaque encaissement avec montant attendu et réel.
delivery performances futures : historique par livreur, zone, créneau, produit.

Ces données ne doivent jamais être agrégées prématurément. Les données brutes alimenteront les modèles de prédiction et les agents de dispatch automatique en Phase 3.




16. UX / UI


16.1 Principes UX fondamentaux

Clarté avant esthétique. Un opérateur doit prendre une décision en moins de 5 secondes. Pas d'information superflue, pas de clic inutile.

L'action suit le regard. Les boutons d'action principaux sont toujours visibles sans scroll. Hiérarchie d'action : Primaire (bleu), Secondaire (outline), Danger (rouge).

Le statut parle seul. Les badges de statut sont codés couleur de manière universelle et cohérente dans tout le système : Vert = validé/vérifié/succès. Bleu = en cours/assigné/actif. Orange = attention/en attente/proche seuil. Rouge = erreur/critique/urgent. Gris = annulé/inactif.

Zéro ambiguïté sur les chiffres. Les montants financiers sont toujours affichés avec la devise (FCFA), alignés à droite, avec séparateurs de milliers.

Empty states informatifs. Quand une liste est vide, afficher une illustration légère, un message contextuel et un CTA actionnable. Jamais de tableau vide sans explication.


16.2 Dashboard CEO — Desktop

Layout fixe : Sidebar 280px gauche + zone principale scrollable. Header fixe avec recherche globale et indicateur alertes.

La zone principale contient : une rangée de 3 à 4 StatCards (CA vérifié, Cash en transit, Taux de livraison, Stock critique). Une courbe CA sur 30 jours et un tableau Top Produits côte à côte. La section alertes actives avec badge de priorité.

Les StatCards affichent la valeur principale, la variation vs période précédente (flèche verte ou rouge), et l'icône du module concerné.


16.3 Interface Livreur — Mobile

Écran optimisé pour une main, en déplacement. Informations minimales et actions larges.

En-tête : bonjour + prénom, nombre de livraisons du jour, total encaissé.
Corps : liste des livraisons avec statut visuel. Chaque item affiche client, adresse courte, montant COD, boutons Livré/Échec larges.
Bas d'écran fixe : bouton prominent "Déposer du cash" quand des encaissements sont en attente.

Aucune navigation complexe. Aucun tableau. Aucun menu caché. Tout est accessible en 2 taps maximum.


16.4 Interface Finance — Desktop

Densité d'information élevée. Tableaux précis avec colonnes bien dimensionnées. Exports disponibles à tout moment. Palette sobre (blanc, gris, accents bleus). Aucun élément décoratif.

Le ledger affiche chronologiquement : date, type, référence (cliquable), description, débit, crédit, solde cumulé après chaque ligne.

Les dépôts à vérifier affichent systématiquement : montant déclaré livreur, montant compté hub, écart calculé automatiquement en rouge si non nul, liste des livraisons associées.


16.5 Système de design

Typographie : Inter (Google Fonts, variable). Taille base 14px. Hiérarchie : H1 32px bold, H2 24px semibold, H3 18px semibold, corps 14px, caption 12px.

Couleurs :
Primaire : Bleu SHEVA #1D4ED8.
Fond : #F8FAFC.
Texte principal : #0F172A.
Texte secondaire : #64748B.
Succès : #16A34A. Attention : #D97706. Danger : #DC2626. Info : #2563EB.

Spacing : Système 4px. Valeurs utilisées : 4, 8, 12, 16, 24, 32, 48px.

Border radius : 6px pour les cartes, 4px pour les boutons, 2px pour les badges.

Ombres : Uniquement sur les éléments flottants (modals, dropdowns, tooltips). Box-shadow légère, jamais décorative.


16.6 Composants partagés critiques

StatusBadge : Composant universel pour les statuts de commandes, livraisons et dépôts. Couleur automatique selon l'état. Utilisé dans tous les tableaux sans exception.

StatCard : Carte métrique pour dashboards. Affiche titre, valeur principale, variation vs période précédente avec indicateur directionnel, icône représentative.

DataTable : Tableau réutilisable avec tri par colonne, filtres intégrés, pagination côté serveur, sélection multiple pour actions groupées, export CSV. Base de toutes les listes de l'application.

Timeline : Historique des événements d'une commande ou dépôt. Affichage chronologique avec opérateur, heure, type d'événement coloré, et métadonnées contextuelles.

AlertBanner : Bannière d'alerte contextuelle en haut des pages concernées. Non fermable pour les alertes CRITICAL. Lien vers la page de résolution.

ConfirmDialog : Modal de confirmation pour les actions irréversibles (annulation, suppression, validation financière). Toujours avec résumé de l'action et ses conséquences.
8, 12, 16, 24, 32, 48px).
Radius : 6px (cartes), 4px (boutons), 2px (badges).
Ombres : Légères uniquement sur cartes flottantes (modals, dropdowns).


16.6 Composants partagés critiques

StatusBadge : Composant universel affichant le statut d'une commande, livraison ou dépôt. Couleur automatique selon l'état. Utilisé dans tous les tableaux.

StatCard : Carte métrique pour dashboards. Titre, valeur principale, variation vs période précédente, icône.

DataTable : Tableau de données avec tri, filtres, pagination, sélection multiple, export. Base de toutes les listes.

Timeline : Historique des événements d'une commande ou d'un dépôt. Affichage chronologique avec opérateur, heure, type d'événement.

AlertBanner : Bannière d'alerte en haut des pages concernées. Non dismissible pour les alertes CRITICAL.




17. MVP


17.1 Philosophie MVP

Le MVP doit permettre de résoudre le problème fondamental : tracer une commande du début à la vérification financière. Tout le reste est secondaire. Le MVP est une boucle complète, pas un ensemble de features partielles.


17.2 Bloc 1 — Fondations (Semaines 1-2)

Objectif : Mettre en place l'infrastructure, l'authentification et la gestion des utilisateurs.

Livrables :
•	Projet Next.js configuré (TypeScript, Tailwind, Shadcn)
•	Projet Supabase configuré (tables de base, RLS, Auth)
•	GitHub repository avec branches et CI de base
•	Déploiement Hostinger fonctionnel
•	Page login fonctionnelle
•	Gestion des utilisateurs et rôles (backoffice)
•	Sidebar conditionnelle par rôle
•	Migration SQL initiale : tenants, users, zones, hubs, products

Ce que ce bloc débloque : Tout le reste. Sans fondations solides, tout s'effondre.




17.3 Bloc 2 — CRM + Commandes (Semaines 3-4)

Objectif : Permettre à l'équipe SAV de créer et gérer des commandes.

Livrables :
•	Gestion des clients (création, fiche, historique)
•	Création de commande (avec vérification stock live)
•	Liste des commandes avec filtres et statuts
•	Fiche commande avec timeline des événements
•	Annulation de commande avec motif
•	Machine à états commande (BROUILLON → CONFIRMÉE → ASSIGNÉE)
•	Blocage si stock = 0
•	Alerte si client blacklisté

Tables Supabase : customers, orders, order_items, order_events, products, stock_levels
RPC : create_order_with_stock_check()




17.4 Bloc 3 — Dispatch + Livraisons (Semaines 5-6)

Objectif : Permettre au dispatcher d'assigner les commandes et aux livreurs de les traiter.

Livrables :
•	Interface dispatch avec liste commandes/livreurs
•	Assignment d'une commande à un livreur
•	Interface mobile livreur (liste livraisons du jour)
•	Confirmation de livraison (avec montant encaissé)
•	Signalement d'échec (avec motif)
•	Mise à jour statut commande en temps réel
•	Décrémentation stock à la confirmation livraison

Tables Supabase : deliveries, cash_collections
RPC : assign_delivery(), confirm_delivery(), report_failure()




17.5 Bloc 4 — Cash + Dépôts (Semaines 7-8)

Objectif : Fermer la boucle cash — du livreur à la vérification Finance.

Livrables :
•	Déclaration de dépôt par le livreur (mobile)
•	Validation Hub du dépôt (avec montant compté)
•	Alerte si écart Hub > seuil
•	Vérification Finance du dépôt
•	Écriture automatique dans le ledger à la vérification
•	Statut commande → VÉRIFIÉE après comptabilisation
•	Alerte si dépôt non fait sous 24h

Tables Supabase : deposits, ledger_entries
RPC : validate_hub_deposit(), verify_and_ledger_deposit()




17.6 Bloc 5 — Stock + Alertes (Semaines 9-10)

Objectif : Gérer le stock réel et les alertes critiques.

Livrables :
•	Catalogue produits avec niveaux de stock
•	Mouvements de stock (entrée réception, sortie livraison, ajustement)
•	Configuration des seuils d'alerte par produit
•	Alertes automatiques (stock bas, stock zéro)
•	Blocage commande SAV si rupture
•	Interface inventaire Hub
•	Trigger stock → alerte → notification

Tables Supabase : stock_levels, stock_movements, alerts
Triggers : check_stock_alert_after_update




17.7 Bloc 6 — Finance + Dashboard CEO (Semaines 11-12)

Objectif : Donner au CEO et à la Finance une vue réelle de l'activité.

Livrables :
•	Ledger complet (lecture, export)
•	Réconciliation journalière automatique
•	Dashboard CEO (CA vérifié, cash transit, KPIs)
•	Vue alertes actives
•	Rapports exportables (CSV/Excel)
•	Décaissements basiques

Tables Supabase : Vues SQL (v_daily_revenue, v_cash_in_transit, v_delivery_metrics)
RPC : get_dashboard_metrics(), reconcile_daily_cash()




17.8 Récapitulatif MVP


Bloc	Durée	Dépendances	Risque
1. Fondations	2 sem	—	Faible
2. CRM + Commandes	2 sem	Bloc 1	Moyen
3. Dispatch + Livraisons	2 sem	Bloc 2	Moyen
4. Cash + Dépôts	2 sem	Bloc 3	Élevé
5. Stock + Alertes	2 sem	Blocs 2, 3	Moyen
6. Finance + Dashboard	2 sem	Blocs 4, 5	Moyen
Total MVP	12 sem		


Le MVP est complet quand une commande peut passer de BROUILLON à VÉRIFIÉE de bout en bout, avec le cash tracé dans le ledger.




18. FEUILLE DE ROUTE


Phase 0 — MVP (Mois 1-3)

Voir section 17. Boucle COD complète opérationnelle. Modules : SAV, Dispatch, Livreur, Hub, Finance basique, Stock basique, Dashboard CEO.

Critère de sortie Phase 0 :
•	100 commandes traitées de bout en bout sans perte de données
•	CA vérifié affiché en temps réel
•	0 dépôt non tracé




Phase 1 — Version Renforcée (Mois 4-6)

Modules ajoutés :
•	Ads / Marketing : Campagnes, attribution commandes, ROAS par produit, alertes budget et rupture
•	Achats / Fournisseurs : Bons de commande, suivi expéditions Chine, réception marchandises
•	Abonnements : Gestion clients récurrents, renouvellements, alertes expiration
•	Expéditions intérieures : Transferts inter-hubs, suivi transporteurs
•	Réconciliation avancée : Rapprochement automatique cash attendu/reçu
•	Rapports financiers : P&L mensuel, bilan trésorerie, rapport livreurs

Améliorations :
•	Notifications email pour alertes critiques
•	Export Excel avancé (rapports formatés)
•	Interface inventaire avec comptage guidé
•	Scoring livreurs (performance mensuelle)
•	Historique complet des anomalies

Critère de sortie Phase 1 :
•	Tous les départements opérationnels dans SHEVA OS
•	Zéro Excel/WhatsApp pour les opérations core
•	Rapport financier J+1 disponible automatiquement




Phase 2 — Version Avancée (Mois 7-12)

Modules ajoutés :
•	Application mobile native (React Native / Expo) pour livreurs : performances optimisées, mode offline, GPS, photo de preuve
•	Intégrations externes :
◦	API opérateurs mobile money (Orange Money, MTN MoMo, Wave) pour paiements livreurs
◦	Import automatique dépenses ads depuis Meta Business Suite et TikTok Ads
◦	Export vers logiciel comptable externe (Sage, QuickBooks)
•	Portail client : Suivi de commande en ligne, historique, réclamations
•	Multi-hub avancé : Transferts automatiques, optimisation stock entre hubs
•	Analytics avancés :
◦	Cohortes clients
◦	Prédiction de churn abonnements
◦	Analyse de rentabilité par zone et livreur

Améliorations :
•	Notifications WhatsApp pour alertes critiques terrain
•	Cartes interactives livraisons (Leaflet ou Google Maps)
•	Dark mode interface
•	Mode offline partiel pour interface livreur
•	Audit trail complet exportable

Critère de sortie Phase 2 :
•	Livreurs opèrent 100% sur mobile natif
•	Réconciliation financière automatique sans intervention manuelle
•	Intégration mobile money active




Phase 3 — Intégration IA & Agents (Mois 13-18)

Pré-requis indispensables : Les phases 0 et 1 ont produit 6+ mois de données propres et structurées. C'est cette base de données qui alimente les modèles IA.

Modules IA :

Agent Dispatch Automatique
•	Analyse historique livraisons, performances livreurs, zones, créneaux
•	Suggère les assignments optimaux automatiquement
•	Apprend des patterns de succès/échec
•	Réduction du délai dispatch de 30 à 5 minutes

Agent Prévision Achats
•	Analyse historique ventes + saisonnalité + tendances
•	Génère automatiquement les alertes de réapprovisionnement
•	Calcule les quantités optimales à commander
•	Réduit les ruptures et le sur-stockage

Agent Réconciliation
•	Détecte automatiquement les anomalies de cash avant qu'elles soient signalées
•	Identifie les patterns d'écart (livreur, zone, créneau)
•	Génère des rapports d'anomalie pré-remplis

Agent SAV
•	Répond automatiquement aux questions fréquentes clients via WhatsApp
•	Classe et route les réclamations automatiquement
•	Suggère des actions de résolution au SAV humain

Chatbot Interne (CEO / Manager)
•	Interface langage naturel pour interroger les données
•	Exemple : "Montre-moi les livreurs avec le plus d'écarts de caisse ce mois-ci"
•	Génère des rapports ad-hoc sur demande verbale

Infrastructure IA :
•	Claude API (Anthropic) pour raisonnement et génération de rapports
•	Embeddings pour recherche sémantique dans les données
•	Edge Functions Supabase comme interface entre les agents et la base de données
•	Logging de toutes les actions IA pour audit et amélioration




Phase 4 — Montée en Puissance & Scale (Mois 18+)

Objectifs scale :

Multi-tenant SaaS
•	Onboarding en self-service pour nouvelles entreprises
•	Plans et facturation (Stripe)
•	Isolation complète des données par tenant
•	Dashboard Anthropic pour support

Performances à grande échelle :
•	Read replicas PostgreSQL pour les requêtes dashboard lourdes
•	Cache Redis pour les données temps réel (alertes, métriques)
•	CDN pour assets statiques
•	Monitoring (Datadog ou Sentry)

Marketplace de modules :
•	Modules additionnels activables par tenant
•	API publique pour intégrations tierces
•	Webhooks configurables

Expansion géographique :
•	Support multi-devises (FCFA XOF, FCFA XAF, GHS, NGN)
•	Interface en anglais et en langues locales
•	Conformité RGPD adaptée aux contextes locaux




19. ZONES À CONFIRMER

Les éléments suivants ne sont pas verrouillés dans ce document. Ils doivent être définis avec l'équipe métier avant la phase de build correspondante.


19.1 Seuils financiers


Paramètre	Description	Valeur à confirmer
Seuil écart dépôt (livreur/hub)	Au-delà duquel une anomalie est créée	Ex : 500 FCFA
Seuil écart dépôt (hub/finance)	Au-delà duquel blocage comptabilisation	Ex : 1 000 FCFA
Délai max dépôt cash	Avant alerte ORANGE	Ex : 24h
Délai max dépôt cash	Avant alerte ROUGE	Ex : 48h
Montant max cash livreur	Avant alerte direction	Ex : 200 000 FCFA



19.2 Stock


Paramètre	Description	Valeur à confirmer
Seuil alerte stock	Par défaut (personnalisable par produit)	Ex : 10 unités
Délai réapprovisionnement	Délai standard Chine → Abidjan	Ex : 25-45 jours
Méthode de valorisation stock	FIFO, LIFO ou Prix moyen pondéré	À confirmer
Fréquence inventaire physique	Mensuel, hebdomadaire ?	À confirmer



19.3 Livreurs


Paramètre	Description	Valeur à confirmer
Charge max livreur/jour	Nombre de commandes maximum	Ex : 20 commandes
Scoring livreur	Méthode de calcul du score de performance	À définir
Seuil suspension	Score en dessous duquel suspension auto	À définir
Prime de performance	Déclencheur et montant	À confirmer








19.4 SLA (Service Level Agreements)


SLA	Description	Valeur à confirmer
SLA SAV	Délai max traitement réclamation	Ex : 24h
SLA Dispatch	Délai max assignation après confirmation	Ex : 4h
SLA Vérification Finance	Délai max vérification dépôt	Ex : 24h
SLA Alerte	Délai max entre anomalie et notification	Ex : 30 min



19.5 Marketing


Paramètre	Description	Valeur à confirmer
Seuil ROAS minimum	En dessous : alerte direction	Ex : 3
Seuil budget alerte	% du budget consommé déclenchant alerte	Ex : 80% puis 95%
Fenêtre d'attribution	Jours après clic → commande attribuée	Ex : 7 jours
Canaux trackés	Quels réseaux sociaux et sources	À lister



19.6 Clients


Paramètre	Description	Valeur à confirmer
Critère VIP	Nombre de commandes ou montant seuil	Ex : 5 commandes ou 100K FCFA
Critère blacklist	Motifs et validation	Motifs à lister
Rétention données inactifs	Après combien de temps	Ex : 2 ans
Score crédit client	Calcul et utilité	À définir phase 2



19.7 Abonnements


Paramètre	Description	Valeur à confirmer
Préavis renouvellement	Jours avant expiration pour alerte	Ex : 7 jours
Période de grâce	Jours après expiration avant blocage	Ex : 3 jours
Plans disponibles	Noms, tarifs, inclusions	À définir



19.8 Paramètres système


Paramètre	Description	Valeur à confirmer
Devise principale	FCFA XOF ou XAF ?	À confirmer
Fuseau horaire	UTC ou UTC+0 (Abidjan) ?	UTC+0
Format date	DD/MM/YYYY ou autre	DD/MM/YYYY
Numérotation commandes	Format et préfixe	Ex : ORD-2024-XXXXX
Langue interface	Français uniquement ou bilingue	Français MVP
Rétention logs	Durée de conservation	Ex : 3 ans





20. RECOMMANDATIONS CTO FINALES


20.1 Ordre de build recommandé

Semaine 0 — Avant de coder la première ligne

Avant tout développement, trois choses sont obligatoires :

Un : Finaliser le schéma SQL complet dans Supabase Studio. Créer toutes les tables, toutes les relations, les premières policies RLS, et les triggers critiques. Ce schéma est le contrat entre tous les développeurs. Il ne doit pas changer sans processus de migration formel.

Deux : Créer le design system Figma complet avec les composants de base (badges statuts, DataTable, formulaires, sidebar). Les développeurs ne doivent pas inventer le design en codant.

Trois : Configurer le CI/CD GitHub → Hostinger. Chaque commit sur main doit déclencher un déploiement automatique. Dès la première semaine, l'équipe doit avoir le réflexe "je push, ça se déploie".



L'ordre de build est non négociable :

1.	Fondations techniques (auth, RBAC, routing, CI)
2.	La boucle COD complète, même minimale
3.	Le stock et les alertes
4.	Le dashboard CEO (il donnera confiance et visibilité)
5.	Les modules secondaires (Ads, Achats, Abonnements)
6.	L'IA (seulement quand les données sont propres et abondantes)

Ne pas sauter d'étapes. Ne pas construire le module Ads avant que la boucle COD soit bouclée et testée en production.




20.2 Pièges à éviter

Piège 1 — Le scope creep au nom du "plus tard"
"On va juste ajouter cette feature maintenant pour ne pas y revenir." Ce raisonnement est la cause numéro un des retards. Tout ce qui n'est pas dans le bloc courant va dans le backlog et sera traité dans le bloc suivant. Pas d'exception.

Piège 2 — Les fausses performances (données non vérifiées dans le dashboard)
Le dashboard CEO doit UNIQUEMENT afficher du CA vérifié. Afficher les commandes comme du CA "pour faire joli" détruit la confiance dans l'outil dès la première semaine. Le CEO verra un chiffre plus bas que prévu, posera des questions, et découvrira que les données sont exactes. C'est une victoire, pas un problème.

Piège 3 — Ignorer le RLS
Développer sans activer le RLS "pour aller plus vite" et le mettre en place "plus tard" est une catastrophe annoncée. Un livreur qui voit les données d'un autre livreur, un agent SAV qui accède aux données financières — ces bugs de sécurité sont critiques. RLS dès la première table, pas négociable.

Piège 4 — Multiplier les appels API pour une action atomique
Exemple : créer une commande en faisant 3 appels successifs (créer commande, décrementer stock, envoyer notification). Si le deuxième appel échoue, la base de données est dans un état incohérent. Toute action qui touche plusieurs tables = RPC PostgreSQL en transaction atomique. Toujours.

Piège 5 — Sur-ingénierie précoce
Ne pas construire un système de cache distribué, une architecture microservices ou une solution de ML maison pour le MVP. Supabase + Next.js + PostgreSQL est extrêmement scalable. Shopify a fait des milliards de dollars avec Ruby on Rails et un seul serveur de base de données pendant des années. Solve the problem first, optimize later.

Piège 6 — Documentation nulle
Chaque RPC doit avoir un commentaire SQL décrivant ce qu'elle fait, pourquoi, et ses préconditions. Chaque Server Action doit avoir un type de retour documenté. Dans 6 mois, l'équipe aura doublé et personne ne se souviendra pourquoi telle fonction existe.

Piège 7 — Ne pas tester en conditions réelles
Tester uniquement en développement avec des données de test parfaites. En production, les livreurs font des erreurs de saisie, les connexions sont instables, les montants comportent des virgules. Tester avec de vraies personnes sur de vraies commandes le plus tôt possible (dès la semaine 6-7).




20.3 Discipline d'architecture

La base de données est la vraie architecture.
Le schéma SQL, les contraintes, les triggers et les RPC sont l'architecture réelle de SHEVA OS. Le frontend Next.js est une interface sur ce schéma. Si le schéma est propre, les autres couches suivent. Si le schéma est sale, tout est instable.

Une source de vérité, une seule.
Les données de commandes vivent dans Supabase, pas dans un state React, pas dans un localStorage, pas dans un cookie. Le frontend est un miroir de la base de données. Pas une copie indépendante.

Naming et conventions sont des décisions d'équipe.
Colonnes en snake_case, routes en kebab-case, composants en PascalCase, fonctions en camelCase. Ce n'est pas une question d'esthétique. C'est une question de vitesse de développement et de réduction des bugs. Écrire la convention dans un CONTRIBUTING.md et la faire respecter à la revue de code.

Les migrations SQL sont du code.
Chaque changement de schéma est une migration versionnée, reviewée, et déployée via le CLI Supabase. Jamais de modification manuelle en production. Jamais.

Préparer l'IA dès maintenant.
Stocker les événements granulaires (order_events, stock_movements, delivery_confirmations) avec timestamps précis et métadonnées riches. Ne pas agréger prématurément. Les agents IA auront besoin de données brutes. Chaque donnée économisée maintenant est de l'intelligence future.




20.4 Méthode de travail recommandée

Cycles de 2 semaines, pas de planning sur 3 mois.
Un sprint de 2 semaines = un bloc MVP livrable et déployable. À la fin de chaque sprint, une démo réelle avec les utilisateurs finaux (livreurs, SAV, Finance). Pas une démo de démonstration. Une utilisation réelle sur de vraies commandes.

"Definition of Done" par feature :
Une feature est terminée quand :
•	Elle est déployée en production (pas en staging)
•	Elle est documentée (description, endpoint, tables concernées)
•	Elle est couverte par au moins un test fonctionnel
•	Elle a été utilisée par un utilisateur réel sans guidance

Un responsable par bloc.
Chaque bloc MVP a un owner unique (développeur ou binôme). Cet owner est responsable de la livraison, de la qualité, et de la documentation. Pas de propriété collective floue.

Feedback terrain en continu.
Mettre l'interface livreur entre les mains d'un vrai livreur à la semaine 8, pas à la semaine 12. Les retours terrain transformeront le produit plus vite que n'importe quelle session de design interne.




20.5 Recommandations pour scaler sans casser

Architecture multi-tenant dès le départ.
Le champ tenant_id sur toutes les tables, toutes les policies RLS incluant tenant_id = auth.jwt()->>'tenant_id'. Cette décision coûte 2 jours de travail maintenant et évite une refonte complète en 18 mois.

Indexes dès le MVP.

CREATE INDEX idx_orders_tenant_status ON orders(tenant_id, status);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_deliveries_driver ON deliveries(driver_id);
CREATE INDEX idx_ledger_tenant_date ON ledger_entries(tenant_id, created_at);
CREATE INDEX idx_stock_product_hub ON stock_levels(product_id, hub_id);

Sans ces indexes, les requêtes dashboard avec 50 000 commandes seront lentes dès le mois 4.

Vues matérialisées pour le dashboard.
Les métriques CEO (CA vérifié, taux de livraison, cash en transit) ne doivent pas recalculer sur 100 000 lignes à chaque chargement. Créer des vues matérialisées rafraîchies toutes les 5 minutes pour les données agrégées.

Edge Functions pour les opérations asynchrones.
Les rapports lourds, les emails, les notifications WhatsApp, la réconciliation nuitée : Edge Functions. Ne jamais bloquer une Server Action en attendant un process long.

Monitoring dès le lancement en production.
Sentry pour les erreurs frontend et backend. Supabase Dashboard pour les performances PostgreSQL. Une alerte Slack (ou WhatsApp) sur chaque erreur 5xx en production. Ne pas découvrir les bugs par les utilisateurs.

Backup quotidien de la base de données.
Supabase propose des backups automatiques sur les plans Pro. Les activer immédiatement. Tester une restauration complète avant le lancement en production. Pas une fois. Deux fois.




20.6 Vision finale

SHEVA OS n'est pas un projet informatique. C'est la transformation numérique d'une façon de gérer des entreprises entières.

Le vrai succès de SHEVA OS sera le jour où le CEO d'une entreprise COD ouvrira son téléphone à 7h du matin, verra son CA vérifié de la veille, ses alertes actives, son taux de livraison, et prendra trois décisions stratégiques en cinq minutes — sans appeler personne, sans attendre un Excel, sans estimer à l'aveugle.

Ce jour-là, SHEVA OS sera devenu irremplaçable.

Construire avec cette ambition. Livrer avec cette rigueur.



Document rédigé par : Architecture SHEVA OS
Version : 1.0
Statut : Document principal de référence — À maintenir à jour à chaque évolution majeure
Prochain review : À la fin du Bloc 3 MVP

