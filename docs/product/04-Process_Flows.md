# Nudge Me Ready — Process Flows

Operational flows for product, support and engineering. Diagrams use Mermaid.

---

## 1. First-run registration and optional lock

```mermaid
flowchart TD
  A[Open app] --> B{Profile complete?}
  B -->|No| C[Registration: name / photo / terms]
  C --> D[Enter app or offer lock setup]
  B -->|Yes| E{App lock enabled?}
  D --> E
  E -->|No| F[Home / Today]
  E -->|Yes| G{Unlocked this session?}
  G -->|No| H[Unlock: Face ID or PIN/password]
  H -->|OK| F
  H -->|Forgot| I[Forgot flow]
  I --> F
  D --> J[Optional: turn on lock]
  J --> K[Show recovery code]
  K --> L[Share / save offline]
  L --> M[Confirm saved]
  M --> F
```

---

## 2. App lock and recovery

```mermaid
flowchart TD
  A[Settings: Security] --> B{Lock on?}
  B -->|Off| C[Choose PIN or password]
  C --> D[Recovery email]
  D --> E[Optional Face ID]
  E --> F[Enable lock]
  F --> G[RecoveryCodeSaveCard]
  G --> H[Share to offline store]
  H --> I[Confirm]
  B -->|On| J[Toggle lock on background]
  J --> K[Update biometrics]
  K --> L[Rotate recovery code]
  L --> G
  K --> M[Update recovery email]
  K --> N[Turn off lock with credential]
```

### Forgot credential

```mermaid
flowchart TD
  A[Sign-in: Forgot] --> B{Method}
  B --> C[Face ID / device passcode]
  B --> D[Email reset link]
  B --> E[Recovery code]
  C --> F[Reset credential]
  D --> F
  E --> F
  F --> G[Optional new recovery code]
  G --> H[Unlocked / continue]
```

**Support line:** Device passcode + app lock + offline recovery code covers lost phones and casual snooping for this app class.

---

## 3. Create and complete a nudge

```mermaid
flowchart TD
  A[+nudge or type screen] --> B[Choose type]
  B --> C[Edit fields / checklist / times]
  C --> D[Save]
  D --> E[Appears on Today]
  E --> F{User action}
  F --> G[Complete]
  F --> H[Snooze / reschedule]
  F --> I[Edit]
  F --> J[Dismiss / cancel]
  G --> K[Completed list]
  H --> E
  I --> E
  J --> L[No shame empty state]
```

---

## 4. ReadyPack browse → install

```mermaid
flowchart TD
  A[Home or More: ReadyPacks] --> B[Catalogue list]
  B --> C[Preview pack]
  C --> D{Free pack?}
  D -->|Yes Home / Wellbeing| E[Install allowed]
  D -->|Paid SKU| F{Store billing enabled?}
  F -->|No keys empty| G[Honest copy: will not be charged]
  G --> E
  F -->|Yes RevenueCat live| H[Purchase / restore entitlement]
  H -->|Owned| E
  H -->|Cancel| C
  E --> I[Copy templates into nudge store]
  I --> J[Editable items on Today]
  J --> K[Optional provenance banner]
```

### Entitlement honesty

```mermaid
flowchart LR
  A[readyPackEntitlements] --> B{API key configured?}
  B -->|No| C[Billing off / complimentary install]
  B -->|Yes| D[IAP via RevenueCat]
  A --> E{__DEV__?}
  E -->|Yes| F[allowAll possible]
  E -->|No production| G[allowAll forced false]
```

---

## 5. Crew invite and accept

```mermaid
flowchart TD
  A[Captain: Invite Crew] --> B[Create invite]
  B --> C[Share deep link]
  C --> D[Invitee opens link]
  D --> E{App installed?}
  E -->|No| F[Store / TestFlight then return]
  F --> D
  E -->|Yes| G[Accept Invite screen]
  G --> H[Crew supporter terms]
  H --> I[Accept]
  I --> J[Supporter-only mode]
  J --> K[See supported person nudges]
  K --> L{Set up own world?}
  L -->|Yes| M[Enable own nudge world]
  L -->|No| K
```

```mermaid
flowchart LR
  A[Ask for Help] --> B[Choose Crew member]
  B --> C[Send request]
  C --> D[Crew notified / sees request]
  D --> E[Support action]
```

---

## 6. Appointment with guests and calendar

```mermaid
flowchart TD
  A[New appointment] --> B[Title / time / place]
  B --> C{Add guests?}
  C -->|Yes| D[Contacts permission]
  D --> E[Search / favourites]
  E --> F[Attach guests]
  C -->|No| G[Save]
  F --> G
  G --> H{Link phone calendar?}
  H -->|Yes| I[Calendar permission]
  I --> J[Write event to calendar]
  H -->|No| K[Done]
  J --> K
```

---

## 7. Travel pack shop links (affiliate-safe)

```mermaid
flowchart TD
  A[Ready 4 Travel item] --> B[User opens shop / booking link]
  B --> C{Partner host?}
  C -->|Yes Amazon / Booking / extras| D{Programme IDs set?}
  D -->|Yes| E[Affiliate params applied]
  D -->|No| F[Plain link + soft UTM / disclosure]
  C -->|Official airport / maps / search| G[Never affiliate]
  E --> H[External browser]
  F --> H
  G --> H
```

---

## 8. TestFlight release path

```mermaid
flowchart TD
  A[Commit on feature branch] --> B[eas build iOS production]
  B --> C[autoIncrement build number]
  C --> D[Sign with ASC credentials]
  D --> E[IPA on EAS]
  E --> F[eas submit / auto-submit]
  F --> G[App Store Connect processing]
  G --> H[TestFlight Ready to Test]
  H --> I[Add to Internal Testing group]
  I --> J[Testers install]
```

Current example: **0.2.0 build 13** (see Expo build dashboard).

---

## 9. Support triage flow

```mermaid
flowchart TD
  A[User contacts support] --> B{Topic}
  B --> C[Lock / recovery]
  B --> D[ReadyPacks / charging]
  B --> E[Crew invite]
  B --> F[Permissions Face ID calendar contacts]
  B --> G[Data loss]
  C --> C1[Confirm device passcode + recovery offline + Forgot path]
  D --> D1[Explain billing off if keys empty / restore when live]
  E --> E1[Deep link + app installed + terms]
  F --> F1[iOS Settings + TestFlight build]
  G --> G1[Local-only: reinstall clears — no cloud restore]
```

---

## 10. Content publishing (Ready 4)

```mermaid
flowchart TD
  A[Edit pack module in ready4/*.ts] --> B[Catalogue order in ready4/index.ts]
  B --> C[Tests: install / remaining / shop links]
  C --> D[Update docs/product/02 catalogue if user-facing]
  D --> E[EAS build for device verification]
```

---

## Related documents

- [Product Spec Catalogue](./01-Product_Spec_Catalogue.md)  
- [Ready 4 Catalogue Edition 1](./02-Ready4_Catalogue_Edition_1.md)  
- [User Guides](./03-User_Guides.md)  
