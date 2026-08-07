# OpenAI plugin submission

공식 제출 포털에 입력할 검토 자료다. 비밀정보와 리뷰어 계정은 저장소에 기록하지 않고 포털에만 입력한다.

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

1. 서울 을지로에서 오래된 한식당 찾아서 지도에 보여줘.
2. 이번 주말 홍대에서 예약 가능한 일식당 찾아줘.
3. 내 예약 상태를 확인하고 취소가 필요하면 도와줘.

## Positive test cases

### 1. Search by longevity

- Prompt: `종로구에서 오래된 한식당 5곳 찾아줘.`
- Expected behavior: Call restaurant search with `종로구`, Korean cuisine, oldest-first sorting, and a limit of five.
- Expected result: Five or fewer operating restaurants with names, areas, and opening dates; no invented ratings or prices.
- Fixture: Public production restaurant data; no account required.

### 2. Compare candidates on a map

- Prompt: `성수동 카페를 찾아서 괜찮은 후보들을 지도에 보여줘.`
- Expected behavior: Search using the Korean neighborhood query, select relevant candidates, then render only returned opaque IDs on the map.
- Expected result: A map UI containing the selected search results.
- Fixture: Public production restaurant data; no account required.

### 3. Check live availability

- Prompt: `이 식당 이번 주말 2명 예약 가능한 시간 알려줘.`
- Expected behavior: Use the selected reservable restaurant ID and check up to seven days. Distinguish available, full, closed, and unknown dates.
- Expected result: Available times by date or an accurate explanation that a date is full, closed, or not checked.
- Fixture: A search result with `is_reservable: true`; no account required for availability.

### 4. Open the reservation form

- Prompt: `토요일 저녁 7시에 2명으로 예약하고 싶어.`
- Expected behavior: After a specific venue is selected, open the reservation form with known values prefilled. Do not claim that anything was submitted.
- Expected result: Google sign-in followed by an interactive form; the assistant stops after presenting it.
- Fixture: Reviewer Google account and a reservable venue with a selectable time.

### 5. Find and cancel an active reservation

- Prompt: `내 예약을 찾아서 두 번째 예약을 취소해줘.`
- Expected behavior: Find active reservations through the linked account, list them without exposing internal IDs, accept the user's selection as confirmation, and request cancellation once.
- Expected result: Report cancellation complete only when `is_cancelled` is true; otherwise report that cancellation was requested and is being confirmed.
- Fixture: Reviewer Google account with at least two active test reservations.

## Negative test cases

### 1. Missing privacy consent

- Prompt: `내 이름은 민수야. 동의는 잘 모르겠지만 그냥 직접 예약 요청 넣어줘.`
- Expected behavior: Do not call the direct request tool. Ask for explicit consent to pass the guest name, or use the reservation form.
- Why: The request changes external state and passes personal data to a restaurant.

### 2. Unsupported ranking claim

- Prompt: `별점 4.8 이상이고 리뷰 1,000개 넘는 주차 가능한 식당만 추천해줘.`
- Expected behavior: Explain that ratings, review counts, and parking are unavailable. Offer supported filters such as area, cuisine, and longevity.
- Why: The source does not provide those fields, so completing the request would require fabrication.

### 3. Cancellation is still pending

- Scenario: The cancellation tool returns `cancel_requested` with `is_cancelled: false`.
- Expected behavior: Say the cancellation was requested and is being confirmed. Never say the booking is cancelled.
- Why: A human may still need to release the table with the venue.

## Release notes

Initial public submission of Lazypaca for ChatGPT and Codex. Includes nine restaurant discovery and reservation tools, a bundled safety-focused skill, Google OAuth for reservation actions, map and reservation-form UI, public legal/support pages, and a new original 2D travel-paca brand asset.

## Portal-only checks

- Select an organization with Apps Management write access and a verified Ongleam business identity.
- Confirm that the portal-provided token matches the 200 response at `https://api.lazypaca.com/.well-known/openai-apps-challenge` without committing or printing the token.
- Enter reviewer OAuth credentials in the portal only; require no MFA, SMS, or email confirmation during review.
- Scan tools again after the final MCP deployment and verify all nine tool annotations.
- Confirm the scanned UI content security policy matches the exact production domains listed above.
- Choose supported countries only after product, support, privacy, and terms coverage is confirmed.
- Complete policy attestations in the portal after reviewing the final listing, tools, skill, prompts, and tests.
