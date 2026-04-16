

**SHEVA OS**

**COD Operations System — Côte d'Ivoire**

**CAHIER DE CHARGES MÉTIER ET FONCTIONNEL**

*Process 1 & 2 — Cycle Commande / Encaissement / Retour Soir / Clôture Hub*

| Périmètre | SAV → Dispatch → Hub → Livreur → Recouvrement → Trésorerie |
| :---- | :---- |
| **Process couverts** | Process 1 : Commande → Paiement livreur | Process 2 : Retour soir → Clôture Hub |
| **Langue métier** | Français (statuts, vues, workflows) — codes techniques internes en anglais |
| **Format** | Cahier de charges exécutable — Design, Dev, Config, Rôles, Boutons, Base de données |
| **Statut** | **CONFIDENTIEL — VERSION BUILD FINALE** |

# **PARTIE A — CADRE GÉNÉRAL**

## **A.1 Objectif du périmètre**

Ce cahier de charges couvre deux process opérationnels complémentaires du système SHEVA OS pour le e-commerce COD (Cash On Delivery) en Côte d'Ivoire.

Le Process 1 couvre le cycle aller : de la création d'une commande par le SAV jusqu'à l'encaissement validé par la Trésorerie et au paiement du livreur. Le Process 2 couvre le cycle retour : depuis la fin de mission terrain du livreur jusqu'à la clôture complète du Hub, incluant la réintégration du stock, la gestion des litiges et la fermeture financière de la mission.

**Ensemble, ces deux process garantissent que chaque commande est soit encaissée et vérifiée, soit retournée au Hub et réintégrée — avec traçabilité complète à chaque étape.**

## **A.2 Départements concernés**

| Département | Process 1 | Process 2 | Rôle principal |
| ----- | ----- | ----- | ----- |
| SAV | Actif — création/confirmation | Lecture / suivi post-terrain | Crée et confirme les commandes. Suit les échecs et relances. |
| Dispatch / OPS | Actif — groupage / assignation | Lecture missions | Groupe les commandes, crée les missions, assigne les livreurs. |
| Hub / Entrepôt | Actif — chargement livreur | Actif — réception retour soir | Centre du stock terrain. Charge, réapprovisionne, réceptionne les retours. |
| Livreur (terrain) | Actif — livraison / encaissement | Actif — déclaration fin mission | Exécute les livraisons. Encaisse. Retourne les invendus. |
| Recouvrement | Actif — validation encaissement | Lecture | Valide chaque encaissement. Met à jour les statuts de paiement. |
| Trésorerie | Actif — paiement livreur / GL | Actif — litiges mission | Gère les flux financiers, valide les transactions, alimente le grand livre. |
| CEO / Direction | Lecture supervision | Lecture supervision | Accès lecture complet sur toutes les vues et tous les KPIs. |

## **A.3 Objets métier principaux**

| Objet métier | Description | Process concerné |
| ----- | ----- | ----- |
| Commande | Unité de vente centrale. Portée par un client, une zone, un agent SAV. | Process 1 et 2 |
| Mission | Groupe de commandes assignées à un livreur pour un créneau donné. | Process 1 et 2 |
| Stock Hub | Stock physique central géré par le Hub. Source unique de vérité. | Process 1 et 2 |
| Stock Livreur | Stock chargé par le Hub au livreur. Géré par mouvements. | Process 1 et 2 |
| Recouvrement | Enregistrement de chaque encaissement terrain, en attente de validation. | Process 1 |
| Transaction financière | Écriture double (débit \+ crédit) liée à tout flux d'argent. | Process 1 et 2 |
| Grand Livre | Journal immuable de toutes les écritures financières. Append-only. | Process 1 et 2 |
| Litige mission | Dossier d'anomalie ouvert lorsqu'un écart stock ou argent est constaté. | Process 2 |
| Article retour | Unité de produit non livré revenant au Hub après inspection. | Process 2 |

## **A.4 Principes non négociables**

**Ces règles sont des invariants système. Aucune exception n'est tolérée. Le système doit les bloquer côté serveur, pas seulement côté interface.**

| \# | Règle inviolable | Impact opérationnel |
| ----- | ----- | ----- |
| **R1** | Aucun retour arrière sur les statuts commande et mission | Séquence irréversible. Statut suivant uniquement. |
| **R2** | Aucun saut d'étape dans les cycles | Chaque étape doit être franchie dans l'ordre. |
| **R3** | Le Hub est le seul centre du stock terrain | Toute entrée/sortie de stock passe par le Hub. |
| **R4** | Le livreur ne livre que les produits officiellement chargés par le Hub | Le Hub crée le stock livreur. Le livreur ne peut pas ajouter. |
| **R5** | Tout mouvement de stock crée un mouvement explicite traçable | Jamais de modification directe de quantité. |
| **R6** | Toute entrée d'argent va dans un compte précis identifié | Pas de dépôt sans compte de destination défini. |
| **R7** | Toute sortie d'argent part d'un compte précis identifié | Pas de paiement sans compte source défini. |
| **R8** | Chaque écriture financière alimente le grand livre (2 lignes : débit \+ crédit) | Comptabilité en partie double. Jamais une seule ligne. |
| **R9** | Le livreur ne valide jamais lui-même les écritures du grand livre | Validation Trésorerie uniquement. |
| **R10** | Chaque action sensible est tracée dans l'audit log (immuable) | Audit append-only. Jamais modifiable. |
| **R11** | ÉCHEC\_SUR\_PLACE n'est autorisé qu'après ARRIVÉE \+ 10 minutes minimum | Blocage temporel serveur. Protection contre fraude de non-présentation. |
| **R12** | Aucun produit ne revient en stock sans inspection Hub préalable | Toute remise en stock passe par la validation d'état. |
| **R13** | Aucune correction financière ne modifie une écriture existante | Correction \= nouvelle écriture ou contre-passation. |
| **R14** | Un produit manquant non livré et non retourné \= litige, jamais ajustement silencieux | Toute disparition de produit déclenche un litige formel. |

## **A.5 Règles de séquence et de contrôle**

### **Séquence Process 1 — irréversible**

CRÉÉE → CONFIRMÉE → ASSIGNÉE → CHARGÉE\_PAR\_HUB → EN\_LIVRAISON → LIVRÉE ou ÉCHEC\_SUR\_PLACE ou ANNULÉE

### **Séquence Mission — irréversible**

À\_FAIRE → ASSIGNÉE → EN\_ATTENTE\_CHARGEMENT → CHARGÉE → EN\_COURS → CLÔTURÉE

### **Séquence Retour Mission — Process 2**

EN\_ATTENTE\_RETOUR\_SOIR → RETOUR\_REÇU\_HUB → RETOUR\_CONTRÔLÉ → RETOUR\_CLOTURÉ

### **Séquence Article Retour**

EN\_ATTENTE\_INSPECTION → REMIS\_EN\_STOCK ou ENDOMMAGÉ ou EN\_LITIGE

### **Contrôles bloquants automatiques**

* Commande CONFIRMÉE obligatoire avant ASSIGNÉE (statut\_commande vérifié côté serveur)

* Mission CHARGÉE obligatoire avant que le livreur passe en EN\_LIVRAISON

* ARRIVÉE obligatoire depuis 10 minutes minimum avant ÉCHEC\_SUR\_PLACE (timestamp serveur)

* Toute validation financière nécessite un compte débit ET un compte crédit définis

* Clôture retour mission impossible si au moins un article reste EN\_ATTENTE\_INSPECTION

* Paiement livreur bloqué si litige mission ouvert non résolu sur cette mission

# **PARTIE B — PROCESS 1 : DE LA COMMANDE AU PAIEMENT LIVREUR**

## **B.1 Résumé du Process 1**

Le Process 1 couvre la journée opérationnelle COD depuis la création de la commande jusqu'à la validation des encaissements et au paiement du livreur en fin de journée.

* Le SAV crée et confirme les commandes. Chaque commande confirmée devient visible chez le Dispatch.

* Le Dispatch groupe les commandes par zone, crée des missions et assigne les livreurs.

* Le Hub prépare, réserve et charge physiquement les produits au livreur. Le livreur ne peut livrer que les produits chargés.

* Le livreur exécute les livraisons terrain avec suivi de statut en temps réel.

* Chaque livraison réussie génère un encaissement (espèce ou mobile money) enregistré dans le Recouvrement.

* La Trésorerie valide chaque encaissement, alimente le grand livre et paie le livreur en fin de journée.

## **B.2 Statuts officiels du Process 1**

### **Statuts Commande**

| Statut FR | Déclencheur | Code technique (EN) |
| ----- | ----- | ----- |
| CRÉÉE | SAV crée la commande via le formulaire | ORDER\_CREATED |
| CONFIRMÉE | SAV confirme après contact client | ORDER\_CONFIRMED |
| ASSIGNÉE | Dispatch affecte la commande à une mission | ORDER\_ASSIGNED |
| CHARGÉE\_PAR\_HUB | Hub charge les produits au livreur | ORDER\_LOADED |
| EN\_LIVRAISON | Livreur démarre la mission terrain | ORDER\_OUT\_FOR\_DELIVERY |
| **LIVRÉE** | **Livreur confirme la remise au client** | **ORDER\_DELIVERED** |
| **ÉCHEC\_SUR\_PLACE** | **Livreur déclare un échec après ARRIVÉE \+ 10 min** | **ORDER\_DELIVERY\_FAILED** |
| ANNULÉE | SAV ou système annule avant livraison | ORDER\_CANCELLED |

### **Statuts Mission**

| Statut FR | Déclencheur | Code technique (EN) |
| ----- | ----- | ----- |
| À\_FAIRE | Mission créée par Dispatch, non encore assignée | MISSION\_TODO |
| ASSIGNÉE | Livreur désigné, mission transmise | MISSION\_ASSIGNED |
| EN\_ATTENTE\_CHARGEMENT | Mission transmise au Hub pour préparation | MISSION\_PENDING\_LOADING |
| CHARGÉE | Hub a chargé tous les colis au livreur | MISSION\_LOADED |
| EN\_COURS | Livreur a démarré sa tournée | MISSION\_IN\_PROGRESS |
| **CLÔTURÉE** | **Trésorerie a validé le point financier de fin de mission** | **MISSION\_CLOSED** |

### **Statuts Terrain Livreur**

| Statut FR | Signification / Condition | Code technique (EN) |
| ----- | ----- | ----- |
| DÉMARRÉE | Livreur est en route vers l'adresse client | DELIVERY\_STARTED |
| ARRIVÉE | Livreur est arrivé à l'adresse client (GPS) | DELIVERY\_ARRIVED |
| **LIVRÉE** | **Remise effectuée \+ paiement encaissé \+ confirmation** | **DELIVERY\_COMPLETED** |
| **ÉCHEC\_SUR\_PLACE** | **Échec constaté après ARRIVÉE \+ 10 min minimum** | **DELIVERY\_FAILED\_ONSITE** |

### **Statuts Recouvrement**

| Statut FR | Signification | Code technique (EN) |
| ----- | ----- | ----- |
| À\_ENCAISSER | Paiement espèce reçu terrain, en attente de validation Trésorerie | RECOVERY\_PENDING\_CASH |
| EN\_ATTENTE\_VALIDATION | Mobile Money détecté, en attente de confirmation opérateur | RECOVERY\_PENDING\_MM |
| **VALIDÉ** | **Trésorerie a confirmé la réception de l'argent** | **RECOVERY\_VALIDATED** |
| **LITIGE** | **Écart constaté, litige ouvert par Trésorerie** | **RECOVERY\_DISPUTED** |

## **B.3 Logique métier globale du Process 1**

Le Process 1 suit une chaîne linéaire stricte. Chaque étape valide la précédente et autorise la suivante. Aucun raccourci n'est autorisé.

| Étape | Acteur | Action | Résultat obligatoire |
| ----- | ----- | ----- | ----- |
| 1 | SAV | Crée la commande via formulaire 6 étapes | Commande → CRÉÉE |
| 2 | SAV | Confirme après contact client réussi | Commande → CONFIRMÉE. Visible Dispatch. |
| 3 | Dispatch | Groupe les commandes par zone, crée mission, assigne livreur | Mission créée. Commande → ASSIGNÉE. |
| 4 | Hub | Réserve les produits, prépare les colis, charge le livreur | Stock livreur créé. Commande → CHARGÉE\_PAR\_HUB. |
| 5 | Livreur | Démarre la mission, se rend à chaque adresse | Commande → EN\_LIVRAISON. |
| **6a** | **Livreur** | **Livre le colis, encaisse le paiement (espèce ou MM)** | **Commande → LIVRÉE. Recouvrement créé.** |
| **6b** | **Livreur** | **Déclare échec après ARRIVÉE \+ 10 min** | **Commande → ÉCHEC\_SUR\_PLACE. SAV notifié.** |
| 7 | Trésorerie | Valide les encaissements du recouvrement | Statut → VALIDÉ. Grand Livre alimenté. |
| 8 | Trésorerie | Paye le livreur en fin de journée | Sortie d'argent. Grand Livre. Mission → CLÔTURÉE. |

## **B.4 Description détaillée des vues du Process 1**

### **VUE P1-1 — Vue SAV (Création et confirmation des commandes)**

**Rôles autorisés**

* CS\_SAV : accès complet — création, confirmation, annulation, rappel

* Manager SAV : accès complet \+ supervision de la file

* CEO : lecture seule

**Objectif métier**

Permettre au SAV de créer et confirmer des commandes client pour les rendre disponibles au Dispatch. Centraliser la gestion des rappels, des annulations et du scoring risque.

**Données affichées**

* File d'attente : liste des commandes avec statuts CRÉÉE / CONFIRMÉE / ANNULÉE

* Pour chaque commande : client, téléphone, zone, produit(s), montant total, score risque (badge couleur)

* Historique des appels sur la commande

* Rappels planifiés du jour

* KPI SAV du jour : taux confirmation, nombre de commandes créées, appels passés

**Formulaire — Création commande (6 étapes)**

| Étape | Nom | Champs obligatoires | Champs automatiques |
| ----- | ----- | ----- | ----- |
| 1 | Client | Téléphone principal (format 10 chiffres CI) | Recherche client existant |
| 2 | Adresse | Commune, quartier, REPÈRE PHYSIQUE (min. 10 car.) | Zone auto-détectée par commune |
| 3 | Zone & Frais | Validation zone (modifiable par OPS uniquement) | Frais de livraison calculés auto |
| 4 | Produits | Produit(s), quantité(s) | Prix unitaire, coût complet, alerte si stock \< qté |
| 5 | Upsell | Optionnel si score client ≥ 60 et panier \< 30 000 XOF | Suggestions automatiques |
| 6 | Confirmation | Validation finale agent | Récapitulatif complet, montant total, WhatsApp auto |

**Champs verrouillés**

* Prix unitaire (défini dans le catalogue, non modifiable par SAV)

* Zone de livraison (modifiable uniquement par OPS/Dispatch)

* Score risque client (calculé automatiquement par le système)

**Boutons et logique métier**

| Bouton | Logique métier | Conditions / Garde |
| ----- | ----- | ----- |
| Créer commande | Crée la commande en statut CRÉÉE. Calcule le score risque. Enregistre agent, timestamp. Alerte audit. | Tous champs obligatoires remplis. |
| **Confirmer** | **Passe la commande en CONFIRMÉE. Notif WhatsApp au client (ETA). Commande visible chez Dispatch. Audit log.** | **Statut actuel \= CRÉÉE.** |
| Planifier rappel | Crée un rappel avec date/heure. Notification à l'agent à l'heure choisie. | Commande en CRÉÉE ou CONFIRMÉE. |
| **Annuler** | **Passe en ANNULÉE. Motif obligatoire. Libère le stock réservé. Notif WA client. Audit log.** | **Motif annulation obligatoire. Statut ≠ LIVRÉE.** |
| Ajouter upsell | Ajoute un produit upsell à la commande. Recalcule le total. | Score client ≥ 60\. Commande en CRÉÉE. |

**Validations bloquantes**

* Téléphone client : format 10 chiffres CI obligatoire

* REPÈRE PHYSIQUE adresse : minimum 10 caractères, champ obligatoire

* Au moins un produit dans la commande avec quantité \> 0

* Stock disponible ≥ quantité demandée (alerte bloquante ou avertissement selon politique)

**Mises à jour inter-départements**

* Commande CONFIRMÉE → apparaît automatiquement dans la file Dispatch

* Commande ANNULÉE → libère les quantités réservées dans le stock Hub

**Alertes automatiques**

* Score risque client rouge (\< 35\) : bandeau orange \+ message recommandation annulation

* Rappel callback en retard : alerte agent

* Taux confirmation \< 60% sur la journée : alerte manager SAV

### **VUE P1-2 — Vue Dispatch (Groupage et assignation missions)**

**Rôles autorisés**

* OPS\_DISPATCH : accès complet

* Manager OPS : accès complet

* CEO : lecture seule

**Objectif métier**

Permettre au Dispatch de visualiser les commandes confirmées, de les grouper par zone, de créer des missions et d'assigner les livreurs disponibles.

**Données affichées**

* File des commandes CONFIRMÉES, triées par zone géographique

* Livreurs disponibles avec : zone habituelle, capacité restante, score de dispatch, statut check-in

* Missions en cours du jour et leur état

* Pour chaque commande : client, zone, montant, score risque, repère adresse

**Formulaire — Création de mission**

* Zone (obligatoire, liste fermée des zones Abidjan \+ intérieur)

* Livreur assigné (obligatoire, sélection depuis liste des livreurs disponibles de la zone)

* Créneau horaire : MATIN (8h-13h) / APRÈS-MIDI (14h-18h) / JOURNÉE ENTIÈRE

* Sélection des commandes à inclure (checkboxes, filtrées par zone)

* Champs automatiques : nombre de colis, montant total mission, calcul score dispatch

**Champs verrouillés**

* Zone de la commande (figée depuis SAV, modifiable uniquement par OPS\_DISPATCH)

* Montant total mission (calculé automatiquement)

* Score dispatch livreur (calculé automatiquement)

**Boutons et logique métier**

| Bouton | Logique métier | Conditions |
| ----- | ----- | ----- |
| Créer mission | Crée la mission. Commandes → ASSIGNÉES. Mission → ASSIGNÉE. Alerte Hub. Alerte livreur. Audit log. | Zone \+ livreur \+ 1 commande min. |
| Assignation groupée | Assigne N commandes de la même zone au même livreur en une action. Crée une seule mission. | Toutes les commandes sélectionnées dans la même zone. |
| Modifier zone | Change la zone d'une commande. Recalcule les frais de livraison. Audit log. | Commande en CONFIRMÉE uniquement. |
| Réassigner livreur | Change le livreur d'une mission existante. Notifie l'ancien et le nouveau livreur. Audit log. | Mission en ASSIGNÉE ou EN\_ATTENTE\_CHARGEMENT. |
| **Annuler mission** | **Annule la mission. Remet les commandes en CONFIRMÉE. Audit log.** | **Mission pas encore CHARGÉE.** |

**Validations bloquantes**

* Livreur doit avoir effectué son check-in du matin pour être éligible à une mission

* Livreur SUSPENDU ou GELÉ : exclu automatiquement de la liste

* Capacité livreur (max colis) : alerte si dépassement, blocage si double capacité

**Mises à jour inter-départements**

* Mission créée → notification Hub pour préparation du chargement

* Mission créée → notification livreur (app mobile)

* Commandes assignées → statut ASSIGNÉE visible SAV

**Alertes automatiques**

* Commande confirmée depuis plus de 2h sans assignation : alerte Dispatch

* Livreur disponible mais sans mission depuis le matin : alerte Manager OPS

### **VUE P1-3 — Vue Hub Chargement / Réappro**

**Rôles autorisés**

* WH\_HUB (Hub Manager, Stock Manager) : accès complet

* CEO : lecture seule

**Objectif métier**

Permettre au Hub de préparer, réserver et charger les produits au livreur en début de mission. Gérer les réapprovisionnements en cours de journée si nécessaire.

**Données affichées**

* Missions assignées en attente de chargement

* Pour chaque mission : livreur, zone, liste des commandes, liste des produits à préparer

* Stock disponible par produit (qty\_disponible / qty\_réservée / qty\_physique)

* État du chargement actuel du livreur

**Formulaire — Chargement livreur**

| Champ | Type | Règle |
| ----- | ----- | ----- |
| Mission concernée | Sélection (liste fermée) | Obligatoire. Missions ASSIGNÉES uniquement. |
| Livreur | Auto (lié à la mission) | Verrouillé, calculé auto. |
| Produit | Sélection catalogue \+ scan barcode | Obligatoire par ligne. |
| Quantité chargée | Saisie numérique | Obligatoire. ≤ stock disponible. |
| Photo de vérification | Upload photo | Recommandé. Obligatoire si litige précédent avec ce livreur. |

**Boutons et logique métier**

| Bouton | Logique métier | Conditions |
| ----- | ----- | ----- |
| Scanner article | Identifie le produit par barcode. Pré-remplit la ligne de chargement. | Barcode doit exister dans le catalogue. |
| **Valider chargement** | **Crée mouvements stock : RÉSERVÉ\_HUB → CHARGÉ\_LIVREUR pour chaque produit. Mission → CHARGÉE. Commandes → CHARGÉES\_PAR\_HUB. Notif livreur. Audit log.** | **Toutes les commandes de la mission ont leurs produits chargés.** |
| Réapprovisionner livreur | Ajoute des produits au stock livreur en cours de journée. Crée mouvement stock RÉAPPROVISIONNÉ. Audit log. | Mission en EN\_COURS. Livreur actif. |
| **Retirer un produit** | **Retire un produit du chargement avant départ. Crée mouvement stock RETOUR\_HUB. Audit log.** | **Mission pas encore EN\_COURS.** |

**Mouvements de stock automatiques**

* RÉSERVÉ\_HUB : produit réservé pour une commande confirmée, avant chargement physique

* CHARGÉ\_LIVREUR : chargement physique au livreur — qty\_disponible Hub diminue, stock\_livreur augmente

* RÉAPPROVISIONNÉ : ajout en cours de journée — nouveau mouvement CHARGÉ\_LIVREUR additionnel

**Validations bloquantes**

* Quantité chargée \> stock disponible Hub : BLOQUÉ

* Produit non présent dans la liste des commandes de la mission : alerte avant validation

**Alertes automatiques**

* Mission assignée depuis plus de 30 min sans début de chargement : alerte Hub

* Stock d'un produit de la mission \< seuil d'alerte : alerte Hub \+ OPS

### **VUE P1-4 — Vue Livreur Mission (App mobile terrain)**

**Rôles autorisés**

* FIELD\_DRIVER : accès complet sur ses propres missions uniquement

**Objectif métier**

Interface mobile ultra-simplifiée permettant au livreur de gérer sa mission terrain : suivi des livraisons, encaissement, déclaration d'échec, visibilité en temps réel sur son stock et ses encaissements.

**Données affichées**

* Sa mission du jour : zone, créneau, nombre de colis

* Liste des commandes triée par ordre de tournée optimisé

* Pour chaque commande : adresse \+ REPÈRE, client, numéro de téléphone, montant à encaisser

* Son stock chargé : quantité initiale par produit

* Son stock restant : quantité en temps réel par produit

* Montant total mission à encaisser

* Montant encaissé à l'instant (espèce \+ mobile money)

**Formulaire — Livraison réussie**

| Champ | Type | Règle |
| ----- | ----- | ----- |
| Moyen de paiement | ESPÈCE / MOBILE MONEY | Obligatoire. Liste fermée. |
| Référence Mobile Money | Texte | Obligatoire si MOBILE MONEY sélectionné. |
| Photo preuve livraison | Upload / Caméra | Obligatoire. GPS embedé dans EXIF automatiquement. |
| Signature client | Signature digitale | Obligatoire. |
| Commentaire terrain | Texte libre | Facultatif. |

**Formulaire — Échec sur place**

| Champ | Type | Règle |
| ----- | ----- | ----- |
| Motif échec | Liste fermée | Obligatoire. Options : CLIENT\_ABSENT / CLIENT\_REFUSE / MAUVAISE\_ADRESSE / INJOIGNABLE / AUTRE. |
| Photo preuve présence | Upload / Caméra | Obligatoire. GPS embedé. |
| Commentaire | Texte libre | Obligatoire si motif \= AUTRE. |

**Boutons et logique métier**

| Bouton | Logique métier | Conditions / Garde |
| ----- | ----- | ----- |
| Démarrer mission | Mission → EN\_COURS. Toutes commandes → EN\_LIVRAISON. GPS départ enregistré. Audit log. | Mission \= CHARGÉE. Check-in matin validé. |
| Arriver à l'adresse | Statut terrain → ARRIVÉE. Timestamp enregistré. Démarre le compteur 10 min. | Mission en EN\_COURS. |
| **Livrer — Confirmer** | **Statut terrain → LIVRÉE. Commande → LIVRÉE. Mouvement stock VENDU. Recouvrement créé selon moyen paiement. Notif WA client. Audit log.** | **Statut terrain \= ARRIVÉE. Photo \+ signature \+ moyen paiement remplis.** |
| **Déclarer échec** | **Statut terrain → ÉCHEC\_SUR\_PLACE. Commande → ÉCHEC\_SUR\_PLACE. SAV notifié. Audit log. Produit reste dans stock livreur.** | **Statut terrain \= ARRIVÉE depuis 10 min minimum. Motif \+ photo obligatoires.** |
| Naviguer | Ouvre Google Maps vers l'adresse client (client-side uniquement). | Toujours disponible. |
| Appeler client | Compose le numéro du client. | Toujours disponible. |

**Mouvements de stock automatiques**

* Commande LIVRÉE → mouvement VENDU sur le stock livreur (stock livreur diminue)

**Écritures financières automatiques**

* Paiement ESPÈCE : création d'une ligne Recouvrement statut À\_ENCAISSER

* Paiement MOBILE MONEY : création d'une ligne Recouvrement statut EN\_ATTENTE\_VALIDATION

* Aucune écriture grand livre créée par le livreur — uniquement par la Trésorerie

**Champs verrouillés**

* Montant à encaisser (calculé depuis la commande, jamais saisi par le livreur)

* Historique de mission (append-only)

**Contrainte offline**

**L'app livreur doit fonctionner en mode offline (zones 2G/3G). Les actions sont stockées localement et synchronisées au retour de connectivité. Un bandeau HORS LIGNE est affiché en permanence si pas de réseau.**

**Alertes automatiques**

* Compteur 10 min visible après ARRIVÉE (avant que ÉCHEC\_SUR\_PLACE soit disponible)

* Alerte si GPS photo hors rayon 2km de l'adresse client → flag fraude FD2

### **VUE P1-5 — Vue Recouvrement**

**Rôles autorisés**

* FIN\_TREASURY (Trésorier) : accès complet — validation, litige

* Manager Finance : accès complet

* CEO : lecture seule

**Objectif métier**

Centraliser tous les encaissements terrain en attente de validation. Permettre à la Trésorerie de valider chaque paiement, choisir le compte de destination et créer les écritures comptables.

**Données affichées**

* Liste des encaissements du jour par mission et par livreur

* Statuts : À\_ENCAISSER / EN\_ATTENTE\_VALIDATION / VALIDÉ / LITIGE

* Pour chaque ligne : commande, client, livreur, montant, moyen paiement, référence MM, heure

* Total encaissé par livreur / Total validé / Total en attente

**Formulaire — Validation encaissement**

| Champ | Type | Règle |
| ----- | ----- | ----- |
| Compte de destination | Sélection (liste fermée) | Obligatoire. Compte trésorerie actif. |
| Montant validé | Numérique | Pré-rempli avec montant commande. Modifiable si écart justifié. |
| Référence vérification MM | Texte | Obligatoire si moyen paiement \= MOBILE MONEY. |
| Justification écart | Texte libre | Obligatoire si montant validé ≠ montant attendu. |

**Boutons et logique métier**

| Bouton | Logique métier | Conditions |
| ----- | ----- | ----- |
| **Valider encaissement** | **Recouvrement → VALIDÉ. Crée transaction financière (2 écritures GL : débit caisse/MM \+ crédit compte produit). MAJ solde compte. Audit log.** | **Compte destination défini. Montant ≥ 0\.** |
| **Mettre en litige** | **Recouvrement → LITIGE. Crée dossier litige. Alerte Trésorerie \+ CEO. Audit log.** | **Justification obligatoire.** |
| Valider en lot | Valide N lignes d'un même livreur en une action. Compte destination unique obligatoire. | Toutes les lignes sélectionnées \= même livreur, même moyen paiement. |

**Écritures financières automatiques**

**Chaque validation crée EXACTEMENT 2 écritures dans le grand livre : une ligne débit et une ligne crédit. Si erreur technique, les deux sont annulées ensemble (rollback). Jamais une seule ligne.**

**Alertes automatiques**

* Encaissement espèce non validé depuis plus de 2h : alerte Trésorerie

* Mobile money non confirmé depuis plus de 24h : alerte P1 Trésorerie

### **VUE P1-6 — Vue Trésorerie Point Mission / Paiement Livreur**

**Rôles autorisés**

* FIN\_TREASURY : accès complet

* CEO : lecture seule

**Objectif métier**

Effectuer le point financier de fin de mission pour chaque livreur : récapitulatif encaissements, calcul de la commission, paiement du livreur, écriture dans le grand livre, clôture de la mission.

**Données affichées**

* Pour chaque livreur du jour : mission(s), commandes livrées, montant total encaissé, montant validé Trésorerie, commission calculée, solde à payer

* Comptes disponibles pour paiement (soldes en temps réel)

* État du rapprochement : validé ✓ / en attente / litige ⚠

**Formulaire — Paiement livreur**

| Champ | Type | Règle |
| ----- | ----- | ----- |
| Livreur | Sélection (liste) | Obligatoire. |
| Mission(s) concernée(s) | Auto | Pré-rempli. Missions du jour du livreur. |
| Montant commission calculé | Automatique | Calculé selon tarif zone × type événement. Verrouillé. |
| Ajustement éventuel | Numérique | Seulement si erreur prouvée. Justification obligatoire. |
| Compte source paiement | Sélection (liste fermée) | Obligatoire. Compte avec solde suffisant. |
| Moyen de paiement livreur | ESPÈCE / MOBILE MONEY | Obligatoire. |
| Référence paiement | Texte | Obligatoire si MOBILE MONEY. |

**Boutons et logique métier**

| Bouton | Logique métier | Conditions |
| ----- | ----- | ----- |
| **Payer livreur** | **Crée transaction de sortie d'argent. 2 écritures GL (débit compte rémunération \+ crédit compte source). MAJ solde compte. Statut commission → PAYÉE. Mission → CLÔTURÉE. Audit log.** | **Tous les encaissements de la mission \= VALIDÉ ou LITIGE formel. Pas de litige ouvert non résolu.** |
| **Suspendre paiement** | **Bloque le paiement livreur tant que litige non résolu. Alerte livreur \+ CEO.** | **Litige mission ouvert.** |
| Exporter rapport mission | Génère un PDF récapitulatif de la mission (stock chargé, livré, encaissé, payé). | Mission CLÔTURÉE. |

**Écritures financières automatiques**

* Paiement livreur : débit compte commissions/rémunérations \+ crédit compte de paiement choisi

* Toutes les 2 écritures alimentent le grand livre en mode append-only

**Alertes automatiques**

* Mission non clôturée à 22h00 : alerte Trésorerie \+ CEO

* Livreur avec encaissement non validé depuis plus de 24h : alerte P0

# **PARTIE C — PROCESS 2 : RETOUR SOIR, RÉINTÉGRATION STOCK, LITIGES, CLÔTURE HUB**

## **C.1 Résumé du Process 2**

Le Process 2 commence à la fin de la mission terrain du livreur. Il couvre le retour physique des produits non livrés au Hub, leur inspection, la réintégration du stock vendable, le classement des produits endommagés, la gestion des litiges, et la clôture complète de la mission côté stock et côté finances.

**Le Process 2 garantit qu'aucun produit ne disparaît silencieusement. Tout produit chargé doit soit être vendu (Process 1), soit revenir au Hub et être traité (Process 2).**

## **C.2 Statuts officiels du Process 2**

### **Statuts Retour Mission**

| Statut FR | Signification | Code technique (EN) |
| ----- | ----- | ----- |
| EN\_ATTENTE\_RETOUR\_SOIR | Mission terminée terrain, retour Hub non encore présenté | RETURN\_PENDING |
| RETOUR\_REÇU\_HUB | Hub a réceptionné le retour physique du livreur | RETURN\_RECEIVED |
| RETOUR\_CONTRÔLÉ | Tous les articles du retour ont été inspectés et classés | RETURN\_CONTROLLED |
| **RETOUR\_CLOTURÉ** | **Clôture stock complète — Hub a terminé sa partie** | **RETURN\_CLOSED** |

### **Statuts Article Retour**

| Statut FR | Signification | Code technique (EN) |
| ----- | ----- | ----- |
| EN\_ATTENTE\_INSPECTION | Article retourné, en attente de contrôle Hub | RETURN\_ITEM\_PENDING |
| **REMIS\_EN\_STOCK** | **Article bon état, réintégré dans le stock vendable Hub** | **RETURN\_ITEM\_RESTOCKED** |
| **ENDOMMAGÉ** | **Article abîmé, sorti du stock vendable, classé en perte** | **RETURN\_ITEM\_DAMAGED** |
| **EN\_LITIGE** | **Article manquant, introuvable, ou cas ambigu — litige ouvert** | **RETURN\_ITEM\_DISPUTED** |

### **Statuts Anomalie Mission**

| Statut FR | Déclenchement | Code technique (EN) |
| ----- | ----- | ----- |
| **AUCUN\_ÉCART** | **Stock chargé \= stock livré \+ stock retourné. Argent \= argent validé.** | **MISSION\_NO\_DISCREPANCY** |
| **ÉCART\_STOCK** | **Écart entre stock théorique et stock physique retourné** | **MISSION\_STOCK\_GAP** |
| **ÉCART\_ARGENT** | **Encaissement validé ≠ montant attendu des livraisons** | **MISSION\_CASH\_GAP** |
| **ÉCART\_MIXTE** | **Écart stock ET écart argent simultanément** | **MISSION\_MIXED\_GAP** |
| **LITIGE\_OUVERT** | **Litige formellement ouvert, en cours d'investigation** | **MISSION\_DISPUTE\_OPEN** |
| LITIGE\_RÉSOLU | Litige clôturé avec décision documentée | MISSION\_DISPUTE\_RESOLVED |

## **C.3 Logique métier globale du Process 2**

Le Process 2 suit une logique de rapprochement comptable appliquée au stock et aux finances. L'équation de base à vérifier est :

**Stock chargé (matin) \+ Stock réapprovisionné (journée) \= Stock livré (vendu) \+ Stock retourné (physique) \+ Produits endommagés \+ Produits en litige**

| Étape | Acteur | Action | Résultat obligatoire |
| ----- | ----- | ----- | ----- |
| 1 | Livreur | Déclare fin de mission, présente retour au Hub | Retour mission → EN\_ATTENTE\_RETOUR\_SOIR |
| 2 | Hub | Réceptionne physiquement le retour, scanne les articles | Retour mission → RETOUR\_REÇU\_HUB |
| 3 | Hub | Inspecte chaque article : bon état / endommagé / manquant | Articles → REMIS\_EN\_STOCK ou ENDOMMAGÉ ou EN\_LITIGE |
| 4 | Hub | Calcule les écarts stock (théorique vs physique) | Anomalie mission qualifiée : AUCUN\_ÉCART ou ÉCART\_STOCK |
| 5 | Hub \+ Trésorerie | Contrôle croisé stock \+ argent sur la mission | Anomalie finale : AUCUN\_ÉCART / ÉCART\_ARGENT / ÉCART\_MIXTE |
| **6a** | **Hub \+ Trésorerie** | **Clôture sans écart** | **Mission → RETOUR\_CLOTURÉ. AUCUN\_ÉCART.** |
| **6b** | **Hub \+ Trésorerie** | **Clôture avec litige formel** | **LITIGE\_OUVERT. Mission clôturée opérationnellement.** |
| 7 | SAV | Suivi post-livraison / post-échec. Reprogrammation si nécessaire. | Relances, nouvelles commandes, escalades. |
| 8 | Trésorerie | Gère les litiges financiers de mission | LITIGE\_RÉSOLU avec trace d'audit complète. |

## **C.4 Description détaillée des vues du Process 2**

### **VUE P2-1 — Vue Livreur Fin de Mission / Retour Soir**

**Rôles autorisés**

* FIELD\_DRIVER : accès complet sur ses propres missions

**Objectif métier**

Permettre au livreur de déclarer officiellement la fin de sa mission, de présenter son stock restant et ses retours au Hub, et d'initier la procédure de retour soir.

**Données affichées**

* Mission du jour : commandes livrées / commandes échouées / commandes annulées

* Stock chargé initial par produit

* Stock restant théorique calculé automatiquement (= chargé − livré)

* Produits à retourner au Hub (quantités auto-calculées)

* Statut de retour soir courant

**Formulaire — Déclaration fin de mission**

| Champ | Type | Règle |
| ----- | ----- | ----- |
| Confirmation retour au Hub | Checkbox / Bouton | Obligatoire. |
| Commentaire terrain | Texte libre | Facultatif. |
| Motif retour si anomalie | Texte libre / liste | Obligatoire si anomalie signalée. |
| Photo article suspect | Upload / Caméra | Obligatoire si anomalie signalée. |

**Champs automatiques (verrouillés)**

* Stock restant théorique par produit (calculé \= chargé − livré)

* Liste des produits non livrés

* Liste des commandes en échec

* Mission liée

**Boutons et logique métier**

| Bouton | Logique métier | Conditions |
| ----- | ----- | ----- |
| Déclarer fin de mission | Mission → EN\_ATTENTE\_RETOUR\_SOIR. Statut retour \= EN\_ATTENTE\_RETOUR\_SOIR. Notification Hub. Audit log. | Mission en EN\_COURS. |
| Présenter retour au Hub | Signale au Hub que le livreur est présent et prêt au contrôle. Crée file de réception retour côté Hub. | Mission \= EN\_ATTENTE\_RETOUR\_SOIR. |
| **Signaler anomalie** | **Ouvre une alerte interne avant contrôle Hub. Enregistre la nature de l'anomalie déclarée par le livreur.** | **Toujours disponible en fin de mission.** |
| Confirmer remise au Hub | Lie le livreur au processus de réception retour. Enregistre heure de remise. Audit log. | Hub a commencé le contrôle. |

**Alertes automatiques**

* Mission terminée mais retour non présenté au Hub depuis plus de 1h : alerte Hub \+ OPS

* Produit non livré et non déclaré en retour : alerte automatique sur tableau de bord Hub

### **VUE P2-2 — Vue Hub Réception Retour Soir**

**Rôles autorisés**

* WH\_HUB (Hub Manager, Stock Manager) : accès complet

* CEO : lecture seule

**Objectif métier**

Recevoir physiquement le retour soir du livreur, inspecter chaque article, qualifier son état, créer les mouvements de stock correspondants, et calculer les écarts entre théorique et physique.

**Données affichées**

* Mission et livreur concernés

* Stock chargé le matin par produit

* Stock réapprovisionné en journée par produit

* Stock théorique restant (calculé auto)

* Stock physique retourné (à saisir)

* Écart calculé par ligne (théorique − physique)

* État de chaque article (à qualifier)

**Formulaire — Réception retour soir**

| Champ | Type | Règle |
| ----- | ----- | ----- |
| Mission | Sélection | Obligatoire. Missions EN\_ATTENTE\_RETOUR\_SOIR. |
| Produit | Sélection / Scan barcode | Obligatoire par ligne. |
| Quantité physique reçue | Numérique | Obligatoire. ≥ 0\. |
| État article | Liste fermée : BON\_ÉTAT / ENDOMMAGÉ / LITIGE | Obligatoire par article retourné. |
| Photo preuve si endommagé | Upload / Caméra | Obligatoire si état \= ENDOMMAGÉ. |
| Note Hub | Texte libre | Facultatif. Recommandé si écart. |
| Motif litige si écart | Texte libre | Obligatoire si état \= LITIGE. |

**Champs automatiques / verrouillés**

* Quantité théorique attendue (calculée depuis stock chargé − stock livré)

* Écart calculé automatiquement (théorique − physique)

* Heure réception (timestamp serveur)

* Nom opérateur Hub (depuis session courante)

* Historique stock mission : verrouillé

**Boutons et logique métier**

| Bouton | Logique métier | Conditions |
| ----- | ----- | ----- |
| Recevoir retour soir | Statut retour → RETOUR\_REÇU\_HUB. Horodatage. Opérateur Hub enregistré. Audit log. | Mission \= EN\_ATTENTE\_RETOUR\_SOIR. |
| Scanner article | Identifie le produit par barcode. Compare au stock théorique mission. Prépare la ligne de contrôle. | Barcode actif dans le catalogue. |
| Valider quantité reçue | Compare quantité physique vs théorique. Si 0 → ligne conforme. Si ≠ 0 → ligne anomalie créée. Calcul écart. | Produit sélectionné. |
| **Classer bon état** | **Article → REMIS\_EN\_STOCK. Mouvement stock RETOUR\_HUB \+ REMIS\_EN\_STOCK. Stock Hub augmente. Audit log.** | **État \= BON\_ÉTAT confirmé.** |
| **Classer endommagé** | **Article → ENDOMMAGÉ. Mouvement stock ENDOMMAGÉ. Stock vendable ne revient pas. Impact perte. Photo obligatoire. Audit log.** | **Photo preuve obligatoire.** |
| **Ouvrir litige stock** | **Article → EN\_LITIGE. Anomalie mission → ÉCART\_STOCK ou ÉCART\_MIXTE. Litige mission créé. Alerte OPS \+ Trésorerie \+ CEO. Audit log.** | **Quantité manquante OU produit erroné OU article introuvable.** |
| Clôturer retour mission | Statut retour → RETOUR\_CLOTURÉ. Mission stock clôturée côté Hub. Audit log. | Toutes les lignes retour traitées. Tout écart résolu ou en litige formel. |

**Mouvements de stock automatiques**

| Mouvement | Déclencheur | Impact stock Hub |
| ----- | ----- | ----- |
| RETOUR\_HUB | Article physiquement reçu au Hub | Neutre — en attente d'inspection |
| **REMIS\_EN\_STOCK** | **Article classé bon état** | **qty\_disponible Hub augmente** |
| **ENDOMMAGÉ** | **Article classé endommagé** | **qty\_endommagé augmente — hors stock vendable** |
| **AJUSTEMENT\_VALIDÉ** | **Résolution de litige avec décision manager uniquement** | **Selon décision — trace d'audit obligatoire** |

**JAMAIS de correction silencieuse. Toute modification de stock crée un mouvement explicit tracé.**

**Alertes automatiques**

* Produit retour sans scan ni validation depuis plus de 30 min : alerte Hub

* Produit endommagé sans photo : alerte bloquante avant classement

* Écart stock détecté : alerte P1 → OPS \+ Trésorerie \+ CEO

* Retour en attente d'inspection depuis plus de 2h : alerte manager Hub

### **VUE P2-3 — Vue Contrôle Croisé Mission (Hub \+ Trésorerie)**

**Rôles autorisés**

* WH\_HUB (Hub Manager) : accès complet — axe stock

* FIN\_TREASURY (Trésorier) : accès complet — axe argent

* Manager OPS : accès complet

* CEO : lecture seule

**Objectif métier**

Comparer la mission sur deux axes simultanément — stock et argent — pour qualifier l'anomalie finale, assigner les responsabilités de résolution et clôturer la mission définitivement.

**Données affichées**

* Récapitulatif stock mission : chargé / réapprovisionné / livré / retourné / endommagé / manquant

* Récapitulatif financier : encaissements attendus / validés / écart argent

* Statut anomalie actuel

* Dossier litige existant le cas échéant

**Formulaire — Contrôle croisé**

| Champ | Type | Règle |
| ----- | ----- | ----- |
| Note conjointe | Texte libre | Facultatif mais recommandé. |
| Type d'écart qualifié | Liste fermée | Obligatoire si écart détecté. |
| Décision | Texte libre \+ liste | Obligatoire si litige ouvert. |
| Responsable résolution | Sélection utilisateur | Obligatoire si litige. |
| Date limite résolution | Date | Obligatoire si litige. |

**Boutons et logique métier**

| Bouton | Logique métier | Conditions |
| ----- | ----- | ----- |
| Créer anomalie mission | Crée un dossier d'écart mission. Lie stock \+ recouvrement \+ livreur. Audit log. | Écart détecté. |
| Qualifier écart | Sélection : AUCUN\_ÉCART / ÉCART\_STOCK / ÉCART\_ARGENT / ÉCART\_MIXTE. Anomalie mise à jour. | Dossier anomalie créé. |
| Assigner résolution | Assigne à Hub / Trésorerie / OPS / Manager. Fixe SLA. Notification du responsable. | Écart qualifié. |
| **Clôturer sans écart** | **Anomalie → AUCUN\_ÉCART. Mission → RETOUR\_CLOTURÉ. Clôture complète. Audit log.** | **Écart stock \= 0 ET écart argent \= 0\.** |
| **Clôturer avec litige** | **Anomalie → LITIGE\_OUVERT. Mission fermée opérationnellement mais marquée litigieuse. Audit log.** | **Au moins un écart non résolu.** |

**Alertes automatiques**

* Mission clôturée côté argent mais pas côté stock : alerte P1 Hub \+ Trésorerie

* Litige mission ouvert depuis plus de 48h sans responsable assigné : alerte CEO

### **VUE P2-4 — Vue SAV Suivi Post-Livraison / Post-Échec**

**Rôles autorisés**

* CS\_SAV : accès complet

* Manager SAV : accès complet

* CEO : lecture seule

**Objectif métier**

Permettre au SAV de suivre ce qui s'est passé après le terrain pour chaque commande : livraison réussie, échec, refus, retour. Gérer les relances, les reprogrammations et les clôtures relationnelles.

**Données affichées**

* Pour chaque commande post-terrain : statut final, motif échec, besoin relance

* Commandes à recontacter (ÉCHEC\_SUR\_PLACE → reprogrammation possible)

* Statut retour article si retour physique concerné

* Historique des tentatives de livraison par commande

**Formulaire — Suivi post-terrain**

| Champ | Type | Règle |
| ----- | ----- | ----- |
| Décision SAV | Liste fermée : RELANCER / REPROGRAMMER / CLÔTURER / ESCALADER | Obligatoire. |
| Date de reprogrammation | Date \+ créneau | Obligatoire si décision \= REPROGRAMMER. |
| Commentaire | Texte libre | Facultatif. |
| Escalade litige | Checkbox \+ motif | Obligatoire si décision \= ESCALADER. |

**Boutons et logique métier**

| Bouton | Logique métier | Conditions |
| ----- | ----- | ----- |
| Relancer client | Crée un rappel SAV pour le client lié à la commande échouée. | Commande en ÉCHEC\_SUR\_PLACE. |
| Reprogrammer | Recrée une commande opérationnelle avec nouveau créneau. Ou remet la commande en CONFIRMÉE pour un nouveau cycle. Selon politique business. | Commande en ÉCHEC\_SUR\_PLACE. Max 3 tentatives configurables. |
| Clôturer dossier client | Clôture le cycle relationnel de cette commande. Commande → ANNULÉE si non livrée. Notif client si applicable. | Décision finale prise. |
| **Escalader litige** | **Crée un ticket de litige inter-départements (SAV \+ Hub \+ Trésorerie). Audit log.** | **Motif obligatoire.** |

**Alertes automatiques**

* Commande ÉCHEC\_SUR\_PLACE sans action SAV depuis plus de 2h : alerte manager SAV

* 3ème tentative d'échec sur la même commande : alerte manager SAV \+ CEO

### **VUE P2-5 — Vue Trésorerie Litiges Mission**

**Rôles autorisés**

* FIN\_TREASURY (Trésorier) : accès complet

* Responsable Finance : accès complet

* CEO : lecture seule

**Objectif métier**

Traiter les litiges financiers liés aux missions : argent manquant, mobile money incohérent, mission non soldée, paiement livreur suspendu. Assurer la traçabilité complète de chaque résolution.

**Données affichées**

* Liste des litiges mission ouverts et en cours

* Pour chaque litige : mission, livreur, montant attendu, montant validé, montant payé, écart, justification

* Statut litige : LITIGE\_OUVERT / LITIGE\_RÉSOLU

* Mouvements financiers liés à la mission

**Formulaire — Traitement litige**

| Champ | Type | Règle |
| ----- | ----- | ----- |
| Justification | Texte libre | Obligatoire. |
| Décision | Liste \+ texte libre | Obligatoire. |
| Montant ajusté | Numérique | Seulement si correction financière permise. Validation manager requise. |
| Compte impacté | Sélection (liste fermée) | Obligatoire si correction financière. |
| Note finale | Texte libre | Obligatoire avant clôture litige. |
| Pièce justificative | Upload fichier | Obligatoire pour LITIGE\_RÉSOLU. |

**Boutons et logique métier**

| Bouton | Logique métier | Conditions |
| ----- | ----- | ----- |
| **Ouvrir litige** | **Statut litige → LITIGE\_OUVERT. Paiement livreur bloqué si nécessaire. Audit log.** | **Écart identifié.** |
| Suspendre paiement livreur | Interdit la sortie d'argent pour ce livreur et cette mission tant que non résolu. Flag sur livreur. | Litige ouvert sur la mission. |
| Résoudre litige | Documente la résolution. Réactive les flux si besoin. Crée éventuellement une nouvelle écriture comptable correctrice (jamais modification de l'ancienne). Audit log. | Justification \+ décision remplies. |
| **Clôturer litige** | **Statut litige → LITIGE\_RÉSOLU. Audit log complet. Notif CEO. Paiement livreur débloqué si applicable.** | **Décision prise. Justificatif présent. Pièce jointe uploadée.** |

**Toute correction financière crée une NOUVELLE écriture dans le grand livre. Jamais de modification d'une ancienne écriture. Logique append-only stricte.**

**Alertes automatiques**

* Paiement livreur tenté alors que litige mission ouvert : blocage automatique \+ alerte Trésorerie

* Litige ouvert depuis plus de 48h : alerte CEO

* Mission financièrement soldée mais litige stock toujours ouvert : alerte contrôle croisé

# **PARTIE D — TABLES MÉTIER MINIMALES**

Tables minimales requises pour faire tourner les Process 1 et 2\. Ces tables sont présentées dans leur rôle métier, avec les champs essentiels et les relations clés.

### **Table : commandes**

Entité centrale du système. Une commande \= une vente potentielle à un client.

**Champs importants**

* id, store\_id, client\_id, zone\_id, agent\_id

* statut (ENUM 8 valeurs)

* statut\_sav (ENUM 5 valeurs)

* statut\_ops (ENUM 5 valeurs)

* montant\_total (INT XOF)

* frais\_livraison (INT)

* score\_risque (0-100)

* source, canal

* timestamps : created\_at, confirmed\_at, assigned\_at, loaded\_at, dispatched\_at, delivered\_at, failed\_at

**Relations clés**

→ clients (1:1), → zones (N:1), → users/agents (N:1), → missions via mission\_commandes (N:N)

### **Table : lignes\_commande**

Détail des produits d'une commande. Chaque ligne \= un produit \+ une quantité.

**Champs importants**

* id, commande\_id, produit\_id

* quantite (INT)

* prix\_unitaire\_vente (INT)

* cout\_complet\_unitaire (INT)

* marge\_brute\_valeur (CALCULÉ)

* est\_upsell (BOOL)

* retourne (BOOL DEFAULT false)

**Relations clés**

→ commandes (N:1), → produits (N:1)

### **Table : missions**

Groupe de commandes assignées à un livreur pour un créneau donné. Unité de travail terrain.

**Champs importants**

* id, store\_id, livreur\_id, zone\_id

* statut (ENUM 6 valeurs)

* statut\_retour (ENUM 4 valeurs)

* statut\_anomalie (ENUM 6 valeurs)

* creneau (MATIN/APRÈS-MIDI/JOURNÉE)

* date\_mission

* nombre\_colis (CALCULÉ)

* montant\_total\_mission (CALCULÉ)

* sequence\_tournee (JSONB — optimisée)

**Relations clés**

→ users/livreurs (N:1), → zones (N:1), → mission\_commandes (1:N)

### **Table : mission\_commandes**

Table de jointure entre missions et commandes. Une mission peut contenir plusieurs commandes.

**Champs importants**

* id, mission\_id, commande\_id

* ordre\_tournee (INT)

* statut\_livraison\_terrain (ENUM 4 valeurs)

* heure\_arrivee, heure\_livraison, heure\_echec

**Relations clés**

→ missions (N:1), → commandes (N:1)

### **Table : clients**

Base client. Téléphone principal \= clé unique par boutique.

**Champs importants**

* id, store\_id, telephone\_principal (UNIQUE/store)

* telephone\_2, nom, email

* zone\_id, score\_risque (0-100)

* vip (BOOL), segment (ENUM)

* nb\_commandes (CALCULÉ), ltv\_total (CALCULÉ)

* source\_acquisition, created\_at

**Relations clés**

→ zones (N:1), → adresses\_clients (1:N), → commandes (1:N)

### **Table : adresses\_clients**

Adresses de livraison. Le REPÈRE PHYSIQUE est obligatoire pour toute adresse CI.

**Champs importants**

* id, client\_id, libelle, adresse\_complete

* REPERE\_PHYSIQUE (TEXT NOT NULL MIN 10 car.) ← CRITIQUE CI

* lieu\_id, latitude, longitude

* est\_defaut (BOOL)

* nb\_livraisons\_reussies, nb\_livraisons\_echouees

**Relations clés**

→ clients (N:1), → lieux (N:1)

### **Table : produits**

Catalogue produit. Coûts estimés et réels séparés pour le calcul de marge réelle.

**Champs importants**

* id, store\_id, sku (UNIQUE/store), barcode, nom

* categorie\_id, prix\_vente (INT)

* cout\_estime (INT), cout\_reel (INT)

* cout\_transit (INT), frais\_proratises (INT)

* cout\_complet\_unitaire (CALCULÉ)

* statut (ACTIF/INACTIF/RUPTURE)

* classe\_abc (A/B/C), contenu\_education

**Relations clés**

→ categories (N:1), → stock\_hub (1:1), → lignes\_commande (1:N)

### **Table : stock\_hub**

Stock physique central du Hub. Source unique de vérité pour le stock vendable.

**Champs importants**

* id, produit\_id, hub\_id

* qty\_disponible (INT)

* qty\_reservee (INT)

* qty\_en\_transit (INT)

* qty\_physique (INT)

* qty\_endommagee (INT)

* seuil\_alerte (INT)

* point\_reapprovisionnement (INT)

* conso\_moy\_journaliere (DECIMAL)

* jours\_couverture (CALCULÉ)

**Relations clés**

→ produits (1:1), → mouvements\_stock (1:N)

### **Table : stock\_livreur**

Stock chargé par le Hub au livreur pour une mission. Géré par mouvements.

**Champs importants**

* id, livreur\_id, mission\_id, produit\_id

* qty\_chargee (INT)

* qty\_reappro (INT DEFAULT 0\)

* qty\_livree (INT DEFAULT 0\)

* qty\_retournee (INT DEFAULT 0\)

* qty\_endommagee (INT DEFAULT 0\)

* qty\_restante (CALCULÉ : chargée \+ reappro − livrée)

* statut\_terrain (ENUM 6 valeurs)

**Relations clés**

→ users/livreurs (N:1), → missions (N:1), → produits (N:1)

### **Table : mouvements\_stock**

Journal immuable de tous les mouvements de stock. Append-only. Source de vérité.

**Champs importants**

* id, produit\_id, hub\_id, livreur\_id (nullable)

* type (ENUM : RÉSERVÉ\_HUB / CHARGÉ\_LIVREUR / RÉAPPROVISIONNÉ / VENDU / RETOUR\_HUB / REMIS\_EN\_STOCK / ENDOMMAGÉ / AJUSTEMENT\_VALIDÉ)

* quantite (INT)

* qty\_avant (INT), qty\_apres (INT)

* reference\_id, reference\_type (COMMANDE/MISSION/INVENTAIRE/LITIGE)

* notes, photo\_url, created\_by, created\_at

**Relations clés**

→ produits (N:1), → users (N:1). Append-only : jamais de UPDATE ni DELETE.

### **Table : recouvrement**

Enregistrement de chaque encaissement terrain en attente de validation Trésorerie.

**Champs importants**

* id, commande\_id, livreur\_id, mission\_id

* montant\_attendu (INT — verrouillé)

* montant\_declare (INT — par le livreur)

* montant\_valide (INT — par Trésorerie)

* moyen\_paiement (ESPÈCE / MOBILE MONEY)

* operateur\_mm (WAVE/ORANGE/MTN/MOOV/DJAMO)

* reference\_mm

* statut (ENUM 4 valeurs)

* created\_at, validated\_at

**Relations clés**

→ commandes (1:1), → users/livreurs (N:1), → missions (N:1)

### **Table : comptes\_financiers**

Comptes de trésorerie. Tout flux d'argent entre et sort d'un compte identifié.

**Champs importants**

* id, store\_id, nom

* type (ESPÈCE / MOBILE\_MONEY / BANQUE)

* operateur (WAVE/ORANGE/MTN/MOOV/DJAMO/BANQUE)

* solde (INT DEFAULT 0\)

* devise (XOF par défaut)

* actif (BOOL)

**Relations clés**

→ transactions\_financières (1:N via débit ou crédit)

### **Table : transactions\_financières**

Chaque flux d'argent validé. Irréversible. Génère 2 écritures dans le grand livre.

**Champs importants**

* id, store\_id, type (ENCAISSEMENT / PAIEMENT\_LIVREUR / DÉPENSE / TRANSFERT / CORRECTION)

* compte\_debit\_id, compte\_credit\_id

* montant (INT POSITIF uniquement)

* statut (BROUILLON / VALIDÉ / ANNULÉ)

* description (TEXT MIN 10 car.)

* recouvrement\_id, mission\_id, livreur\_id (références optionnelles)

* created\_by, validated\_by, validated\_at

**Relations clés**

→ comptes\_financiers (N:2), → grand\_livre (1:2 lignes). VALIDÉ \= irréversible.

### **Table : grand\_livre**

Journal comptable immuable. Append-only. Toute écriture est permanente.

**Champs importants**

* id, transaction\_id, compte\_id

* debit (INT), credit (INT)

* libelle

* date\_ecriture

* solde\_courant\_apres (INT)

* created\_at

**Relations clés**

→ transactions\_financières (N:1), → comptes\_financiers (N:1). READ ONLY dans l'UI.

### **Table : paiements\_livreurs**

Enregistrement des paiements versés aux livreurs en fin de mission.

**Champs importants**

* id, livreur\_id, mission\_id

* montant\_commission\_calcule (INT — auto)

* ajustement\_eventuel (INT DEFAULT 0\)

* montant\_final\_paye (INT)

* compte\_source\_id

* moyen\_paiement (ESPÈCE / MM)

* reference\_paiement

* statut (EN\_ATTENTE / SUSPENDU / PAYÉ)

* created\_by, paid\_at

**Relations clés**

→ users/livreurs (N:1), → missions (N:1), → comptes\_financiers (N:1)

### **Table : litiges\_mission**

Dossiers d'anomalie formels ouverts sur les missions. Tracent stock et argent.

**Champs importants**

* id, mission\_id, livreur\_id, store\_id

* type (ÉCART\_STOCK / ÉCART\_ARGENT / ÉCART\_MIXTE)

* statut (LITIGE\_OUVERT / LITIGE\_RÉSOLU)

* ecart\_stock\_quantite, ecart\_stock\_valeur

* ecart\_argent

* justification (TEXT)

* decision (TEXT)

* responsable\_resolution\_id

* date\_limite\_resolution

* piece\_jointe\_url

* created\_at, resolved\_at

**Relations clés**

→ missions (1:1), → users/livreurs (N:1), → audit\_log (1:N)

### **Table : audit\_log**

Journal d'audit immuable. Toute action sensible crée une ligne. Append-only absolu.

**Champs importants**

* id, org\_id, store\_id, user\_id

* entity\_type (COMMANDE/MISSION/STOCK/RECOUVREMENT/LITIGE...)

* entity\_id

* action (ENUM : CRÉER / MODIFIER / SUPPRIMER / CHANGER\_STATUT / VALIDER / CLÔTURER...)

* etat\_precedent (JSONB)

* nouvel\_etat (JSONB)

* ip\_address, user\_agent, session\_id

* created\_at

**Relations clés**

Polymorphique → toutes les entités. JAMAIS de UPDATE ni DELETE.

### **Table : utilisateurs**

Profils utilisateurs avec rôles RBAC. Isolation par organisation.

**Champs importants**

* id, org\_id, store\_ids (ARRAY)

* email, telephone, nom\_complet

* role (ENUM : CEO / CS\_SAV / OPS\_DISPATCH / FIELD\_DRIVER / WH\_HUB / FIN\_TREASURY / MKT\_ADS / SUPPLY)

* actif (BOOL), capacite\_max (INT DEFAULT 15\)

* dernier\_login\_at

**Relations clés**

→ rôles (N:1), → missions via livreurs (1:N), → audit\_log (1:N)

### **Table : rôles**

Définition des rôles RBAC avec permissions. Un rôle \= un ensemble d'actions autorisées.

**Champs importants**

* id, code (ENUM), libelle\_fr, libelle\_en

* permissions (JSONB : liste des actions autorisées)

* vues\_accessibles (JSONB)

* peut\_valider\_stock (BOOL)

* peut\_valider\_argent (BOOL)

* peut\_cloture\_mission (BOOL)

**Relations clés**

→ utilisateurs (1:N)

# **PARTIE E — MATRICE RÔLES / ACTIONS**

## **E.1 Accès aux vues**

| Vue | CEO | SAV | Dispatch | Hub | Livreur | Recouvr. | Trésor. |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Vue SAV | 👁 Lect. | ✏ Complet | 👁 Lect. | — | — | — | 👁 Lect. |
| Vue Dispatch | 👁 Lect. | 👁 Lect. | ✏ Complet | 👁 Lect. | — | — | 👁 Lect. |
| Vue Hub Chargement | 👁 Lect. | — | 👁 Lect. | ✏ Complet | 👁 Lect. | — | — |
| Vue Livreur Mission | — | — | — | — | **✏ Propre** | — | — |
| Vue Recouvrement | 👁 Lect. | 👁 Lect. | — | — | — | ✏ Complet | ✏ Complet |
| Vue Trésorerie Point | 👁 Lect. | — | — | — | — | 👁 Lect. | ✏ Complet |
| Vue Livreur Retour Soir | — | — | — | — | **✏ Propre** | — | — |
| Vue Hub Retour Soir | 👁 Lect. | — | 👁 Lect. | ✏ Complet | — | — | — |
| Vue Contrôle Croisé | 👁 Lect. | — | ✏ Lect. | ✏ Axe Stock | — | — | ✏ Axe Argent |
| Vue SAV Post-Terrain | 👁 Lect. | ✏ Complet | — | — | — | — | — |
| Vue Trésor. Litiges | 👁 Lect. | — | — | — | — | — | ✏ Complet |

## **E.2 Qui peut valider quoi ?**

| Action de validation | CEO | SAV | Dispatch | Hub | Livreur | Trésor. |  |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Confirmer une commande | — | **✅** | — | — | — | — |  |
| Créer une mission | — | — | **✅** | — | — | — |  |
| Valider le chargement Hub (stock livreur) | — | — | — | **✅** | — | — |  |
| Valider un encaissement (recouvrement) | — | — | — | — | **❌ JAMAIS** | **✅** |  |
| Créer une écriture dans le grand livre | — | — | — | — | **❌ JAMAIS** | **✅** |  |
| Payer un livreur | — | — | — | — | **❌ JAMAIS** | **✅** |  |
| Classer un article retour en stock | — | — | — | **✅** | — | — |  |
| Ouvrir un litige mission | **✅** | — | — | **✅ Axe stock** | — | **✅ Axe argent** |  |
| Clôturer un litige mission | **✅** | — | — | — | — | **✅** |  |
| Clôturer la mission (point financier) | — | — | — | — | — | **✅** |  |
| Geler / Dégeler un livreur | **✅** | — | — | — | — | — |  |

# **PARTIE F — RÈGLES DE TRADUCTION FRANÇAIS / ANGLAIS**

## **F.1 Principe directeur**

**La logique métier, les statuts, les noms de vues, les boutons et les workflows sont définis en FRANÇAIS dans ce cahier de charges. L'application affiche les deux langues en interface (FR/EN). La base de données stocke des codes techniques en anglais.**

## **F.2 Table de correspondance statuts**

| Statut affiché FR | Code technique EN (base de données) | Libellé EN (interface) |
| ----- | ----- | ----- |
| CRÉÉE | ORDER\_CREATED | Created |
| CONFIRMÉE | ORDER\_CONFIRMED | Confirmed |
| ASSIGNÉE | ORDER\_ASSIGNED | Assigned |
| CHARGÉE\_PAR\_HUB | ORDER\_LOADED | Loaded by Hub |
| EN\_LIVRAISON | ORDER\_OUT\_FOR\_DELIVERY | Out for delivery |
| LIVRÉE | ORDER\_DELIVERED | Delivered |
| ÉCHEC\_SUR\_PLACE | ORDER\_DELIVERY\_FAILED | Delivery failed |
| ANNULÉE | ORDER\_CANCELLED | Cancelled |
| EN\_ATTENTE\_RETOUR\_SOIR | RETURN\_PENDING | Pending return |
| RETOUR\_REÇU\_HUB | RETURN\_RECEIVED | Return received |
| RETOUR\_CONTRÔLÉ | RETURN\_CONTROLLED | Return controlled |
| RETOUR\_CLOTURÉ | RETURN\_CLOSED | Return closed |
| REMIS\_EN\_STOCK | RETURN\_ITEM\_RESTOCKED | Restocked |
| ENDOMMAGÉ | RETURN\_ITEM\_DAMAGED | Damaged |
| EN\_LITIGE | RETURN\_ITEM\_DISPUTED | Disputed |

## **F.3 Recommandations d'implémentation**

* Stocker UNIQUEMENT les codes techniques EN dans la base de données (champ status, type, etc.)

* Créer un fichier de traduction i18n séparé (fr.json \+ en.json) pour les libellés affichés

* Ne JAMAIS stocker les libellés traduits en base — uniquement les codes

* Toute la logique métier (conditions, transitions, règles) utilise les codes EN en interne

* L'affichage dans l'interface lit le fichier i18n selon la langue sélectionnée par l'utilisateur

* Les exports PDF et rapports proposent les deux langues selon le profil utilisateur

**Une modification de traduction ne doit JAMAIS impacter la logique métier. Traduction et logique sont découplées.**

# **PARTIE G — CHECKLIST D'EXÉCUTION PRÉ-BUILD**

**À valider point par point avant de lancer le développement. Cocher chaque case avec le responsable technique.**

## **G.1 Cohérence des statuts**

* \[ \] Tous les statuts commande (8) sont définis avec leur code EN et leur libellé FR/EN

* \[ \] Tous les statuts mission (6) sont définis avec leur code EN et leur libellé FR/EN

* \[ \] Tous les statuts terrain livreur (4) sont définis

* \[ \] Tous les statuts retour mission (4) sont définis

* \[ \] Tous les statuts article retour (4) sont définis

* \[ \] Tous les statuts anomalie mission (6) sont définis

* \[ \] Aucun retour arrière de statut n'est autorisé (bloqué côté serveur HTTP 403\)

* \[ \] Aucun saut d'étape n'est autorisé (séquence validée côté serveur)

## **G.2 Cohérence des boutons et actions**

* \[ \] Chaque bouton a une condition de disponibilité définie (statut requis, rôle requis)

* \[ \] Le bouton ÉCHEC\_SUR\_PLACE est désactivé jusqu'à ARRIVÉE \+ 10 minutes (timer serveur)

* \[ \] Le bouton VALIDER ENCAISSEMENT est réservé à la Trésorerie uniquement

* \[ \] Le bouton PAYER LIVREUR est bloqué si litige ouvert sur la mission

* \[ \] Le bouton CLÔTURER RETOUR est bloqué si au moins un article est EN\_ATTENTE\_INSPECTION

* \[ \] Le bouton CLASSER ENDOMMAGÉ requiert une photo obligatoire

* \[ \] Le livreur ne voit jamais de bouton permettant de modifier un montant

## **G.3 Cohérence des formulaires**

* \[ \] Formulaire création commande : REPÈRE PHYSIQUE est obligatoire (min 10 caractères)

* \[ \] Formulaire livraison réussie : photo \+ signature \+ moyen paiement TOUS obligatoires

* \[ \] Formulaire échec sur place : motif (liste fermée) \+ photo TOUS obligatoires

* \[ \] Formulaire dépôt cash livreur : champ montant DÉSACTIVÉ (calculé serveur uniquement)

* \[ \] Formulaire validation transaction : compte débit \+ compte crédit \+ description (min 10 car.)

* \[ \] Formulaire vérification retour Hub : état article OBLIGATOIRE pour chaque article

* \[ \] Formulaire litige : justification \+ décision OBLIGATOIRES avant clôture

## **G.4 Cohérence des rôles**

* \[ \] FIELD\_DRIVER ne voit que ses propres missions (isolation RBAC)

* \[ \] FIELD\_DRIVER ne peut jamais valider une écriture financière

* \[ \] FIN\_TREASURY est le seul rôle pouvant créer des écritures dans le grand livre

* \[ \] WH\_HUB est le seul rôle pouvant créer des mouvements de stock

* \[ \] CEO peut tout lire mais ne peut valider que les litiges et geler les livreurs

* \[ \] Matrice rôles/actions (Partie E) intégralement configurée dans le système RBAC

## **G.5 Cohérence stock**

* \[ \] Aucune modification directe de quantité n'est possible — uniquement via mouvements

* \[ \] Table mouvements\_stock est configurée en append-only (pas de DELETE ni UPDATE)

* \[ \] Équation de clôture mission vérifiée : chargé \+ réappro \= livré \+ retourné \+ endommagé \+ en litige

* \[ \] Aucun produit ne passe REMIS\_EN\_STOCK sans inspection Hub préalable

* \[ \] Produit endommagé : qty\_endommagée augmente, qty\_disponible reste inchangée

* \[ \] Produit manquant et non retourné : litige créé automatiquement

## **G.6 Cohérence recouvrement**

* \[ \] Tout paiement terrain (espèce ou MM) crée automatiquement une ligne recouvrement

* \[ \] Le statut initial pour espèce \= À\_ENCAISSER

* \[ \] Le statut initial pour mobile money \= EN\_ATTENTE\_VALIDATION

* \[ \] Montant recouvrement \= montant commande (verrouillé, calculé serveur)

* \[ \] Validation encaissement \= Trésorerie uniquement

## **G.7 Cohérence trésorerie et grand livre**

* \[ \] Chaque validation de transaction crée EXACTEMENT 2 écritures GL (débit \+ crédit)

* \[ \] Si erreur lors de la validation : rollback complet des 2 écritures

* \[ \] Table grand\_livre configurée en lecture seule dans l'interface

* \[ \] Table grand\_livre configurée en append-only (pas de DELETE ni UPDATE)

* \[ \] Paiement livreur : sortie d'un compte précis \+ 2 écritures GL

* \[ \] Toute correction financière \= nouvelle écriture, jamais modification ancienne

## **G.8 Cohérence retours et litiges**

* \[ \] Mission non vide sans retour présenté au Hub : alerte automatique active

* \[ \] Produit non livré ET non retourné après 24h : litige créé automatiquement

* \[ \] Clôture retour bloquée si article EN\_ATTENTE\_INSPECTION

* \[ \] Litige résolu : trace d'audit complète avec décision \+ justificatif \+ responsable

* \[ \] Correction stock sur litige résolu : mouvement AJUSTEMENT\_VALIDÉ créé

* \[ \] Paiement livreur bloqué si litige mission LITIGE\_OUVERT non résolu

## **G.9 Cohérence audit log**

* \[ \] Table audit\_log configurée en append-only (pas de UPDATE ni DELETE)

* \[ \] Toute transition de statut commande/mission génère une ligne audit

* \[ \] Tout mouvement de stock génère une ligne audit

* \[ \] Toute validation financière génère une ligne audit

* \[ \] Toute ouverture/fermeture de litige génère une ligne audit

* \[ \] Tout paiement livreur génère une ligne audit

## **G.10 Cohérence offline et mobile**

* \[ \] App livreur fonctionne en mode offline (PWA \+ Service Worker \+ IndexedDB)

* \[ \] Bandeau HORS LIGNE visible en permanence si pas de réseau

* \[ \] Toutes les actions offline sont synchronisées dès retour de connexion

* \[ \] Résolution de conflits : timestamp serveur gagne toujours

* \[ \] GPS embedé dans les photos de preuve (EXIF) — vérifié côté serveur

* \[ \] Vérification GPS : proof\_photo coordonnées ≤ 2km de l'adresse client

