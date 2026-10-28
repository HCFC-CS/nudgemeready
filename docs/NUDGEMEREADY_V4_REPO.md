# Nudge me Ready v4 lives in its own repository

v2 and v3 stay in this repo (`HCFC-CS/nudgemeready`).

The v4-only snapshot is already published on branch **[v4-standalone](https://github.com/HCFC-CS/nudgemeready/tree/v4-standalone)**.

GitHub names cannot include spaces, so the new repo must be called **`nudgemeready-v4`** (not `nudgemeready v4`).

This environment can only write to `HCFC-CS/nudgemeready`, so the empty GitHub repository has to be created once in the browser.

## 1. Create the empty GitHub repo

1. Open [https://github.com/new](https://github.com/new) while logged in as the HCFC-CS owner.
2. Owner: **HCFC-CS**
3. Repository name: **nudgemeready-v4**
4. Choose **Public**
5. Leave **Add a README file** unticked
6. Click **Create repository**

## 2. Fill it from the v4 snapshot (Windows)

Keep the existing app folder as `C:\Users\HCCun\Documents\nudgemeready`.

```powershell
cd C:\Users\HCCun\Documents
git clone --branch v4-standalone --single-branch https://github.com/HCFC-CS/nudgemeready.git nudgemeready-v4
cd nudgemeready-v4
git checkout -b main
git remote set-url origin https://github.com/HCFC-CS/nudgemeready-v4.git
git push -u origin main
npm.cmd install
```

After that, v4 is https://github.com/HCFC-CS/nudgemeready-v4

## 3. Build TestFlight from the v4 folder only

```powershell
cd C:\Users\HCCun\Documents\nudgemeready-v4
npx eas-cli build --platform ios --profile production
```

Do not run that command from `Documents\nudgemeready` — that folder still has v2 and v3.
