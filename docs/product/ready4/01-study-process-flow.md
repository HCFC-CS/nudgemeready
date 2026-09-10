# Ready4 Study — Template process flows

**Pack:** `ready4-study` · **Source:** `src/data/readyPacks/ready4/study.ts`  
**Install mapping:** `templateToItem()` in `src/services/readyPackInstall.ts`

This document shows, for every template: **what is captured**, **how the app treats it**, and **what the user does next**.

---

## 0. Pack-level journey (how the pieces fit)

```mermaid
flowchart TD
  A[Install Ready4 Study] --> B[8 editable nudges created]
  B --> C[what-helps: pick today's focus]
  C --> D{Choice}
  D -->|Assignment| E[assignment-planner + assignment-steps]
  D -->|Revision| F[revision-planner + study-routine]
  D -->|Class prep| G[lecture-prep]
  D -->|Admin| H[Edit notes / own admin nudge]
  D -->|Rest| I[No pressure — leave others for later]
  E --> J[exam-countdown when exam nears]
  F --> J
  G --> K[weekly-reset looks ahead]
  J --> K
  K --> C
```

**Product intent:** Start with a kind daily choice (`what-helps`), then use planners/checklists as scaffolding. Nothing is locked; every field stays editable.

---

## 1. What install captures (system treatment)

On install, each template becomes a `NudgeItem` with:

| Template field | Becomes on nudge | Notes |
| --- | --- | --- |
| `title` | `title` | Shown on Today / details |
| `type` | `type` | `list` / `task` / `reminder` |
| `notes` | `notes` | Guidance copy |
| `listItems[]` | `listItems[]` status `open` | Tickable rows |
| `priority` | `priority` | Sorting / emphasis |
| `dueInDays` | `dueDate` = now + N days | Absolute ISO date at install |
| `reminderInDays` | `reminderDate` = now + N days | If set (Study pack does not use this today) |
| `repeatRule` | `repeatRule` | e.g. weekly |
| `speakingReminderText` | `speakingReminderText` | Spoken / TTS when used |
| — | `sourcePackId` = `ready4-study` | Provenance |
| — | `sourceTemplateId` | Template id |
| — | `userEdited` = `false` | Uninstall can remove unedited |

**User can always:** edit title/notes/dates/checklist · complete · snooze/reschedule · dismiss · tick list rows · ask Crew for help.

---

## 2. End-to-end state machine (any Study nudge)

```mermaid
stateDiagram-v2
  [*] --> Open: installed from template
  Open --> Open: edit / snooze / reschedule / tick list rows
  Open --> Done: mark complete
  Open --> Paused: pause
  Open --> Cancelled: dismiss
  Done --> [*]
  Cancelled --> [*]
  Paused --> Open: resume
```

---

## 3. Per-template flows

### 3.1 `what-helps` — What would help today?

| | |
| --- | --- |
| **Type** | `list` |
| **Purpose** | Daily soft triage — pick **one** direction without shame |
| **Captured at install** | Title, notes, 5 open checklist rows (no due date, no priority, no repeat) |
| **Info the user adds later** | Which row they tick; optional edit of row text; may leave unticked |

```mermaid
flowchart LR
  A[Open list] --> B[Read options]
  B --> C[Tick one that fits today]
  C --> D{Selected}
  D -->|Assignment steps| E[Open assignment-planner / assignment-steps]
  D -->|Revision block| F[Open revision-planner / study-routine]
  D -->|Prep for class| G[Open lecture-prep]
  D -->|Admin| H[Do light admin or add own note]
  D -->|Rest| I[Stop — valid outcome]
  C --> J[Optional: complete list or leave open for tomorrow]
```

**Next action (product):** Use the choice as a pointer into the other Study nudges — not a gate. Rest is a first-class outcome.

---

### 3.2 `assignment-planner` — Assignment due soon

| | |
| --- | --- |
| **Type** | `task` |
| **Purpose** | One assignment card with a near due date |
| **Captured at install** | Title, notes, `priority: important`, `dueDate` = install + **7 days** |
| **Not captured** | Checklist (empty) — user breaks work into steps on the card / sibling list |
| **Info the user adds later** | Real due date, assignment name in title/notes, subtasks, attachments |

```mermaid
flowchart TD
  A[Task created due +7 days] --> B[User edits title to real assignment]
  B --> C[Edit due date to real deadline]
  C --> D[Use assignment-steps list OR add steps on card]
  D --> E[Work in Focus / short sessions]
  E --> F{Done?}
  F -->|Yes| G[Mark task done]
  F -->|Need more time| H[Snooze / reschedule — no shame]
  H --> E
```

**Next action:** Rename + set real deadline → work via `assignment-steps` → complete or reschedule.

---

### 3.3 `assignment-steps` — Assignment tiny steps

| | |
| --- | --- |
| **Type** | `list` |
| **Purpose** | Micro-steps for one piece of coursework |
| **Captured at install** | Title + 5 open rows (brief → outline → source → help → submit) |
| **Info the user adds later** | Tick progress; rewrite steps; add/remove rows |

```mermaid
flowchart TD
  A[Open tiny steps list] --> B[Tick Open the brief]
  B --> C[Tick Write one messy outline]
  C --> D[Tick Find one source]
  D --> E{Stuck?}
  E -->|Yes| F[Tick Ask for help / Ask Crew]
  E -->|No| G[Continue]
  F --> G
  G --> H[Tick Submit when ready]
  H --> I[Mark list done · complete assignment-planner]
```

**Next action:** Work top-to-bottom (order suggested, not enforced) → optionally close sibling `assignment-planner`.

---

### 3.4 `revision-planner` — Revision topic list

| | |
| --- | --- |
| **Type** | `list` |
| **Purpose** | Short topic-focused revision sessions |
| **Captured at install** | Title, notes (“start tiny”), 4 rows (Topic 1/2, practice, break) |
| **Info the user adds later** | Real topic names; ticks; extra topics |

```mermaid
flowchart TD
  A[Edit Topic 1 / Topic 2 to real subjects] --> B[Pick one topic for this session]
  B --> C[Optional: start study-routine reminder / Focus]
  C --> D[Do practice question row]
  D --> E[Take Break row — part of the plan]
  E --> F[Complete list or leave open for next session]
```

**Next action:** Personalise topics → one short session → break → repeat.

---

### 3.5 `exam-countdown` — Exam day checklist

| | |
| --- | --- |
| **Type** | `list` |
| **Purpose** | Practical exam-day readiness |
| **Captured at install** | Title, `priority: important`, `dueDate` = install + **3 days**, 5 checklist rows |
| **Info the user adds later** | Real exam date/time/room in notes; ticks |

```mermaid
flowchart TD
  A[List due +3 days from install] --> B[User sets real exam date on card]
  B --> C[Confirm time and room]
  C --> D[Pack ID and stationery]
  D --> E[Plan travel]
  E --> F[Rest and water]
  F --> G[Phone silent / left outside if required]
  G --> H[Mark list done on exam morning]
```

**Next action:** Align due date to real exam → tick logistics → done on the day.

---

### 3.6 `lecture-prep` — Class bag checklist

| | |
| --- | --- |
| **Type** | `list` |
| **Purpose** | Leave-for-class bag check |
| **Captured at install** | Title, notes (skip what you don’t need), 5 open rows |
| **No due / repeat** | Use ad hoc before class, or user can add a time |

```mermaid
flowchart TD
  A[Before class] --> B[Open Class bag checklist]
  B --> C[Tick needed items only]
  C --> D[Skip optional rows freely]
  D --> E[Leave · mark done or leave open for next class]
```

**Next action:** Quick scan before leaving → tick what’s relevant → go.

---

### 3.7 `study-routine` — Study routine block

| | |
| --- | --- |
| **Type** | `reminder` |
| **Purpose** | Soft cue to start a short focus window |
| **Captured at install** | Title, notes, `priority: soon`, speaking text *“Study time when you are ready.”* |
| **No due/repeat at install** | User sets when it should fire |
| **Info the user adds later** | Reminder date/time; optional repeat |

```mermaid
flowchart TD
  A[Reminder installed] --> B[User sets date/time]
  B --> C[Notification / speaking nudge]
  C --> D[Open Focus or revision-planner]
  D --> E[Short session + break]
  E --> F[Complete / snooze / reschedule]
```

**Next action:** Schedule the reminder → when it fires, do a short block → break is expected.

---

### 3.8 `weekly-reset` — Week ahead glance

| | |
| --- | --- |
| **Type** | `list` |
| **Purpose** | Once-a-week calm lookahead |
| **Captured at install** | Title, notes, `repeatRule: weekly`, 4 open rows |
| **Info the user adds later** | What deadlines/classes matter this week; ticks |

```mermaid
flowchart TD
  A[Weekly list appears / repeats] --> B[Note deadlines this week]
  B --> C[Note classes to prep]
  C --> D[Plan one revision slot optional]
  D --> E[Rest / social time — also listed]
  E --> F[May spawn edits on assignment-planner / exam-countdown / lecture-prep]
  F --> G[Complete for this week · opens again next cycle]
```

**Next action:** Glance → light planning → optionally update other Study nudges → close for the week.

---

## 4. Capture vs treatment summary matrix

| Template id | Type | Due | Priority | Repeat | Speaking | Checklist | Primary next action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `what-helps` | list | — | — | — | — | 5 choice rows | Pick one direction for today |
| `assignment-planner` | task | +7d | important | — | — | — | Set real deadline · break into steps |
| `assignment-steps` | list | — | — | — | — | 5 steps | Tick micro-steps → submit |
| `revision-planner` | list | — | — | — | — | 4 topics | Rename topics · one short session |
| `exam-countdown` | list | +3d | important | — | — | 5 logistics | Align to exam day · tick prep |
| `lecture-prep` | list | — | — | — | — | 5 bag items | Tick before class |
| `study-routine` | reminder | — | soon | — | Yes | — | Set time · Focus session |
| `weekly-reset` | list | — | — | weekly | — | 4 glance rows | Weekly plan → update other cards |

---

## 5. Suggested user path (happy day)

```mermaid
sequenceDiagram
  participant U as User
  participant H as what-helps
  participant A as assignment-* 
  participant R as study-routine
  participant W as weekly-reset

  U->>H: Morning — pick one option
  alt Assignment
    U->>A: Edit planner due date
    U->>A: Tick tiny steps
    U->>R: Optional timed focus block
  else Revision
    U->>R: Fire study-routine
    U->>A: Use revision-planner topics
  else Rest
    U->>H: Tick Rest — stop
  end
  U->>W: Once a week — glance ahead
```

---

## 6. Related docs

- [Product spec — Ready4 Study](./01-study.md)
- [Ready4 catalogue](../02-Ready4_Catalogue_Edition_1.md)
- [Process flows (platform)](../04-Process_Flows.md)
- Spreadsheet export: `exports/ready4-templates-csv/ready4-study.csv`
