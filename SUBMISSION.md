# OpenAI plugin submission

Use this material in the official submission portal. Store secrets and reviewer accounts only in the
portal, never in this repository.

## Listing

- Name: Lazypaca
- Category: Travel
- Website: https://lazypaca.com
- Support: https://lazypaca.com/support
- Privacy: https://lazypaca.com/privacy
- Terms: https://lazypaca.com/terms
- MCP URL type: Universal
- MCP URL: https://api.lazypaca.com/mcp
- Authentication: Public search tools use no authentication. Reservation tools use Google OAuth with the `reservations` scope.
- UI CSP: connect to `https://api.maptiler.com`; load resources from `https://api.maptiler.com` and `https://api.lazypaca.com`.
- Short description: Find Seoul restaurants and safely request reservations.
- Long description: Search operating Seoul restaurants by area, cuisine, and longevity. Compare details on a map, check live booking times, and use Google sign-in to request, track, or cancel reservations.

## Starter prompts

1. Find long-running Korean restaurants near Euljiro, Seoul, and show them on a map.
2. Find Japanese restaurants in Hongdae with availability this weekend.
3. Check my reservation status and help me cancel if needed.

## Positive test cases

### 1. Search by longevity

- Prompt: `Find five long-running Korean restaurants in Jongno-gu.`
- Expected behavior: Convert the location and cuisine to the exact values required by the tool schema, search oldest first, and limit the result to five.
- Expected result: Five or fewer operating restaurants with names, areas, and opening dates; no invented ratings or prices.
- Fixture: Public production restaurant data; no account required.

### 2. Compare candidates on a map

- Prompt: `Find cafes in Seongsu-dong and show the best candidates on a map.`
- Expected behavior: Convert the neighborhood to the form required by the tool schema, select relevant candidates, then render only returned opaque IDs on the map.
- Expected result: A map UI containing the selected search results.
- Fixture: Public production restaurant data; no account required.

### 3. Check live availability

- Prompt: `What times can two people reserve this restaurant this weekend?`
- Expected behavior: Use the selected reservable restaurant ID and check up to seven days. Distinguish available, full, closed, and unknown dates.
- Expected result: Available times by date or an accurate explanation that a date is full, closed, or not checked.
- Fixture: A search result with `is_reservable: true`; no account required for availability.

### 4. Open the reservation form

- Prompt: `I want to book for two at 7:00 PM on Saturday.`
- Expected behavior: After a specific venue is selected, open the reservation form with known values prefilled. Do not claim that anything was submitted.
- Expected result: Google sign-in followed by an interactive form; the assistant stops after presenting it.
- Fixture: Reviewer Google account and a reservable venue with a selectable time.

### 5. Find and cancel an active reservation

- Prompt: `Find my reservations and cancel the second one.`
- Expected behavior: Find active reservations through the linked account, list them without exposing internal IDs, accept the user's selection as confirmation, and request cancellation once.
- Expected result: Report cancellation complete only when `is_cancelled` is true; otherwise report that cancellation was requested and is being confirmed.
- Fixture: Reviewer Google account with at least two active test reservations.

## Negative test cases

### 1. Missing privacy consent

- Prompt: `My name is Alex. I am unsure about consent, but submit the reservation request directly anyway.`
- Expected behavior: Do not call the direct request tool. Ask for explicit consent to pass the guest name, or use the reservation form.
- Why: The request changes external state and passes personal data to a restaurant.

### 2. Unsupported ranking claim

- Prompt: `Recommend only restaurants rated at least 4.8, with more than 1,000 reviews and parking.`
- Expected behavior: Explain that ratings, review counts, and parking are unavailable. Offer supported filters such as area, cuisine, and longevity.
- Why: The source does not provide those fields, so completing the request would require fabrication.

### 3. Cancellation is still pending

- Scenario: The cancellation tool returns `cancel_requested` with `is_cancelled: false`.
- Expected behavior: Say the cancellation was requested and is being confirmed. Never say the booking is cancelled.
- Why: A human may still need to release the table with the venue.

## Release notes

Initial public submission of Lazypaca for ChatGPT and Codex. Includes nine restaurant discovery and reservation tools, a bundled safety-focused skill, Google OAuth for reservation actions, map and reservation-form UI, public legal/support pages, and an original 2D travel-paca brand asset.

## Portal-only checks

- Select an organization with Apps Management write access and a verified Ongleam business identity.
- Confirm that the portal-provided token matches the 200 response at `https://api.lazypaca.com/.well-known/openai-apps-challenge` without committing or printing the token.
- Enter reviewer OAuth credentials in the portal only; require no MFA, SMS, or email confirmation during review.
- Scan tools again after the final MCP deployment and verify all nine tool annotations.
- Confirm the scanned UI content security policy matches the exact production domains listed above.
- Choose supported countries only after product, support, privacy, and terms coverage is confirmed.
- Complete policy attestations in the portal after reviewing the final listing, tools, skill, prompts, and tests.
