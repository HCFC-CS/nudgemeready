# Product Spec — Ready 4 Travel

| Field | Value |
| --- | --- |
| **Pack id** | `ready4-travel` |
| **Kind** | content |
| **Category** | events |
| **Version** | 1.0.0 |
| **Icon** | `airplane-outline` |
| **Source** | `src/data/readyPacks/ready4/travel.ts` |

---

## 1. Positioning

Passports, packing, transport, airport extras, stays and a calm return-home checklist.

### Problem it solves

Reduces mental load by providing editable, shame-free structure for this life area — install once, then adapt every nudge.

### Core outcomes

- Travel countdown
- Packing lists
- Documents
- Airport checklist
- Accommodation
- Return home

### Perfect for

- Holidays
- Visits
- Anyone who freezes before flying

---

## 2. Commercial / access

**Paid catalogue SKU:** `ready.pack.ready4_travel`

Edition 1 commercial list price (when IAP live): typically ~£4.99 individual / included in Premium or bundles.
TestFlight with empty RevenueCat keys: installs without charge; UI must stay honest.

### Customers also buy (Edition 1)

- Ready 4 Appointments
- Ready 4 Finance
- Ready 4 Shopping

---

## 3. Product principles (must hold)

- Warm, supportive copy — no guilt for skipped steps
- Every installed item is editable, snoozeable, dismissible
- Not medical, legal, or financial advice
- No clinical claims

---

## 4. Feature modules (in-app feature list)

- Travel countdown
- Packing lists
- Documents
- Airport checklist
- Accommodation
- Return home

---

## 5. Shipped templates (12)

### Check passport expiry

- **Template id:** `passport-expiry`
- **Type:** `reminder`
- **Priority:** important
- **Due in:** 14 day(s) from install
- **Reminder in:** 14 day(s)
- **Notes:** Confirm your passport is valid for your trip and any destination rules.
- **Speaking text:** Gentle reminder to check your passport expiry date.

### Confirm travel insurance

- **Template id:** `travel-insurance`
- **Type:** `reminder`
- **Priority:** important
- **Due in:** 10 day(s) from install
- **Reminder in:** 10 day(s)
- **Notes:** Check cover dates, policy number, and emergency contact details.
- **Speaking text:** Remember to confirm your travel insurance.

### Need transport to the airport?

- **Template id:** `need-transport`
- **Type:** `list`
- **Priority:** important
- **Due in:** 7 day(s) from install
- **Notes:** Tick the option that fits. Put your airport name in the notes (e.g. Heathrow) for local taxi and parking links on this card.
- **Checklist:**
  - Taxi / private hire
  - Airport parking
  - Drop-off by family or friend
  - Train / coach / public transport
  - Not decided yet

### Book taxi or private hire

- **Template id:** `airport-taxi`
- **Type:** `reminder`
- **Priority:** soon
- **Due in:** 5 day(s) from install
- **Reminder in:** 5 day(s)
- **Notes:** Add your airport or home area in the notes. Open taxi links below when ready.
- **Speaking text:** Reminder to book a taxi or private hire for the airport.

### Pay or book airport parking

- **Template id:** `airport-parking`
- **Type:** `reminder`
- **Priority:** soon
- **Due in:** 5 day(s) from install
- **Reminder in:** 5 day(s)
- **Notes:** Add your airport name. Use the parking links below. Confirm booking reference.
- **Speaking text:** Reminder about airport parking payment or booking.

### Book or confirm your stay

- **Template id:** `book-stay`
- **Type:** `reminder`
- **Priority:** soon
- **Due in:** 12 day(s) from install
- **Reminder in:** 12 day(s)
- **Notes:** Destination: (add place). Compare stays using the links on this card.
- **Speaking text:** Reminder to book or confirm where you are staying.

### Airport extras for this trip?

- **Template id:** `airport-extras`
- **Type:** `list`
- **Priority:** soon
- **Due in:** 8 day(s) from install
- **Notes:** Tick what would help. Put your airport name in the notes for official links.
- **Checklist:**
  - Special assistance
  - Lounge access
  - Meet & greet
  - Speedy boarding / fast track
  - None needed

### Arrange special assistance

- **Template id:** `special-assistance`
- **Type:** `reminder`
- **Priority:** important
- **Due in:** 10 day(s) from install
- **Reminder in:** 10 day(s)
- **Notes:** Add your airport name. Use official assistance links and request help through your airline. Organisational support only.
- **Speaking text:** Reminder to arrange special assistance if you need it.

### Packing checklist

- **Template id:** `packing-checklist`
- **Type:** `list`
- **Priority:** soon
- **Due in:** 3 day(s) from install
- **Notes:** Tick as you pack. Edit freely for your trip.
- **Checklist:**
  - Passport and tickets
  - Phone charger and adapters
  - Clothes for the forecast
  - Toiletries
  - Medication if relevant (as prescribed)
  - Entertainment for travel

### Online check-in

- **Template id:** `check-in`
- **Type:** `reminder`
- **Priority:** important
- **Due in:** 1 day(s) from install
- **Reminder in:** 1 day(s)
- **Notes:** Open when check-in becomes available and save boarding passes.
- **Speaking text:** Reminder to complete online check-in.

### Leave for the airport

- **Template id:** `departure-time`
- **Type:** `reminder`
- **Priority:** needs_attention
- **Due in:** 0 day(s) from install
- **Reminder in:** 0 day(s)
- **Notes:** Set your own departure time based on traffic and security queues.
- **Speaking text:** Time to leave for the airport when you are ready.

### Return-home checklist

- **Template id:** `return-home`
- **Type:** `list`
- **Priority:** not_urgent
- **Due in:** 21 day(s) from install
- **Notes:** A soft landing after travel.
- **Checklist:**
  - Unpack bag
  - Start laundry
  - Restock fridge basics
  - Charge devices
  - Sort post

---

## 6. AI Coach prompts (stored; Coach UI may be deferred)

- Help me break travel prep into small calm steps.
- Suggest a packing list for a short city break.
- Help me choose between taxi and airport parking for this trip.

---

## 7. Install behaviour (product requirements)

1. User can preview title, summary, features, and templates before install.
2. Install copies templates into the user’s nudge store as editable items.
3. Provenance / pack origin may be shown on installed items.
4. Uninstall modes (where implemented): remove unedited-only or all items from pack.
5. Free packs install without purchase; paid packs respect entitlement / honest complimentary mode.

---

## 8. Acceptance criteria (QA)

- [ ] Pack appears in ReadyPacks catalogue with correct free/paid labelling
- [ ] Preview lists all 12 templates
- [ ] Install creates editable nudges matching template titles
- [ ] Checklist items appear where specified
- [ ] Speaking text present where specified
- [ ] Repeat / due offsets behave as defined (or degrade gracefully if calendar unset)
- [ ] Copy stays non-shaming; health disclaimer visible when required
- [ ] Billing honesty: no fake charge when RevenueCat keys empty

---

## 9. Out of scope for this pack

- Diagnosis, dosing, or treatment changes
- Guaranteed cloud sync of pack content
- Live AI Coach conversation (prompts only until Coach ships)
- Bundle pricing (see Edition 1 Volume 2 Part 16)

---

## 10. Traceability

- Catalogue order: `src/data/readyPacks/ready4/index.ts`
- Factory: `ready4Pack()` in `src/data/readyPacks/packFactory.ts`
- Edition 1 overview: `docs/product/02-Ready4_Catalogue_Edition_1.md`
