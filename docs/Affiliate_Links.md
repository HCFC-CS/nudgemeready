# Affiliate / partner links

Commercial outbound links in Nudge Me Ready (gifts, cards, stays, parking, lounges, meet & greet, ReadyPack supplies and similar) go through `src/services/affiliateLinks.ts`.

## How it works

1. Destination URLs are built as normal.
2. `withAffiliate(url)` matches the host to a partner and appends programme query params when configured.
3. Gift, Holiday Planner, ADHD Starter and ReadyPack shop UIs open links via `withAffiliate` and show a short disclosure.
4. Privacy & support includes the longer disclosure.
5. Until programme IDs (Amazon `tag`, Booking `aid`, etc.) are filled, disclosure copy says programmes are **not fully active** and does not claim commission is already earned.

## ReadyPack shop links

`src/services/readyPackShopLinks.ts` maps each content pack (except ADHD Starter and Holiday Planner, which have dedicated UIs) to optional partner shop searches. Links appear on item detail when the user opens a `pack-shop` template or a related shopping / supplies card.

| Pack | Typical shop focus |
|------|--------------------|
| Autism Support | Headphones, fidgets, sensory tools, Loop, Sensory Direct |
| Dementia Support | Pill organisers, calendar clocks, night lights |
| Student Success | Stationery, planners, study headphones, desk lamps |
| Shift Worker | Eye masks, blackout help, meal prep, earplugs |
| Working Parent | Lunch boxes, water bottles, name labels |
| University Starter | Bedding, laundry bags, kettles, desk lamps |
| New Baby | Nappies, muslins, changing bags |
| Menopause Support | Cooling towels, fans, water bottles, journals |
| Weight Loss & Wellness | Water bottles, yoga mats, resistance bands |
| IBS Management | Heat pads, food diaries, water bottles |
| Anxiety Support | Journals, earplugs, weighted blankets, calm Spotify |
| Wedding Planner | Moonpig cards, Notonthehighstreet favours, décor |
| Moving House | Packing boxes, tape, bubble wrap, labels |
| ADHD Starter | Existing supplies UI (Amazon, Argos, John Lewis, Etsy, eBay, Loop, Sensory Direct) |
| Holiday Planner | Existing travel partners (stays, parking, lounges, taxi) |

Health / wellbeing packs label shop hints as **organisational support only** (not medical products, prescriptions or treatment).

## Partners covered

| Partner | Used for |
|---------|----------|
| Amazon | Gift / card shopping · ReadyPack supplies |
| Moonpig | Cards · wedding |
| Notonthehighstreet | Gifts / cards · sensory · wedding · new baby |
| Argos | ADHD / ReadyPack supplies |
| John Lewis | Headphones / calm tech / family / halls |
| Etsy | Handmade fidgets / lanyards / wedding |
| eBay | Fidgets / headphones / move supplies |
| Loop Earplugs | Earplugs |
| Sensory Direct | Sensory / fidget tools |
| Booking.com | Stays |
| Expedia | Stays |
| Hotels.com | Stays |
| Holiday Extras | Parking, lounges, meet & greet, fast track |
| Looking4Parking | Parking compare |
| APH | Parking compare |
| Uber | Taxi option |
| No1 Lounges | Lounge booking |
| Priority Pass | Lounge network |
| Spotify | Bedtime / calm playlists |

## Not monetised

- Official airport parking / special assistance pages
- Google Maps / Google Search
- WhatsApp / mail / SMS
- Nudge Me Ready first-party URLs
- Charity / helpline information links

## Activating real IDs

Edit `affiliatePartners` in `src/services/affiliateLinks.ts` and set non-empty param values (for example Amazon `tag`, Booking `aid`, Holiday Extras `Aff`). Empty values leave the destination URL intact until you are approved.
