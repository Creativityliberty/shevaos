# SHEVA OS — Gemini Agent Manager Setup

Configuration complète pour piloter la construction de **SHEVA OS** (ERP opérationnel COD pour l'Afrique francophone) avec **Gemini Agent Manager** dans **Google Antigravity**.

## Contenu du pack

```
GEMINI.md                          # Fichier principal (règles globales Gemini)
.agents/
├── rules/
│   ├── architecture.md            # Règles techniques non négociables
│   ├── mvp-blocks.md              # Les 6 blocs MVP décomposés en task groups
│   ├── state-machines.md          # Machines à états commande/cash/dépôt
│   └── business-rules.md          # R-CMD, R-LIV, R-FIN, R-STK, R-ADS
└── workflows/
    ├── bootstrap.md               # /bootstrap — init du projet
    ├── new-feature.md             # /new-feature — nouvelle feature E2E
    ├── new-rpc.md                 # /new-rpc — RPC atomique + Server Action
    ├── reconciliation-check.md    # /reconciliation-check — valide boucle COD
    ├── deploy-prod.md             # /deploy-prod — release production
    ├── bloc-next.md               # /bloc-next — passe au prochain bloc MVP
    └── hotfix.md                  # /hotfix — correction urgente
```

## Installation dans Antigravity

### Option A — Global (recommandé si un seul projet SHEVA)
1. Copier `GEMINI.md` dans `~/.gemini/GEMINI.md`
2. Dans ton workspace, créer le dossier `.agents/rules/` et `.agents/workflows/` et y copier les fichiers correspondants
3. Rédemarrer Antigravity

### Option B — Workspace uniquement
1. À la racine de ton repo `sheva-os/`, créer le dossier `.agents/`
2. Copier `GEMINI.md` → `.agents/rules/GEMINI.md`
3. Copier les autres fichiers dans `.agents/rules/` et `.agents/workflows/`
4. Dans Antigravity : panneau **Customizations** → **Rules** → vérifier que SHEVA OS apparaît

### Ajouter le cahier des charges au repo
Place le cahier des charges `.docx` original à :
```
docs/cahier-des-charges.md
```
(Le `.docx` peut être converti en markdown via pandoc, ou le committer tel quel si tu préfères.)

## Utilisation

Dans l'Agent panel d'Antigravity, tape simplement :

```
go
```

ou

```
on y va, démarre le bloc 1
```

L'Agent Manager va :
1. Charger `GEMINI.md` + les règles modulaires via `@` mentions
2. Invoquer `/bootstrap`
3. Déléguer aux 8 subagents (@architect, @frontend, @designer, @auth, @qa, @devops, @docs, @integrator)
4. Afficher le plan avec task groups + morsel tasks
5. Attendre ta validation avant d'exécuter

## Commandes utiles

- `/bootstrap` — initialise le projet (à faire une seule fois)
- `/new-feature <nom>` — construit une feature de bout en bout
- `/new-rpc <nom>` — crée une RPC Supabase + Server Action
- `/bloc-next` — démarre le prochain bloc MVP
- `/reconciliation-check` — valide la boucle COD complète
- `/deploy-prod` — release en production
- `/hotfix <description>` — correction urgente

## Règle d'or

> **Commandé ≠ Livré ≠ Encaissé ≠ Déposé ≠ Vérifié**

Le CA n'existe qu'après vérification Finance. Le ledger est append-only. RLS est la dernière ligne de défense.

## Les 8 subagents

| Subagent | Rôle |
|---|---|
| **@architect** | SQL, migrations, RLS, RPC, triggers, vues |
| **@frontend** | Next.js pages, Server Actions, composants |
| **@designer** | Design system, Shadcn, Tailwind tokens |
| **@auth** | Supabase Auth, middleware, RBAC |
| **@qa** | Vitest, Playwright, code review |
| **@devops** | CI/CD, Vercel, env, monitoring |
| **@docs** | README, ADR, changelog |
| **@integrator** | Fusionne front↔back, E2E features |

## Les 6 blocs MVP (12 semaines)

1. **Fondations** — Next.js + Supabase + Vercel + Auth + RBAC
2. **CRM + Commandes** — SAV crée, confirme, annule des commandes
3. **Dispatch + Livraisons** — interface mobile livreur + confirmation
4. **Cash + Dépôts** — boucle cash de la livraison au ledger (critique)
5. **Stock + Alertes** — Realtime alerts sur rupture
6. **Finance + Dashboard CEO** — CA vérifié en temps réel

**MVP terminé = une commande peut aller de BROUILLON à VÉRIFIÉE, le CA s'affiche en temps réel.**

---

Version pack : 1.0
Compatible Antigravity / Gemini Agent Manager
Stack cible : Next.js 14+ / Supabase / Vercel / TypeScript
