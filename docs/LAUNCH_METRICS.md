# Launch Metrics — Pulse Social MVP

Track these metrics weekly after launch. All are measurable from on-chain data + product analytics.

## North-star

**Supporter conversion rate** — profile visits where viewer buys ≥1 Supporter Share within 7 days.

## Creator activation

| Metric | Definition | Target (first 30 days) |
|--------|------------|------------------------|
| Profile created | Wallet calls `createProfile` | Baseline |
| Pool launched | `initializeCreatorPool` after profile | ≥60% of profiles |
| First post | On-chain post within 7 days of pool | ≥50% of pools |
| **Full activation** | Profile + pool + post | ≥30% of new profiles |

## Supporter loop

| Metric | Definition | Target |
|--------|------------|--------|
| Supporter conversion | Buy share / unique profile views | ≥5% |
| Unlock engagement | Gated post views by holders / total gated views | ≥70% unlocked views from holders |
| 7-day supporter retention | Holders who return to view exclusive content within 7 days | ≥25% |

## Revenue

| Metric | Definition |
|--------|------------|
| Revenue per activated creator | (tips + share buy volume fees) / activated creators |
| Tips per creator | Total tips / creators with ≥1 tip |
| Share volume per creator | `totalVolume` on creator pool / active pools |

## Quality guardrails

| Metric | Definition | Alert if |
|--------|------------|----------|
| Gating bypass rate | Reports of ungated supporter content | >0 confirmed |
| Failed IPFS uploads | Post creation errors (Pinata) | >2% of attempts |
| Tx failure rate | Failed buyShares / createPost | >10% |

## Instrumentation notes

- **On-chain**: index `createProfile`, `initializeCreatorPool`, `createPost`, `buyShares`, `sendTip` by day
- **Off-chain**: log `accessLevel` on post create; log gating CTA clicks (“Become a supporter”)
- **Dashboard**: creator activation funnel visible in `/dashboard` wizard completion rates
