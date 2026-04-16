.   

PROCESS 1 — DE LA COMMANDE AU PAIEMENT LIVREUR
1. Résumé exécutif du process
Ce process couvre une journée normale de e-commerce COD en Afrique, du moment où la commande est créée par le SAV jusqu’au moment où :
la commande est livrée ou échoue sur place


l’encaissement est validé en trésorerie


le livreur est payé


les comptes financiers sont mis à jour


le grand livre est alimenté


la mission est clôturée côté argent


Ce process s’arrête volontairement ici.
Il ne couvre pas encore :
achats fournisseurs


dépenses fixes/variables globales


réapprovisionnement global entrepôt


abonnements


marketing


pilotage CEO complet



2. Départements impliqués
Départements actifs dans ce process
SAV


Dispatch


Hub


Livreur


Recouvrement


Trésorerie


Départements passifs ou hors périmètre
Approvisionnement


Ads/Marketing


CEO Cockpit complet


Abonnements



3. Objets métier principaux
Objets centraux
commande


mission


lot de dispatch


stock hub


stock livreur


ligne recouvrement


transaction trésorerie


écriture grand livre


paiement livreur



4. Statuts officiels du process
4.1 Statuts commande
CRÉÉE


CONFIRMÉE


ASSIGNÉE


CHARGÉE_PAR_HUB


EN_LIVRAISON


LIVRÉE


ÉCHEC_SUR_PLACE


ANNULÉE


4.2 Statuts mission
À_FAIRE


ASSIGNÉE


EN_ATTENTE_CHARGEMENT


CHARGÉE


EN_COURS


CLÔTURÉE


4.3 Statuts terrain livreur
DÉMARRÉE


ARRIVÉE


LIVRÉE


ÉCHEC_SUR_PLACE


4.4 Statuts recouvrement
À_ENCAISSER


EN_ATTENTE_VALIDATION


VALIDÉ


LITIGE


4.5 Statuts stock terrain
RÉSERVÉ_HUB


CHARGÉ_LIVREUR


RÉAPPROVISIONNÉ


RETOUR_HUB


REMIS_EN_STOCK


ENDOMMAGÉ



5. Règles non négociables
5.1 Règles de séquence
aucun retour à un statut précédent


aucun saut d’étape


aucune commande EN_LIVRAISON si elle n’est pas CHARGÉE_PAR_HUB


aucune commande LIVRÉE si le livreur n’a pas le produit en stock terrain


aucun ÉCHEC_SUR_PLACE sans ARRIVÉE préalable


aucun ÉCHEC_SUR_PLACE avant 10 minutes d’attente


5.2 Règles stock
le stock terrain appartient au Hub, pas au livreur


tout chargement du matin vient du Hub


tout réappro en journée vient du Hub


tout retour du soir revient au Hub


tout mouvement stock est journalisé


5.3 Règles argent
chaque entrée d’argent doit aller dans un compte précis


chaque sortie d’argent doit partir d’un compte précis


toute entrée doit alimenter le grand livre


toute sortie doit alimenter le grand livre


aucun paiement livreur sans écriture de sortie


aucun encaissement validé sans écriture d’entrée


5.4 Règles rôle
le SAV ne valide pas l’argent


le Dispatch ne touche pas au stock physique


le Hub ne valide pas l’argent


le Livreur ne valide pas le ledger


seule la Trésorerie valide les mouvements d’argent



6. Vue 1 — SAV
6.1 Rôles autorisés
Agent SAV


Manager SAV


CEO en lecture


6.2 Objectif métier
Créer la commande, confirmer la demande client, envoyer une commande propre au Dispatch.
6.3 Données affichées
numéro commande


date


client


téléphone principal


téléphone secondaire


adresse


repère


commune / zone


produits


quantités


montant total


historique client


historique appels


statut commande


6.4 Formulaire SAV
Champs saisissables
téléphone principal


téléphone secondaire


nom client


adresse


repère


commune


quartier


lien GPS


produit


quantité


commentaire SAV


Champs obligatoires
téléphone principal


repère


produit


quantité


Champs automatiques
numéro commande


date création


zone auto


montant total


statut initial = CRÉÉE


Champs verrouillés après confirmation
produits


quantités


montant total


téléphone principal si politique stricte


adresse principale si commande déjà confirmée


6.5 Boutons SAV
Créer commande


Appeler


Confirmer


Programmer rappel


Annuler


6.6 Logique de chaque bouton
Créer commande
Actions :
crée le client si inexistant


crée la commande


crée les lignes de commande


statut = CRÉÉE


écrit audit log


Appeler
Actions :
crée une ligne d’appel


incrémente tentative


permet note d’appel


Confirmer
Conditions :
stock hub disponible


commande complète


client non bloqué


Actions :
statut commande = CONFIRMÉE


crée réservation de stock hub


crée mouvement stock RÉSERVÉ_HUB


envoie la commande au Dispatch


écrit audit log


Programmer rappel
Actions :
crée rappel matin / midi / soir


garde la commande dans la file SAV


Annuler
Conditions :
possible avant exécution terrain


si déjà confirmée, applique libération stock


Actions :
statut = ANNULÉE


libère stock réservé


écrit motif


audit log


6.7 Mises à jour inter-départements
en confirmant, la commande apparaît dans Dispatch


en annulant, la réservation Hub disparaît



7. Vue 2 — Dispatch
7.1 Rôles autorisés
Dispatch


Manager OPS


CEO en lecture


7.2 Objectif métier
Transformer les commandes confirmées en missions exploitables par zone.
7.3 Données affichées
commandes confirmées


zones


créneaux


livreurs disponibles


capacité livreur


montant total commande


montant total lot


nombre de colis


stock requis par mission


7.4 Formulaire Dispatch
Champs saisissables
zone


livreur


créneau


liste commandes


priorité mission


note OPS


Champs obligatoires
livreur


au moins une commande


zone


créneau


Champs automatiques
total mission


nombre commandes


total colis


stock mission


Champs verrouillés après assignation
composition mission sans réassignation


livreur sans action de réassignation


7.5 Boutons Dispatch
Créer lot


Assigner


Réassigner


Envoyer au Hub


Demander réappro journée


7.6 Logique de chaque bouton
Créer lot
Actions :
regroupe les commandes par zone


crée mission = À_FAIRE


calcule total mission


calcule besoin stock


Assigner
Conditions :
mission existante


livreur actif


zone cohérente


Actions :
mission = ASSIGNÉE


commandes = ASSIGNÉE


mission visible chez le livreur


mission visible au Hub


état mission = EN_ATTENTE_CHARGEMENT


Réassigner
Conditions :
mission pas démarrée, ou incident validé


Actions :
change le livreur


garde historique


audit log


Envoyer au Hub
Actions :
place la mission dans la file Hub


affiche besoin de chargement


Demander réappro journée
Actions :
crée demande de réappro au Hub


rattache produit / quantité / mission / livreur


7.7 Mises à jour inter-départements
le Hub reçoit la mission à charger


le livreur voit la mission, mais pas encore exécutable


le SAV voit que la commande est ASSIGNÉE



8. Vue 3 — Hub (chargement et réappro)
8.1 Rôles autorisés
Hub manager


Stock manager


CEO en lecture


8.2 Objectif métier
Charger officiellement le livreur et maintenir son stock en journée.
8.3 Données affichées
missions à charger


stock disponible


stock réservé


stock chargé par livreur


demandes de réappro


retours du soir


8.4 Formulaire Hub
Champs saisissables
mission


livreur


produits


quantités


scan code-barres


commentaire


état retour


Champs obligatoires
mission


livreur


produits / quantités


validation de préparation


Champs automatiques
stock théorique mission


stock dispo


total articles


reçu de chargement


état mission


Champs verrouillés
commande déjà chargée


stock théorique historique


8.5 Boutons Hub
Réserver stock


Préparer mission


Charger livreur


Réapprovisionner


Recevoir retour soir


Remettre en stock


Classer endommagé


8.6 Logique de chaque bouton
Réserver stock
Actions :
mouvement stock RÉSERVÉ_HUB


Préparer mission
Actions :
génère la liste picking


confirme disponibilité physique


Charger livreur
Conditions :
mission assignée


stock disponible


quantités validées


Actions :
mission = CHARGÉE


commandes = CHARGÉE_PAR_HUB


stock livreur augmente


stock hub réservé diminue


mouvement CHARGÉ_LIVREUR


reçu de chargement généré


mission devient exécutable pour le livreur


Réapprovisionner
Actions :
stock livreur augmente


stock hub diminue


mouvement RÉAPPROVISIONNÉ


met à jour la mission en temps réel


Recevoir retour soir
Actions :
réceptionne produits non livrés / refusés


mouvement RETOUR_HUB


Remettre en stock
Actions :
mouvement REMIS_EN_STOCK


Classer endommagé
Actions :
mouvement ENDOMMAGÉ


8.7 Mises à jour inter-départements
le livreur peut enfin démarrer


le Dispatch voit mission CHARGÉE


le SAV voit commande CHARGÉE_PAR_HUB



9. Vue 4 — Livreur
9.1 Rôle autorisé
Livreur uniquement


9.2 Objectif métier
Exécuter la mission terrain et déclarer le résultat réel.
9.3 Données affichées
mission


zone


commandes


stock chargé


stock restant


montant total mission


commandes livrées


commandes échouées


montant encaissé


bouton GPS / appel


9.4 Formulaire Livreur
Champs saisissables
action terrain


moyen de paiement


photo preuve livraison


motif échec


référence mobile money


note terrain


Champs obligatoires
action terrain


photo si livraison


moyen de paiement si livraison


motif si échec


Champs automatiques
montant théorique commande


stock mission


chrono 10 min


position GPS


Champs verrouillés
montant théorique


produits non chargés


mission non chargée


9.5 Boutons Livreur
Accepter mission


Démarrer


Appeler


Ouvrir GPS


Arrivée


Livrée


Échec sur place


Choisir moyen de paiement


Déclarer paiement


9.6 Logique de chaque bouton
Accepter mission
Conditions :
dans les 5 minutes


Actions :
enregistre acceptation


visible Dispatch


Démarrer
Conditions :
mission CHARGÉE


Actions :
mission = EN_COURS


commandes = EN_LIVRAISON


statut terrain = DÉMARRÉE


Appeler
Actions :
lance appel


log action


Ouvrir GPS
Actions :
ouvre Google Maps / repère


Arrivée
Actions :
statut terrain = ARRIVÉE


démarre chrono 10 min


notifie Dispatch / SAV


Livrée
Conditions :
mission chargée


produit dans stock livreur


photo obligatoire


paiement renseigné


Actions :
commande = LIVRÉE


statut terrain = LIVRÉE


stock livreur diminue


ligne Recouvrement créée


Échec sur place
Conditions :
ARRIVÉE


10 minutes écoulées


motif obligatoire


Actions :
commande = ÉCHEC_SUR_PLACE


ligne Recouvrement créée si nécessaire de calcul


commande passe aussi dans retour Hub


Choisir moyen de paiement
Choix :
ESPÈCE


MOBILE_MONEY


Déclarer paiement
Espèce
ligne Recouvrement = À_ENCAISSER


Mobile Money
ligne Recouvrement = EN_ATTENTE_VALIDATION


9.7 Mises à jour inter-départements
Dispatch et SAV voient chaque changement


Recouvrement reçoit la ligne


Hub prépare le retour si échec



10. Vue 5 — Recouvrement
10.1 Rôles autorisés
Trésorerie


Responsable finance


CEO lecture


SAV/Dispatch lecture partielle


10.2 Objectif métier
Contrôler tout ce qui doit être validé financièrement commande par commande.
10.3 Données affichées
numéro commande


client


livreur


mission


zone


montant commande


article


moyen paiement


montant attendu


statut recouvrement


compte destination


écart


10.4 Formulaire Recouvrement
Champs saisissables
compte destination


référence mobile money


note trésorerie


justification litige


Champs obligatoires
compte destination si validation


justification si litige


Champs automatiques
montant théorique


mission


livreur


date livraison


Champs verrouillés
montant commande


livreur


mission


10.5 Boutons Recouvrement
Valider espèce


Valider mobile money


Mettre en litige


10.6 Logique de chaque bouton
Valider espèce
Actions :
recouvrement = VALIDÉ


crée transaction d’entrée


affecte le compte caisse


met à jour le compte


écrit dans le grand livre


Valider mobile money
Conditions :
compte de destination sélectionné


vérification réelle reçue


Actions :
recouvrement = VALIDÉ


crée transaction d’entrée


affecte Wave / Orange / MTN / Moov / Djamo / banque


met à jour le compte


écrit dans le grand livre


Mettre en litige
Actions :
recouvrement = LITIGE


bloque clôture mission


écrit audit log


alerte Trésorerie / CEO selon gravité



11. Vue 6 — Trésorerie (point mission + paiement livreur)
11.1 Rôles autorisés
Trésorier


Responsable finance


CEO lecture


11.2 Objectif métier
Clôturer financièrement la mission, payer le livreur, solder les comptes de la journée.
11.3 Données affichées
mission


livreur


total commandes mission


total livré


total recouvrement validé


total en litige


frais livreur


net à reverser


écart


compte de sortie


comptes disponibles


11.4 Formulaire Trésorerie
Champs saisissables
compte destination entrée


compte sortie paiement livreur


montant vérifié


justification écart


note mission


Champs obligatoires
compte entrée pour validation


compte sortie pour paiement livreur


justification si écart


Champs automatiques
commission livreur


total mission


total validé


net mission


écart


Champs verrouillés
historique mission


montant commande unitaire historique


11.5 Boutons Trésorerie
Calculer point mission


Valider entrée argent


Valider paiement livreur


Créer litige


Clôturer mission


11.6 Logique de chaque bouton
Calculer point mission
Actions :
calcule :


total mission


total recouvrement validé


total à reverser


total commission livreur


écart


Valider entrée argent
Actions :
crée transaction d’entrée


met à jour le compte cible


écrit au grand livre


Valider paiement livreur
Actions :
crée transaction de sortie


choisit le compte de sortie


met à jour le compte


écrit au grand livre


dette livreur = payée


Créer litige
Actions :
bloque clôture mission


enregistre motif


notifie


Clôturer mission
Conditions :
encaissements traités ou litiges ouverts explicitement


paiement livreur traité ou reporté officiellement


Actions :
mission = CLÔTURÉE


transmet le flux de fin au Hub pour retour stock



12. Écritures automatiques obligatoires
12.1 Mouvements stock
confirmation SAV → RÉSERVÉ_HUB


chargement matin → CHARGÉ_LIVREUR


réappro journée → RÉAPPROVISIONNÉ


retour soir → RETOUR_HUB


retour bon état → REMIS_EN_STOCK


retour abîmé → ENDOMMAGÉ


12.2 Écritures argent
validation espèce → entrée compte caisse


validation MM → entrée compte MM choisi


paiement livreur → sortie compte choisi


12.3 Grand livre
Chaque validation :
crée une transaction


alimente le ledger


met à jour le solde compte



13. Alertes automatiques minimales de ce process
stock insuffisant à confirmation


mission assignée mais non chargée


livreur n’a pas accepté en 5 min


échec sur place avant 10 min → blocage


paiement mobile money non validé


écart de mission


commande livrée sans photo → blocage


tentative de livraison d’un produit non chargé → blocage


paiement livreur sans compte de sortie → blocage



14. Séquence réelle d’une journée
Matin
SAV confirme


Dispatch groupe et assigne


Hub charge les livreurs


livreurs acceptent mission


Journée
livreurs livrent


statuts remontent en temps réel


Hub peut réapprovisionner si besoin


lignes recouvrement se créent


Soir
Trésorerie valide les encaissements


Trésorerie calcule et valide paiement livreur


entrées/sorties vont dans les comptes


grand livre est alimenté


Hub récupère les restants et retours



15. Conclusion du process 1
Le process 1 est terminé quand :
la commande a reçu son statut final terrain


le recouvrement est validé ou mis en litige


le paiement livreur est calculé et validé


les comptes financiers sont mis à jour


le grand livre contient les écritures


la mission est clôturée



Je peux continuer maintenant avec le process 2, qui serait logiquement :
retour soir + réintégration stock + litiges + clôture Hub.

