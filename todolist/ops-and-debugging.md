# Ops & debugging

## Port 3100 — marketing site not showing (2026-05-29)

### Root cause (confirmed)

Stale Next.js process on **3100** returned **HTTP 500** while still listening. Missing/corrupt `.next` manifests:

```
ENOENT: .../apps/web/.next/server/app-paths-manifest.json
ENOENT: .../apps/web/.next/routes-manifest.json
```

| Hypothesis | Result |
|------------|--------|
| A — Nothing listening on 3100 | Rejected (process was up) |
| B — Stale Next.js + broken `.next` → 500 | **Confirmed** |
| C — EADDRINUSE on restart | Possible |
| D — Wrong folder (old Wirelux path) | Possible |
| E — Blank browser / CSS only | Rejected (plain Internal Server Error) |

**Evidence:** `curl http://localhost:3100` → 500 before restart, 200 after; deleting `.next` while dev running reproduces 500.

### Fix (in repo)

| Script | Purpose |
|--------|---------|
| `apps/web/scripts/dev.sh` | Kill stale process on 3100, start fresh dev |
| `npm run dev:web` | Marketing only (uses `dev:safe`) |
| `npm run dev` | Full stack; web uses `dev:safe` |
| `npm run dev:clean -w @virlux/web` | Wipe `.next` and restart |

### If 3100 breaks again

```bash
cd /Users/sinakazemnezhad/Desktop/Virlux
export PATH="$PWD/.tools/node/bin:$PATH"
npm run dev:web
# or nuclear:
npm run dev:clean -w @virlux/web
```

Verify: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100` → expect **200**.

---

## Other ops notes

| Status | Item |
|--------|------|
| open | Document Railway + Vercel split deploy in runbook |
| open | CI: ensure `prisma migrate deploy` matches prod |
| open | Secret scanning in CI for `.env` leaks |
| done | Remove debug middleware/instrumentation after 3100 fix verified |
