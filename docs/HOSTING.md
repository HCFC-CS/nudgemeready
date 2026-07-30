# Hosting nudgemeready.app

Static site lives in `/website` and deploys with GitHub Pages.

## Live URLs (after DNS + Pages are on)

- https://nudgemeready.app/
- https://nudgemeready.app/privacy/
- https://nudgemeready.app/support/
- https://nudgemeready.app/invite/… (opens the app via deep link)

## 1. Point the domain (IONOS)

Your domain currently shows the IONOS parking page. In **IONOS → Domains → nudgemeready.app → DNS**:

1. Remove or replace the parking/default A records.
2. Add these **A** records for `@` (root):

| Type | Name | Value |
|------|------|-------|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |

3. (Optional) Add **CNAME** for `www` → `hcfc-cs.github.io`

DNS can take from a few minutes up to 24–48 hours.

## 2. Enable GitHub Pages

The workflow uses `configure-pages` with `enablement: true`, so the first deploy can create the Pages site.

If you still see **Get Pages site failed / Not Found**, set this once in the UI:

1. Open https://github.com/HCFC-CS/nudgemeready/settings/pages  
2. **Build and deployment → Source** → **GitHub Actions** (not “Deploy from a branch”)  
3. Custom domain: `nudgemeready.app`  
4. Enable **Enforce HTTPS** after DNS verifies  

Then re-run **Deploy website** (Actions → workflow → Run workflow), or push any change under `website/`.

## 3. App Store Connect

- Privacy Policy URL: `https://nudgemeready.app/privacy/`
- Support URL: `https://nudgemeready.app/support/`

## 4. Universal Links

`website/.well-known/apple-app-site-association` is included for Team `656UL52XWW` / `com.helencunliffe.nudgeme`.
After HTTPS works, Apple should be able to fetch:

`https://nudgemeready.app/.well-known/apple-app-site-association`
