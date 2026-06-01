# Push VIRLUX to GitHub (one-time)

Repo: **https://github.com/kazemnezhadsina144-dot/VIRLUX**

4 commits ready on branch `cursor/virlux-v2-platform-and-todolist` and `main`.

## Fastest path

```bash
cd /Users/sinakazemnezhad/Desktop/Virlux
npm run deploy:push-setup
```

Then follow Option A (SSH key) or B (gh login).

## Push both branches

```bash
git push -u origin cursor/virlux-v2-platform-and-todolist
git push -u origin main
```

## SSH deploy key (if not done)

Add this key at https://github.com/kazemnezhadsina144-dot/VIRLUX/settings/keys (write access):

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAb23qg+D2netWi2ShE3d0GZjIS0QaFsCXfmvo3nw54f virlux-cursor-push
```

## After push

1. Open PR: `cursor/virlux-v2-platform-and-todolist` → `main`
2. Deploy staging: `RAILWAY_TOKEN=... VERCEL_TOKEN=... npm run staging:wire`
3. Run GitHub Action **Staging smoke** with Railway API URL
