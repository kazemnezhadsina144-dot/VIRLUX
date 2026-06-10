# VIRLUX — loop prompt library

| File | Purpose |
|------|---------|
| `loop-suggestions-100.json` | **100** Cursor-ready prompts (10 categories × 10) — live deploy, DNS, GTM, gates |
| `loop-pack-10-active.json` | **10** rows for Sina Command Agent loop — one round per category |

## Categories (catalog)

1. **deploy** — runbook, smoke, Vercel env, Prisma, prod-close  
2. **dns** — virlux.com, app subdomain, SSL, health per host  
3. **gtm** — media checklist, pilots, demos, accelerator  
4. **gates** — REAL-MONEY-GATES, staging-only, compliance  
5. **api** — health, routes, CORS, meta version  
6. **ui** — web + app build, pilot flag, a11y  
7. **staging** — platform setup, migrations, smoke after DNS  
8. **docs** — plan.json, THREAD-PORTFOLIO, SSOT  
9. **command** — Sina Command hub, portfolio lane  
10. **maint** — git, audit, build, round 10 Submit  

## Activate (founder — clicks only)

1. Open **Sina Command** on Desktop.  
2. **Refresh** (gold, top right).  
3. **Agent loop** tab → VIRLUX pack / goal from `loop-pack-10-active.json`.  
4. **Start loop with this →** on row 1, or paste `goal_default` → **Start loop**.

## Activate (script)

```bash
python3 ~/Desktop/SourceA/scripts/activate-portfolio-loop.py --pack virlux
```

Keeps portfolio lane on **VIRLUX** — staging pilot; not TrustField or wire.

**Thread:** `THREAD-PORTFOLIO` · **Repo key:** `virlux`
