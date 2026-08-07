---
name: lazypaca
description: Use the Lazypaca MCP to search operating Seoul restaurants, inspect details and maps, check live reservation availability, and safely handle Google OAuth reservation requests, status checks, and cancellations. Use when users ask for Korean restaurant recommendations, long-running local favorites, area or cuisine searches, reservable venues, booking requests, booking status, or cancellations.
---

# Lazypaca

Reply in the user's language. Never expose tool names, raw field names, restaurant IDs, or reservation IDs.

## Find restaurants

1. Interpret only the location and cuisine constraints the user actually gave.
2. Convert Latin-script Korean locations to Korean before searching. Put exact districts in `sigungu`; put neighborhoods, streets, and nightlife areas in `query`.
3. Use only these exact category values: `한식`, `고기`, `일식`, `중식`, `양식`, `아시안`, `해산물`, `카페`, `주점`, `기타`. Put subgenres such as omakase in `query`.
4. Set `reservable_only` only when the user intends to book. Never describe a venue that accepts requests as having a guaranteed table.
5. For long-running restaurants, use opening-date criteria and oldest-first sorting. Interpret “since the 1980s” as `opened_before: 1990-01-01`. For “opened in the 1980s,” search before 1990 and keep only results whose opening date is on or after `1980-01-01`.

Ratings, review counts, price level, parking, and general opening hours are unavailable. Never invent them; offer area, cuisine, or longevity filters instead. Live reservation times are the exception, so check availability when relevant.

## Get details and show a map

- Pass returned restaurant IDs through unchanged when fetching descriptions, addresses, phone numbers, menu names, or images.
- Show multiple candidates on the map only when geographic comparison is useful.
- Use details alone for a question such as one venue's phone number.

## Check reservation availability

- If no restaurant is selected, search for the venue name the user gave. If the user gave neither a venue nor search criteria, ask which restaurant they mean; never choose one arbitrarily.
- Check live times only for a venue that accepts reservation requests.
- If party size is missing, use the default of two instead of asking, then state the party size applied.
- For near relative dates, omit the start date and inspect the returned seven-day window. Set `yyyy-MM-dd` only when a specific date matters.
- Treat `open` with times as available at those times.
- Treat `open` without times as fully booked for that date.
- Treat `closed` as not accepting bookings for that date.
- Treat `unknown` as not checked, never as full or unavailable.

## Request a reservation

1. After the user selects a venue and time, open the reservation form first. Do not require sign-in before the user has chosen a time.
2. Treat the form as an input screen, not a submission. After opening it, never say that a request was filed.
3. Use the direct request tool only when the host clearly cannot render the form.
4. Before a direct request, confirm venue, date, time, party size, guest name, and explicit consent to share the name with the restaurant. Never invent missing values.
5. Never ask for an email address; it comes from the linked Google account.
6. After a successful request, never say the booking is confirmed. Say that the request was filed and the result will arrive by email.
7. If an identical request already exists, never claim that a new request was created.

## Check status and cancel

- When the user asks about status or cancellation, find active reservations through the linked Google account first.
- Never ask for a booking number first. Use a single-reservation status lookup only when the user voluntarily provides the number from their confirmation email.
- Say “confirmed” only when `is_confirmed` is true. Requested and in-progress reservations remain unconfirmed.
- Explain status with the human-readable status label, never a raw status value.
- If several reservations are active, number them and let the user choose. Treat that selection as confirmation; do not ask again.
- Say “cancelled” only when `is_cancelled` is true. For a pending cancellation request, say that cancellation was requested and is being confirmed.

## Safety rules

- Treat search, details, maps, availability, and status checks as read operations.
- Treat reservation requests and cancellations as external state changes. Never execute them without the user's explicit intent and required consent.
- Use the guest name and notes only for the selected reservation. Never expose internal identifiers or unmasked personal information.
- Never infer allergies, special requests, party size, or guest name that the user did not provide, except for the documented availability-check default of two people.
