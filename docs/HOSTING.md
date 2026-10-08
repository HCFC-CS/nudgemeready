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

## 2. Enable GitHub Pages (required once — must be done in the UI)

GitHub Actions **cannot** turn Pages on for this repo (`Resource not accessible by integration`). A repo **admin** must do it:

1. Open https://github.com/HCFC-CS/nudgemeready/settings/pages while signed in as an owner/admin  
2. Under **Build and deployment → Source**, choose **GitHub Actions**  
3. Save (the page should show that Pages is waiting for the first Actions deploy)  
4. Custom domain (optional for now): `nudgemeready.app` — enable **Enforce HTTPS** after DNS verifies  

Then re-run **Deploy website** (Actions → Deploy website → Run workflow).

If Source only offers “Deploy from a branch”, your org may block Actions-based Pages — pick branch `gh-pages` / `/` instead and say so so we can switch the workflow.

## 3. App Store Connect

- Privacy Policy URL: `https://nudgemeready.app/privacy/`
- Support URL: `https://nudgemeready.app/support/`

## 4. Universal Links

`website/.well-known/apple-app-site-association` is included for Team `656UL52XWW` / `com.helencunliffe.nudgeme`.
After HTTPS works, Apple should be able to fetch:

`https://nudgemeready.app/.well-known/apple-app-site-association`
