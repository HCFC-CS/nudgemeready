# Ready4 Pack Functional Audit — September 2026

Every content pack in the current catalogue was opened, not just listed. Dated create used the shared Pack Planner (quick add). Architecture was not replaced: dated planner rows still link to a NudgeItem; the horizon de-dupes so the user sees one row.

**Catalogue count:** 18 content packs. **Ready4Party is not in the catalogue.**

Shared planner means a configuration bug would still show up as a missing section, missing Budget/Documents door, or a failed create. Those were checked per pack.

Statuses: **PASS** · **FAIL** · **PARTIAL** · **N/A**

---

## How to read the matrix

- **Loads** — planner title and At a glance, or a calm “install to use” if not installed.
- **Install/activate** — screenshot mode treats `?pack=` as installed so the planner can be used. Store billing remains optional and was not charged in this pass.
- **Create item** — typed a pack-specific title into Quick add → Add here. All 18 created the card.
- **Feeds Nudges / Calendar** — dated items call `linkNudge` (now idempotent). Undated quick-add stays in the pack until a date is set.
- **Budget / Documents / Crew** — PASS only when the pack supports that surface **and** the button opened the shared engine. N/A when the pack does not support it.
- **Affiliate/find-it** — optional, on item details via the shared engine. Never required to save a planner item.

---

## Matrix

| Pack | Loads | Install | Overview | Planner | Create | Edit | Delete | Date | Feeds Nudges | Calendar | Budget | Documents | Crew | Affiliate | Persist | Back | Empty | Errors |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Ready4Study | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| Ready4Home | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS | PASS | PASS | PASS | PASS | PASS |
| Ready4Finance | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| Ready4Medication | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| Ready4Work | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| Ready4Family | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS | PASS | PASS | PASS | PASS | PASS |
| Ready4Travel | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| Ready4Wellbeing | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | N/A | PASS | PASS | PASS | PASS | PASS | PASS |
| Ready4Shopping | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS | PASS | PASS | PASS | PASS | PASS |
| Ready4Independence | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| Ready4Appointments | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| Ready4Moving | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| Ready4Wedding | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| Ready4Baby | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| Ready4Pets | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| Ready4DigitalLife | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| Ready4LifeAdmin | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| Ready4Emergencies | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| Ready4Party | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |

Edit / Delete: opening a planner card now opens the linked nudge editor (Save · Sorted · Later · Ask · Remove). Removing/cancelling the linked nudge archives or completes the planner source without minting a second row.

---

## Worked example — Ready4Moving

1. Open Moving planner (installed).
2. Create “Book removals van”.
3. Card appears in the pack. Progress “still open” updates.
4. Budget opens the shared Moving budget (overall envelope, categories, remaining).
5. Documents opens the shared Documents hub.
6. Dated save uses `linkNudge` once. Horizon keeps the nudge as the winning row.
7. Edit from the card updates the same nudge dates.
8. Sorted on the planner completes the linked nudge and awards points **once**.

Same pattern on Ready4Wedding, including Journey F:

| Field | Example | Result |
| --- | --- | --- |
| Overall budget | 5000 | £5,000.00 |
| Category | Wedding + free-form “Dog chaperone” | Both listed |
| Item | Photographer £1800.50 actual £300 | Totals update |
| Remaining | 5000 − 300 | £4,700.00 |
| NaN / concat | blank, decimal, large | PASS |

Overspend (envelope £1,000, actual £1,200) is allowed and shows a negative remaining with calm copy. That is not treated as a calculation bug.

---

## Duplication check (Phase 4)

| Case | Result |
| --- | --- |
| Dated pack item → PlannerItem + NudgeItem | Intended link. Horizon shows **one** row (nudge wins). |
| Save again / link again | Reuses `nudgeItemId` / `anchorPlannerItemId`. |
| Change date on planner | Linked nudge dates update. |
| Change date on nudge | Planner dates update. |
| Delete / cancel source | Linked nudge cancelled; row leaves the open timeline. |
| Complete from Focus and from planner | Points once (`sourceItemId` + kind). |
| Reopen pack | Does not create another linked nudge. |

---

## Notes for testers

- Packs do not replace Nudges. They add specialist sections and, when dated, the same life timeline.
- Help me find it is optional and can be hidden in Settings.
- Core six Add paths still work with **no** pack installed.
- Ready4Party is not shipping in this catalogue. Do not treat that as a broken pack.
