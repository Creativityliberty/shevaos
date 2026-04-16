PROCESS 2 — Retour soir, réintégration stock, litiges et clôture Hub
Ce process commence après la phase terrain et après ou pendant la clôture trésorerie, quand le livreur revient avec :
	•	des produits non livrés
	•	des produits refusés
	•	des produits potentiellement abîmés
	•	un stock restant
	•	parfois des écarts entre stock théorique et stock réel
Ce process est cohérent avec la logique SHEVA déjà posée :
	•	le Hub reste le centre du stock terrain
	•	tout retour doit être journalisé
	•	le stock ne bouge que par mouvements
	•	les retours doivent finir soit en stock vendable, soit en endommagé, soit en litige.    
⸻
1. Objectif du process 2
Le process 2 doit garantir 5 choses :
	•	récupérer proprement tout ce que le livreur ramène
	•	comparer le stock mission théorique au stock physique retour
	•	réintégrer le bon stock dans le Hub
	•	classer le stock abîmé ou litigieux
	•	clôturer la mission côté stock
⸻
2. Départements concernés
Départements actifs
	•	Hub
	•	Livreur
	•	Trésorerie
	•	Dispatch
	•	SAV
Départements en lecture / supervision
	•	CEO
	•	Contrôle interne si ajouté plus tard
⸻
3. Objets métier concernés
	•	mission
	•	stock livreur
	•	stock retour soir
	•	articles retournés
	•	anomalies stock
	•	litiges mission
	•	mouvements stock
	•	retours clients
	•	écarts de mission
⸻
4. Statuts officiels du process 2
4.1 Statuts retour mission
	•	EN_ATTENTE_RETOUR_SOIR
	•	RETOUR_REÇU_HUB
	•	RETOUR_CONTRÔLÉ
	•	RETOUR_CLOTURÉ
4.2 Statuts article retour
	•	EN_ATTENTE_INSPECTION
	•	REMIS_EN_STOCK
	•	ENDOMMAGÉ
	•	EN_LITIGE
4.3 Statuts anomalie mission
	•	AUCUN_ÉCART
	•	ÉCART_STOCK
	•	ÉCART_ARGENT
	•	ÉCART_MIXTE
	•	LITIGE_OUVERT
	•	LITIGE_RÉSOLU
⸻
5. Règles non négociables
	•	le retour soir est obligatoire pour toute mission non vide
	•	tout produit non livré doit revenir au Hub
	•	tout produit revenu doit être scanné ou confirmé manuellement
	•	tout écart doit être tracé
	•	le stock Hub n’est remis à jour qu’après contrôle réel
	•	aucun retour ne rentre directement en stock sans inspection
	•	aucune mission n’est clôturée côté stock sans retour traité
	•	un produit non retrouvé = litige, pas ajustement silencieux
	•	toute correction stock crée un mouvement
	•	toute résolution de litige laisse une trace d’audit
⸻
6. Vue 1 — Livreur fin de mission / retour soir
6.1 Rôle autorisé
	•	Livreur uniquement
6.2 Objectif métier
Déclarer la fin de mission et présenter au Hub le stock restant et les retours.
6.3 Données affichées
	•	mission
	•	commandes livrées
	•	commandes échouées
	•	produits restants
	•	produits à retourner
	•	produits refusés
	•	quantités théoriques restantes
	•	statut de retour soir
6.4 Formulaire livreur retour soir
Champs saisissables
	•	confirmation retour au hub
	•	commentaire terrain
	•	motif retour si nécessaire
	•	photo de certains articles si demandé
Champs automatiques
	•	stock restant théorique
	•	liste des produits non livrés
	•	liste des produits échoués
	•	mission liée
Champs verrouillés
	•	quantités théoriques
	•	historique mission
6.5 Boutons
	•	Déclarer fin de mission
	•	Présenter retour au Hub
	•	Signaler anomalie
	•	Confirmer remise au Hub
6.6 Logique de chaque bouton
Déclarer fin de mission
Actions :
	•	mission passe en attente de retour
	•	statut retour mission = EN_ATTENTE_RETOUR_SOIR
	•	Hub reçoit une notification
Présenter retour au Hub
Actions :
	•	signale au Hub que le livreur est prêt au contrôle
	•	crée une file de réception retour
Signaler anomalie
Actions :
	•	ouvre une alerte interne avant contrôle Hub
	•	utile si casse, perte, erreur, client conflictuel
Confirmer remise au Hub
Conditions :
	•	Hub a commencé le contrôle
Actions :
	•	lie le livreur au processus de réception retour
	•	marque l’heure de remise
⸻
7. Vue 2 — Hub réception retour soir
7.1 Rôles autorisés
	•	Hub manager
	•	Stock manager
	•	CEO lecture
7.2 Objectif métier
Recevoir physiquement le retour du livreur, compter, scanner, qualifier l’état et traiter les écarts.
7.3 Données affichées
	•	mission
	•	livreur
	•	stock chargé matin
	•	réappros journée
	•	stock théorique restant
	•	stock physique reçu
	•	articles concernés
	•	écarts
	•	état des articles
7.4 Formulaire Hub retour soir
Champs saisissables
	•	mission
	•	produit
	•	quantité physique reçue
	•	scan code-barres
	•	état article
	•	photo preuve si abîmé
	•	note Hub
	•	motif litige si écart
Champs obligatoires
	•	mission
	•	au moins une ligne retour
	•	état de chaque article retourné
	•	justification si écart
Champs automatiques
	•	quantité théorique attendue
	•	écart calculé
	•	heure réception
	•	nom opérateur Hub
Champs verrouillés
	•	historique stock mission
	•	stock chargé initial
	•	historique réappro
7.5 Boutons
	•	Recevoir retour soir
	•	Scanner article
	•	Valider quantité reçue
	•	Classer bon état
	•	Classer endommagé
	•	Ouvrir litige stock
	•	Clôturer retour mission
7.6 Logique de chaque bouton
Recevoir retour soir
Actions :
	•	statut retour mission = RETOUR_REÇU_HUB
	•	horodatage
	•	opérateur hub enregistré
Scanner article
Actions :
	•	identifie le produit exact
	•	compare au stock théorique mission
	•	prépare la ligne de contrôle
Valider quantité reçue
Actions :
	•	compare quantité reçue vs quantité théorique
	•	calcule écart
	•	si 0 → ligne conforme
	•	si ≠ 0 → ligne anomalie
Classer bon état
Actions :
	•	article retour = REMIS_EN_STOCK
	•	mouvement stock RETOUR_HUB
	•	puis mouvement stock REMIS_EN_STOCK
	•	quantité dispo hub augmente
Classer endommagé
Actions :
	•	article retour = ENDOMMAGÉ
	•	mouvement stock ENDOMMAGÉ
	•	impact perte stock
Ouvrir litige stock
Conditions :
	•	quantité manquante
	•	produit erroné
	•	casse non prévue
	•	article introuvable
Actions :
	•	anomalie mission = ÉCART_STOCK ou ÉCART_MIXTE
	•	article retour = EN_LITIGE
	•	litige mission créé
	•	alerte OPS / Trésorerie / CEO si gravité
Clôturer retour mission
Conditions :
	•	toutes les lignes retour sont traitées
	•	tous les écarts sont soit résolus, soit passés en litige
Actions :
	•	statut retour mission = RETOUR_CLOTURÉ
	•	mission stock = clôturée
	•	Hub termine sa partie
⸻
8. Vue 3 — Contrôle croisé mission (Hub + Trésorerie)
8.1 Rôles autorisés
	•	Hub manager
	•	Trésorier
	•	Responsable opérations
	•	CEO lecture
8.2 Objectif métier
Comparer la mission sur 2 axes :
	•	argent
	•	stock
8.3 Données affichées
	•	mission
	•	livreur
	•	total stock chargé
	•	total stock retour
	•	écart stock
	•	total encaissement attendu
	•	total validé trésorerie
	•	écart argent
	•	statut mission global
8.4 Formulaire contrôle croisé
Champs saisissables
	•	note conjointe
	•	type d’écart
	•	décision
	•	responsable résolution
	•	date limite résolution
Champs automatiques
	•	écart stock
	•	écart argent
	•	statut anomalie global
8.5 Boutons
	•	Créer anomalie mission
	•	Qualifier écart
	•	Assigner résolution
	•	Clôturer sans écart
	•	Clôturer avec litige
8.6 Logique de chaque bouton
Créer anomalie mission
Actions :
	•	crée un dossier d’écart mission
	•	lie stock + recouvrement + livreur
Qualifier écart
Choix :
	•	AUCUN_ÉCART
	•	ÉCART_STOCK
	•	ÉCART_ARGENT
	•	ÉCART_MIXTE
Assigner résolution
Actions :
	•	assigne à Hub / Trésorerie / OPS / manager
	•	fixe SLA résolution
Clôturer sans écart
Conditions :
	•	écart stock = 0
	•	écart argent = 0
Actions :
	•	anomalie = AUCUN_ÉCART
	•	mission totalement clôturée
Clôturer avec litige
Conditions :
	•	au moins un écart non résolu
Actions :
	•	anomalie = LITIGE_OUVERT
	•	mission fermée opérationnellement mais marquée litigieuse
⸻
9. Vue 4 — SAV suivi post-livraison / post-échec
9.1 Rôles autorisés
	•	SAV
	•	Manager SAV
	•	CEO lecture
9.2 Objectif métier
Suivre ce qui s’est passé après terrain :
	•	livraison réussie
	•	échec sur place
	•	refus
	•	annulation
	•	retour
9.3 Données affichées
	•	commande
	•	client
	•	statut final terrain
	•	motif échec
	•	besoin de reprogrammation
	•	besoin de rappel client
	•	statut retour
9.4 Formulaire SAV post-terrain
Champs saisissables
	•	décision SAV
	•	commentaire
	•	reprogrammation
	•	clôture relation client
	•	escalade litige
9.5 Boutons
	•	Relancer client
	•	Reprogrammer
	•	Clôturer dossier client
	•	Escalader litige
9.6 Logique
Relancer client
	•	crée un nouveau rappel SAV
Reprogrammer
	•	recrée une commande opérationnelle ou nouveau créneau selon la politique
Clôturer dossier client
	•	clôture le cycle relationnel de cette commande
Escalader litige
	•	crée un ticket de litige inter-départements
⸻
10. Vue 5 — Trésorerie litiges mission
10.1 Rôles autorisés
	•	Trésorier
	•	Responsable finance
	•	CEO lecture
10.2 Objectif métier
Traiter les litiges liés à :
	•	argent manquant
	•	mobile money incohérent
	•	mission non soldée
	•	paiement livreur suspendu
10.3 Données affichées
	•	mission
	•	livreur
	•	montant attendu
	•	montant validé
	•	montant payé livreur
	•	écart
	•	justification
	•	statut litige
10.4 Formulaire litige trésorerie
Champs saisissables
	•	justification
	•	décision
	•	montant ajusté si permis
	•	compte impacté
	•	note finale
Champs obligatoires
	•	justification
	•	décision
10.5 Boutons
	•	Ouvrir litige
	•	Suspendre paiement livreur
	•	Résoudre litige
	•	Clôturer litige
10.6 Logique de chaque bouton
Ouvrir litige
Actions :
	•	statut = LITIGE_OUVERT
	•	paiement livreur bloqué si nécessaire
Suspendre paiement livreur
Actions :
	•	interdit la sortie d’argent tant que non résolu
Résoudre litige
Actions :
	•	documente la résolution
	•	réactive les flux si besoin
Clôturer litige
Conditions :
	•	décision prise
	•	justificatifs présents
Actions :
	•	statut = LITIGE_RÉSOLU
	•	audit log complet
⸻
11. Mouvements de stock obligatoires dans le process 2
11.1 Retour du soir
	•	RETOUR_HUB
11.2 Retour bon état
	•	REMIS_EN_STOCK
11.3 Retour endommagé
	•	ENDOMMAGÉ
11.4 Ajustement exceptionnel
Seulement si litige résolu avec décision manager :
	•	AJUSTEMENT_VALIDÉ
Règle
Jamais de correction silencieuse.
⸻
12. Écritures financières éventuelles dans le process 2
Le process 2 est surtout stock et litiges.
Mais si résolution de litige a impact financier, alors :
	•	ajustement de mission
	•	retenue livreur
	•	régularisation de sortie
	•	contre-écriture ou écriture corrective
Règle SHEVA
Jamais modifier une ancienne écriture directement ; la correction se fait par nouvelle écriture, logique cohérente avec le ledger append-only déjà défini.  
⸻
13. Alertes automatiques du process 2
	•	mission terminée mais pas présentée au Hub
	•	stock retour manquant
	•	produit retour sans scan
	•	produit endommagé sans photo
	•	écart stock sur mission
	•	mission clôturée côté argent mais pas côté stock
	•	paiement livreur tenté alors que litige mission ouvert
	•	produit non livré non revenu au Hub
	•	retour en attente d’inspection trop longtemps
⸻
14. Fin officielle du process 2
Le process 2 se termine quand :
	•	le retour du soir a été reçu
	•	chaque article a été classé
	•	les écarts sont soit à zéro, soit en litige formel
	•	le Hub a fini sa clôture stock
	•	la mission est complètement fermée côté terrain + stock
⸻

