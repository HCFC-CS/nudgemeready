# Nudge me Ready v4 lives in its own repository

v2 and v3 stay in this repo (`HCFC-CS/nudgemeready`).

v4 is a separate GitHub repository: **[HCFC-CS/nudgemeready-v4](https://github.com/HCFC-CS/nudgemeready-v4)**

GitHub names cannot include spaces, so the repo is `nudgemeready-v4`, not `nudgemeready v4`.

A v4-only snapshot is also on branch `v4-standalone` in this repo, in case the new GitHub repository is still being created.

## Clone v4 beside the existing folder (Windows)

Keep this project as:

`C:\Users\HCCun\Documents\nudgemeready`

Put v4 here:

```powershell
cd C:\Users\HCCun\Documents
git clone https://github.com/HCFC-CS/nudgemeready-v4.git
cd nudgemeready-v4
npm.cmd install
```

If the new GitHub repo is empty or not created yet, clone the snapshot branch from this repo instead:

```powershell
cd C:\Users\HCCun\Documents
git clone --branch v4-standalone --single-branch https://github.com/HCFC-CS/nudgemeready.git nudgemeready-v4
cd nudgemeready-v4
git checkout -b main
npm.cmd install
```

Then create an empty public repository named `nudgemeready-v4` under **HCFC-CS** (no README), and push:

```powershell
git remote set-url origin https://github.com/HCFC-CS/nudgemeready-v4.git
git push -u origin main
```

Build TestFlight from the **v4 folder only**:

```powershell
npx eas-cli build --platform ios --profile production
```
