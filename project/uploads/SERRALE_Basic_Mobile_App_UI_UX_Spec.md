# SERRALE Basic Mobile App UI/UX Specification

**Product:** SERRALE Basic Mobile App  
**Platform:** React Native / Expo  
**Primary app:** Client app first  
**Market context:** Ethiopia, starting with Addis Ababa  
**Version:** 1.0  
**Document purpose:** Complete mobile UI/UX guide for building a simple, clean, high-utility SERRALE Basic app.

---

## 1. Product Direction

SERRALE Basic is a mobile-first local service discovery app.

The app helps people in Ethiopia quickly find trusted service providers near them and contact them directly by phone or WhatsApp.

The app must feel:

- Local
- Fast
- Clean
- Trusted
- Practical
- Not text-heavy
- Not like a complex SaaS dashboard
- Not like a social media app
- Not like a job-board-first app

The experience should answer three questions very fast:

1. What service do I need?
2. Who near me can do it?
3. How do I call or WhatsApp them now?

---

## 2. Core UX Rules

### 2.1 Guest-first browsing

Users must be able to browse providers without logging in.

Do not block these actions behind login:

- Open app
- Search services
- Browse categories
- View provider cards
- View provider profile
- Call provider
- WhatsApp provider

Login is only required for:

- Saving bookmarks
- Posting a service request
- Messaging inside SERRALE
- Managing user profile
- Viewing previous requests
- Reporting with identity attached

### 2.2 Direct contact is the main conversion

The most important actions are:

1. Call
2. WhatsApp
3. Bookmark
4. Request service

Every provider list card and provider detail page must make Call and WhatsApp very easy to find.

### 2.3 Compact provider browsing

The mobile app must fit many providers on the screen.

Avoid big cards.

Provider cards should be compact list rows, not large website-style cards.

Recommended provider row height:

- Minimum: 104px
- Ideal: 112px–128px
- Maximum: 140px

Each row should show only the most useful information:

- Photo
- Provider name
- Service
- Rating
- Verified/admin-reviewed badge
- Sub-city/location
- Short one-line description
- Call button
- WhatsApp button
- Bookmark icon

### 2.4 Ethiopia-first usability

Design for Ethiopian users and real local behavior:

- Phone numbers matter more than chat.
- WhatsApp is common and should be direct.
- Location should use Addis Ababa sub-cities and neighborhoods.
- Internet may be slow, so images must be optimized.
- Use simple English, with Amharic support planned.
- Do not require complex forms before showing value.
- Keep service requests short and easy.

### 2.5 Simple bottom navigation

Bottom navigation must stay simple:

1. Home
2. Categories
3. Post
4. Messages
5. Profile

Do not add more bottom tabs.

Bookmarks should not be a bottom tab. Bookmarks should be accessible from:

- Home header bookmark icon
- Profile screen row
- Provider card bookmark icon

---

## 3. Repo Alignment

The mobile project should follow the existing mobile app structure:

```text
Serrale-app/
  apps/
    client-app/
    provider-app/
  packages/
    ui/
    api/
    auth/
    database/
    utils/
    config/
```

Implementation should focus on `apps/client-app` first.

Use shared UI tokens and components from `packages/ui` where possible.

Do not introduce provider-dashboard concepts into the client app.

Do not build earnings, provider proposals, provider stats, or provider management inside SERRALE Basic Client.

---

## 4. Information Architecture

```text
App Launch
  Splash / Loading
  Permission-light onboarding
  Guest Home

Auth
  OTP Login
  OTP Verify
  Basic Profile Setup

Tabs
  Home
  Categories
  Post
  Messages
  Profile

Supporting Screens
  Search Results
  Category Detail
  Provider Detail
  Filter Bottom Sheet
  Bookmarks
  Request Service Flow
  Request Submitted
  Settings
  Language
  Help & Support
  Safety Tips
  Report Provider
  Notifications
  Empty States
  Loading States
```

---

## 5. Visual Design System for Mobile

## 5.1 Colors

Use SERRALE Basic colors.

```css
--green-900: #033528;
--green-800: #064734;
--green-700: #086246;
--green-100: #EAF8EF;

--cream-50: #FAF7EF;
--ivory-0: #FFFFFF;
--ivory-50: #FFFDF7;

--gold-500: #F6B93B;
--gold-100: #FFF4D8;

--text-main: #102E25;
--text-muted: #65756D;
--border-soft: rgba(6, 71, 52, 0.12);

--success: #16875F;
--danger: #C8553D;
```

### Usage

- Main background: `#FAF7EF`
- Cards: `#FFFFFF`
- Primary buttons: `#064734`
- Gold CTA: `#F6B93B`
- Trust badges: `#EAF8EF`
- Text: `#102E25`
- Muted text: `#65756D`

Blue should be avoided in SERRALE Basic, except for a small SERRALE Plus bridge if needed.

---

## 5.2 Fonts

Recommended mobile fonts:

```css
--font-heading: "Fraunces", "DM Serif Display", Georgia, serif;
--font-body: "Inter", "Noto Sans Ethiopic", system-ui, sans-serif;
```

For React Native / Expo:

- Use `Inter` for most UI.
- Use `Fraunces` or `DM Serif Display` only for large headings.
- Use `Noto Sans Ethiopic` for Amharic.

### Mobile type scale

| Element | Size | Weight | Usage |
|---|---:|---:|---|
| Screen title | 24–28 | 700 | Home greeting, main section title |
| Section title | 18–20 | 700 | Popular services, nearby providers |
| Card title | 15–16 | 700 | Provider name, category name |
| Body text | 13–14 | 400/500 | Descriptions |
| Caption | 11–12 | 500/600 | Location, badges, helper text |
| Button | 13–15 | 700 | Call, WhatsApp, Search |

Do not use tiny unreadable text below 11px.

---

## 5.3 Spacing

Mobile spacing must be intentional and compact.

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
```

### Screen padding

- Left/right padding: 16px
- Dense list padding: 12px
- Card internal padding: 10px–14px
- Between sections: 20px–28px
- Between provider cards: 10px–12px

---

## 5.4 Radius and Shadows

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
--radius-pill: 999px;
```

Mobile shadows should be soft.

```css
--shadow-card: 0 4px 14px rgba(6, 71, 52, 0.07);
--shadow-sheet: 0 -12px 30px rgba(6, 71, 52, 0.16);
```

Avoid heavy shadows on every item.

---

## 6. App Shell

## 6.1 Safe areas

All screens must respect:

- iOS notch
- Android status bar
- Bottom gesture area
- Keyboard overlap

Use safe area padding at the top and bottom.

---

## 6.2 Status bar

Use dark content on light screens.

For splash/loading or dark green screens, use light content.

---

## 6.3 Bottom Navigation

### Tabs

| Tab | Icon | Purpose |
|---|---|---|
| Home | `Home` | Discovery and recommended providers |
| Categories | `Grid3X3` or `LayoutGrid` | Browse all service categories |
| Post | `PlusCircle` | Request service / post need |
| Messages | `MessageCircle` | Client-provider messages |
| Profile | `User` | Account, settings, saved items |

### Layout

- Height: 68px–76px
- Background: white
- Top border: `rgba(6, 71, 52, 0.10)`
- Active color: deep green
- Inactive color: muted gray
- Center Post tab may be slightly emphasized but not oversized.
- Labels should always be visible.
- Do not use floating oversized nav.

### Active state

Active tab should show:

- Green icon
- Green label
- Optional soft green pill background

---

## 7. Screen 01 — Splash / Loading Screen

### Purpose

Give a calm branded loading moment while app checks session, fonts, and basic config.

### UI

- Full screen deep green background
- Center SERRALE logo mark
- App name: `SERRALE`
- Small text: `Trusted local services`
- Small loading indicator at bottom

### Layout

```text
[Deep green screen]

          SERRALE logo
          SERRALE
          Trusted local services

          Loading...
```

### Behavior

Load:

- Fonts
- Saved session
- User preference
- Location preference
- App config

Do not keep splash longer than needed.

If loading takes more than 3 seconds, show:

`Still preparing your local services...`

---

## 8. Screen 02 — First Open / Permission-Light Onboarding

### Purpose

Explain SERRALE quickly without blocking usage.

### Rule

Onboarding must be skippable.

### Screens

Use one simple screen, not a long carousel.

### UI

- Small illustration or service photo
- Heading: `Find trusted service providers near you`
- Subtext: `Browse local providers, compare trust signals, and call or WhatsApp directly.`
- Primary button: `Start Browsing`
- Secondary text button: `Log in with phone`

### Optional location prompt

Do not force GPS.

Ask:

`Choose your area to show nearby providers.`

Options:

- Addis Ababa
- Use my current location
- Choose later

Default should be Addis Ababa if the user skips.

---

## 9. Screen 03 — OTP Login

### Purpose

Allow simple phone-based login.

### Entry points

OTP login appears when user tries to:

- Bookmark a provider
- Post a request
- Open messages
- Open saved requests
- Manage profile

### Phone input screen

#### Header

- Back button top-left
- Title: `Log in with phone`
- Subtitle: `Use your Ethiopian phone number to continue.`

#### Form

Fields:

- Phone number input
- Default country code: `+251`
- Placeholder: `9 12 345 678`
- Helper: `We will send a verification code by SMS.`

#### Buttons

- Primary: `Send code`
- Secondary: `Continue as guest`

#### Validation

Accept:

- `09XXXXXXXX`
- `9XXXXXXXX`
- `+2519XXXXXXXX`

Normalize internally to:

`+2519XXXXXXXX`

#### Error messages

- `Enter a valid Ethiopian phone number.`
- `Code could not be sent. Try again.`
- `Too many attempts. Please wait before trying again.`

### OTP verify screen

#### UI

- Title: `Enter verification code`
- Subtitle: `We sent a 6-digit code to +251 9XX XXX XXX.`
- 6 input boxes
- Primary button: `Verify`
- Resend text: `Resend code in 45s`
- Edit phone text button: `Change number`

#### Behavior

- Auto-focus first OTP input
- Auto-advance between digits
- Paste full OTP support
- Submit automatically after 6 digits if possible
- Show loading state inside button

### New user quick profile

Only ask for:

- First name
- Preferred area

Do not ask many questions.

Button:

`Continue`

---

## 10. Screen 04 — Home

### Purpose

Fast discovery.

Home should be useful within 5 seconds.

### Top layout

```text
[Status bar]

[Location row]
SERRALE        Addis Ababa ▾      Bookmark icon

[Search bar]
What service do you need?

[Thin promo banner]
Need help finding a provider? Request service →
```

### Header details

Top row:

- Left: SERRALE logo
- Center/left: current area
- Right: Bookmark icon or notification icon

Do not use a huge hero on mobile.

### Search bar

- Height: 48px
- Full width
- Rounded 14px
- Search icon left
- Placeholder: `Search plumber, painter, nanny...`
- Filter icon button right

Tap behavior:

- Opens Search Results screen
- Keyboard focused

### Thin promo banner

Very thin banner, not a big card.

Height:

- 36px–44px

Content:

`Need help finding a provider?`

Button text:

`Request`

Style:

- Pale gold background
- Deep green text
- Small arrow

Do not make this a large marketing block.

### Home sections

Order:

1. Search
2. Thin promo banner
3. Quick category chips
4. Nearby providers
5. Popular categories
6. Verified providers
7. Past work preview
8. Safety/help mini card

### Quick category chips

Horizontal scroll.

Categories:

- Plumbers
- Electricians
- Cleaners
- Painters
- Nannies
- Carpenters
- Appliance Repair

Chip style:

- Icon
- Label
- Soft white/green surface
- Height: 36px–40px

### Nearby providers section

Header:

`Nearby providers`

Right action:

`View all`

Card type:

Compact provider row.

Show 6–10 providers quickly.

### Popular categories section

Use compact grid.

- 4 columns if icons only
- 2 columns if image cards

Preferred for mobile:

Icon grid for density.

### Past work preview

Small horizontal row:

- Thumbnail
- Project title
- Category
- Location
- Rating

Do not use large cards.

---

## 11. Screen 05 — Search Results

### Purpose

Show providers fast after search.

### Top bar

```text
[Back] Search results
[Search field: plumber]
[Area chip: Addis Ababa] [Filter]
```

### Results header

Show:

`24 plumbers near Addis Ababa`

Below it, chips:

- Verified
- Open now
- Near me
- Rating 4+
- WhatsApp

### Provider list

Use compact list rows.

Each row:

```text
[56x56 photo]  Abebe Painting           [bookmark]
              Painter · 4.8 ★ · Verified
              Lideta · Available today
              Interior painting, wall finishing...
              [Call] [WhatsApp]
```

### Button placement

- Call button first
- WhatsApp button second
- Both should be visible without opening detail
- Bookmark top-right
- View profile by tapping the card body

### Empty state

If no providers:

Title:

`No providers found yet`

Text:

`Try another area or request help and we will look for a provider.`

Buttons:

- `Change filters`
- `Request service`

---

## 12. Screen 06 — Categories

### Purpose

Let users browse services even when they do not know what to search.

### Top layout

```text
[Header]
Categories

[Search categories]
Search services

[Featured / common]
Plumbers Electricians Cleaners Painters

[All categories grid]
```

### Category layout

Use compact rows or icon grid.

Recommended:

- 2-column grid for main categories
- Small image/icon square
- Category name
- Provider count
- No long descriptions

### Category groups

#### Home & Repair

- Plumbers
- Electricians
- Painters
- Carpenters
- Appliance Repair
- Water Tank Cleaning
- Locksmiths
- Aluminum & Metal Work

#### Cleaning & Care

- Home Cleaners
- Office Cleaners
- Nannies
- Laundry
- Pest Control
- Gardeners

#### Moving & Delivery

- Movers
- Drivers
- Pickup Rental
- Furniture Moving

#### Events & Personal

- Photographers
- Decorators
- Makeup Artists
- Cooks/Catering
- Tailors

#### Digital & Office

Keep these available, but SERRALE Basic should still feel local-service-first:

- Designers
- Developers
- Marketing Support
- Data Entry
- Admin Support

### Category card

```text
[Icon] Plumbers
       1,200+ providers
```

Tap opens Category Detail / Provider Results.

---

## 13. Screen 07 — Category Detail

### Purpose

Show providers under one category with useful filters.

### Example

`Plumbers`

### Header

- Back
- Category name
- Provider count
- Filter button

### Subcategory chips

For Plumbers:

- Pipe leak
- Sink repair
- Water pressure
- Bathroom
- Emergency
- Installation

For Electricians:

- Switch repair
- Wiring
- Lighting
- Breaker
- Installation

For Cleaning:

- Home cleaning
- Office cleaning
- Move-in
- Deep cleaning

### Layout

After header:

1. Small category hero row, not large
2. Subcategory chips
3. Sort row
4. Provider list

Sort options:

- Recommended
- Rating
- Nearest
- Recently added

---

## 14. Screen 08 — Filter Bottom Sheet

### Purpose

Let users narrow provider results without leaving the screen.

### UX rule

Use a bottom sheet, not a full page.

### Sheet height

- Default: 70% screen height
- Can expand to 90%

### Header

```text
Filters                         Reset
```

### Filter groups

#### Location

- Addis Ababa
- Bole
- Yeka
- Kirkos
- Arada
- Lideta
- Gullele
- Kolfe Keranio
- Nifas Silk-Lafto
- Akaki Kality
- Lemi Kura

Use chips.

#### Availability

- Available today
- Open now
- This week

#### Trust

- Verified only
- Admin reviewed
- Has past work
- Has reviews

#### Rating

- 4.5+
- 4.0+
- Any rating

#### Contact

- Phone available
- WhatsApp available

#### Price level

Use simple labels, not exact pricing unless verified:

- Budget friendly
- Standard
- Premium

#### Experience

- 1+ years
- 3+ years
- 5+ years

### Bottom sticky actions

```text
[Clear]            [Show 24 providers]
```

Primary button must be full width or prominent.

---

## 15. Screen 09 — Provider Detail

### Purpose

Help the user decide whether to contact the provider.

### Layout priority

The user should see trust and contact actions immediately.

### Top

```text
[Back]                              [Bookmark]

[Provider photo/avatar]
Abebe Painting
Painter · Verified
4.8 ★ · 128 reviews
Lideta, Addis Ababa
```

### Sticky bottom action bar

Always visible at bottom:

```text
[Call] [WhatsApp]
```

Optional third small action:

`Message`

But Call and WhatsApp must be primary.

### Sections

Keep sections short.

#### 1. Quick facts

Small chips:

- Available today
- Admin reviewed
- 5 years experience
- Has past work
- WhatsApp available

#### 2. About

Maximum 2–3 lines visible.

Button:

`Read more`

#### 3. Services

Compact list:

- Interior painting
- Wall finishing
- Door painting
- Small repair

Each row can show estimated price level if available.

Do not show complicated pricing tables.

#### 4. Past Work

Horizontal thumbnails.

Each item:

- Image
- Title
- Location
- Rating or completion note

Example:

`Kitchen repaint in Bole`

#### 5. Reviews

Show 2 reviews first.

Button:

`View all reviews`

#### 6. Safety

Small card:

`Before starting work, agree on price, time, and scope clearly.`

Button:

`Report provider`

### Contact behavior

#### Call button

- Opens phone dialer
- Before first call, optional mini confirm sheet:

`Call Abebe Painting?`

Buttons:

- `Call now`
- `Cancel`

#### WhatsApp button

- Opens WhatsApp deep link
- Prefill message:

`Hello, I found your service on SERRALE. I need help with [service]. Are you available?`

---

## 16. Screen 10 — Bookmarks

### Purpose

Let users quickly return to saved providers.

### Access

- Home header bookmark icon
- Profile row: `Saved providers`

### Login behavior

If guest taps bookmark:

Show OTP login prompt:

`Log in to save providers`

Buttons:

- `Log in with phone`
- `Continue browsing`

### Logged-in layout

Header:

`Saved providers`

Content:

- Compact provider rows
- Sort by recent
- Empty state if none

Empty state:

`No saved providers yet`

Text:

`Tap the bookmark icon on any provider to save them here.`

Button:

`Browse providers`

---

## 17. Screen 11 — Post / Request Service

### Purpose

Let users ask SERRALE for help finding a provider.

This is not a heavy project posting form.

It should be a simple request flow.

### Entry points

- Bottom nav `Post`
- Thin promo banner
- Empty result state
- Home CTA

### Login

Posting requires OTP login.

If user is guest:

Show login prompt first.

### Form style

Use one screen with progressive sections, not too many pages.

### Required fields

1. Service needed
2. Area / location
3. Short description
4. Contact phone

### Optional fields

- When needed
- Budget range
- Add photo
- Preferred contact: Call / WhatsApp

### UI layout

```text
Post a request

What service do you need?
[Search/select category]

Where do you need it?
[Area dropdown]

Describe the work
[Short text box]

When do you need it?
[Today] [This week] [Flexible]

How should providers contact you?
[Call] [WhatsApp]

[Submit Request]
```

### Button

Primary:

`Submit Request`

Loading:

`Submitting...`

Success:

`Request sent`

### Confirmation screen

Title:

`We received your request`

Text:

`SERRALE will help match your request with relevant providers.`

Actions:

- `Browse providers`
- `View my requests`

---

## 18. Screen 12 — Messages

### Purpose

Provide a simple client-provider communication area.

### Current MVP

If messaging is not ready, use a clean placeholder.

### Layout

Header:

`Messages`

Tabs:

- All
- Providers
- Requests

Conversation row:

```text
[Avatar] Tekle Plumbing
         About: sink repair
         Last message preview...
         2:30 PM
```

### Empty state

`No messages yet`

Text:

`When you contact or request a provider, your conversations can appear here.`

Buttons:

- `Find providers`
- `Post request`

Do not show provider-side job/proposal language.

---

## 19. Screen 13 — Profile

### Purpose

Manage user identity, settings, saved providers, and support.

### Guest profile

If not logged in:

```text
[Avatar placeholder]
Continue with phone to save providers and manage requests.

[Log in with phone]
```

Still show:

- Help & Support
- Language
- Safety tips
- Get listed as provider

### Logged-in profile

Header:

```text
[Avatar]
Natnael
+251 9XX XXX XXX
Addis Ababa
```

Rows:

- My requests
- Saved providers
- Notifications
- Language
- Location preference
- Help & Support
- Safety tips
- Become a service provider
- Settings
- Log out

### Settings

Settings should include:

- Account information
- Phone number
- Language
- Default area
- Notification preferences
- Privacy
- Terms
- Delete account

---

## 20. Screen 14 — Language

### Purpose

Prepare app for English and Amharic users.

### Options

- English
- አማርኛ

### Rule

Use short natural Amharic labels.

Suggested Amharic labels:

| English | Amharic |
|---|---|
| Home | መነሻ |
| Categories | ምድቦች |
| Post | ጥያቄ |
| Messages | መልዕክቶች |
| Profile | መገለጫ |
| Find provider | ባለሙያ ፈልግ |
| Call | ይደውሉ |
| WhatsApp | WhatsApp |
| Request service | አገልግሎት ጠይቅ |

Do not use long formal translations that make the UI crowded.

---

## 21. Screen 15 — Help & Support

### Purpose

Give users confidence and support channels.

### Layout

Header:

`Help & Support`

Cards/rows:

- Call SERRALE support
- WhatsApp support
- Frequently asked questions
- Safety tips
- Report an issue
- Telegram community

Keep rows compact.

---

## 22. Loading States

### Global loading

Use small branded loading states.

Avoid blank white screens.

### Skeletons

Use skeletons for:

- Provider rows
- Category grid
- Provider detail
- Bookmarks
- Messages

### Provider row skeleton

```text
[gray circle] [line] [small line]
              [line]
              [button] [button]
```

### Loading copy

Use calm text:

- `Finding nearby providers...`
- `Loading services...`
- `Checking your account...`
- `Sending code...`

---

## 23. Empty States

Empty states should always give the next action.

### No search results

Title:

`No providers found`

Text:

`Try changing your area or request help from SERRALE.`

Actions:

- `Change filters`
- `Request service`

### No bookmarks

Title:

`No saved providers yet`

Text:

`Save providers you may want to contact later.`

Action:

`Browse providers`

### No messages

Title:

`No messages yet`

Text:

`Messages from providers will appear here.`

Action:

`Find providers`

### No requests

Title:

`No requests yet`

Text:

`Post a request and SERRALE can help you find providers.`

Action:

`Post request`

---

## 24. Error States

Errors must be simple and human.

### Network error

`Connection problem`

`Check your internet and try again.`

Button:

`Try again`

### OTP error

`Incorrect code`

`Check the SMS code and try again.`

### API error

`Something went wrong`

`Please try again in a moment.`

### Provider unavailable

`Provider is not available`

`Try another provider or request help.`

---

## 25. Offline / Low Data UX

### Low-data rules

- Lazy-load provider images
- Use small thumbnails
- Cache categories
- Cache recent providers
- Keep provider list usable even if images are loading
- Do not autoplay video
- Do not use heavy animations

### Offline screen

If no connection:

Title:

`You are offline`

Text:

`Some saved providers may still be visible. Connect to the internet to search again.`

Actions:

- `Retry`
- `View saved providers`

---

## 26. Provider Compact Card Specification

This is the most important component.

### Component name

`ProviderCompactCard`

### Size

- Width: full screen minus 32px padding
- Height: 112px–128px
- Border radius: 16px
- Padding: 10px–12px

### Anatomy

```text
------------------------------------------------
| Photo | Name                 Verified  Save  |
|       | Service · Rating                    |
|       | Area · Available today              |
|       | Short description one line...        |
|       | [Call] [WhatsApp]                   |
------------------------------------------------
```

### Photo

- 56x56 or 64x64
- Rounded 12px
- Object fit cover
- Fallback initials if no image

### Text rules

- Provider name: 1 line
- Description: 1 line only
- Location: 1 line only
- Do not allow long text to expand the card

### Actions

Call button:

- Filled green
- Icon + label
- Left of WhatsApp

WhatsApp button:

- Soft green or outline
- Icon + label

Bookmark:

- Top-right icon button
- 32x32 tap target

### Trust badges

Use short labels:

- Verified
- Admin reviewed
- Has past work

Do not show all badges at once on the row. Show one primary badge only.

---

## 27. Category Card Specification

### Compact icon category

Use for Home and Categories screen.

```text
[Icon]
Plumbers
1,200+
```

### Size

- 76px–88px wide
- 80px–96px high
- 2 or 4 column grid depending screen
- Rounded 16px
- White background
- Soft border

### Icon style

Use line icons, not emojis.

Icon names can map to Lucide icons:

| Category | Icon |
|---|---|
| Plumbers | Wrench |
| Electricians | Zap |
| Cleaners | Sparkles |
| Painters | PaintRoller |
| Carpenters | Hammer |
| Nannies | HeartHandshake |
| Movers | Truck |
| Appliance Repair | Settings |
| Photographers | Camera |
| Cooks/Catering | CookingPot |
| Tailors | Scissors |
| Developers | Code |
| Designers | PenTool |
| Marketing | Megaphone |

---

## 28. Thin Promo Banner

### Purpose

Small helpful CTA without stealing space.

### Component name

`ThinPromoBanner`

### Height

36px–44px

### Style

- Pale gold background
- Rounded 14px
- Small icon
- Short text
- Small action text

### Copy options

1. `Need help finding a provider? Request`
2. `Can’t find it? SERRALE can help`
3. `Post your request and we’ll guide you`

### Placement

Home only, below search.

Do not show it repeatedly on every screen.

---

## 29. Request Service Flow Details

### UX principle

This should feel like asking for help, not filling a long form.

### Step style

Use one page with collapsible sections or a short 3-step flow.

Best option for MVP:

One screen with simple inputs.

### Field guidance

#### Service field

Use searchable category picker.

Placeholder:

`e.g. plumber, cleaner, painter`

#### Area field

Use area picker.

Default:

`Addis Ababa`

#### Description field

Keep it short.

Placeholder:

`Example: I need help fixing a leaking sink.`

Limit:

300 characters

#### Budget

Use optional chips:

- Not sure
- Under 1,000 ETB
- 1,000–3,000 ETB
- 3,000–7,000 ETB
- 7,000+ ETB

Do not force budget.

#### Contact preference

Use segmented control:

- Call
- WhatsApp
- Both

Default:

Both

---

## 30. Sample Data

Use this mock data under:

```text
apps/client-app/src/data/
  categories.ts
  providers.ts
  areas.ts
  reviews.ts
  pastWork.ts
```

### Areas

```ts
export const addisAbabaAreas = [
  "All Addis Ababa",
  "Bole",
  "Yeka",
  "Kirkos",
  "Arada",
  "Lideta",
  "Gullele",
  "Kolfe Keranio",
  "Nifas Silk-Lafto",
  "Akaki Kality",
  "Lemi Kura",
];
```

### Categories

```ts
export const categories = [
  {
    id: "plumbers",
    name: "Plumbers",
    amharicName: "ቧንቧ ሰራተኞች",
    icon: "Wrench",
    providerCount: 1200,
    group: "Home & Repair",
    image: "plumber.jpg",
  },
  {
    id: "electricians",
    name: "Electricians",
    amharicName: "ኤሌክትሪሻኖች",
    icon: "Zap",
    providerCount: 950,
    group: "Home & Repair",
    image: "electrician.jpg",
  },
  {
    id: "cleaners",
    name: "Cleaners",
    amharicName: "ጽዳት",
    icon: "Sparkles",
    providerCount: 1150,
    group: "Cleaning & Care",
    image: "cleaner.jpg",
  },
  {
    id: "painters",
    name: "Painters",
    amharicName: "ቀለም ቀቢዎች",
    icon: "PaintRoller",
    providerCount: 780,
    group: "Home & Repair",
    image: "painter.jpg",
  },
  {
    id: "carpenters",
    name: "Carpenters",
    amharicName: "እንጨት ሰራተኞች",
    icon: "Hammer",
    providerCount: 650,
    group: "Home & Repair",
    image: "carpenter.jpg",
  },
  {
    id: "nannies",
    name: "Nannies",
    amharicName: "ህፃን ተንከባካቢ",
    icon: "HeartHandshake",
    providerCount: 900,
    group: "Cleaning & Care",
    image: "nanny.jpg",
  },
];
```

### Providers

```ts
export const providers = [
  {
    id: "abebe-painting",
    name: "Abebe Painting",
    service: "Painter",
    categoryId: "painters",
    rating: 4.8,
    reviewCount: 128,
    area: "Lideta",
    city: "Addis Ababa",
    verified: true,
    adminReviewed: true,
    availableToday: true,
    hasPastWork: true,
    description: "Interior painting, wall finishing, and small repairs.",
    phone: "+251911234567",
    whatsapp: "+251911234567",
    image: "provider-abebe.jpg",
  },
  {
    id: "tekle-plumbing",
    name: "Tekle Plumbing",
    service: "Plumber",
    categoryId: "plumbers",
    rating: 4.9,
    reviewCount: 256,
    area: "Bole",
    city: "Addis Ababa",
    verified: true,
    adminReviewed: true,
    availableToday: true,
    hasPastWork: true,
    description: "Pipe leaks, sink repair, and water pressure solutions.",
    phone: "+251922345678",
    whatsapp: "+251922345678",
    image: "provider-tekle.jpg",
  },
  {
    id: "amanuel-electric",
    name: "Amanuel Electric",
    service: "Electrician",
    categoryId: "electricians",
    rating: 4.8,
    reviewCount: 173,
    area: "Nifas Silk-Lafto",
    city: "Addis Ababa",
    verified: true,
    adminReviewed: true,
    availableToday: false,
    hasPastWork: true,
    description: "Switch repair, wiring, lighting, and installation.",
    phone: "+251933456789",
    whatsapp: "+251933456789",
    image: "provider-amanuel.jpg",
  },
  {
    id: "bethel-cleaning",
    name: "Bethel Cleaning",
    service: "Cleaner",
    categoryId: "cleaners",
    rating: 4.7,
    reviewCount: 146,
    area: "Yeka",
    city: "Addis Ababa",
    verified: true,
    adminReviewed: true,
    availableToday: true,
    hasPastWork: false,
    description: "Home, office, deep cleaning, and regular support.",
    phone: "+251944567890",
    whatsapp: "+251944567890",
    image: "provider-bethel.jpg",
  },
];
```

### Reviews

```ts
export const reviews = [
  {
    id: "review-1",
    providerId: "tekle-plumbing",
    userName: "Marta",
    area: "Bole",
    rating: 5,
    text: "I found him quickly and the sink repair was done the same day.",
  },
  {
    id: "review-2",
    providerId: "abebe-painting",
    userName: "Daniel",
    area: "Lideta",
    rating: 5,
    text: "Clean finishing and professional communication.",
  },
];
```

### Past Work

```ts
export const pastWork = [
  {
    id: "past-1",
    providerId: "abebe-painting",
    title: "Kitchen repaint in Bole",
    category: "Painting",
    area: "Bole",
    image: "past-kitchen-repaint.jpg",
    note: "Completed in 2 days with clean finishing.",
  },
  {
    id: "past-2",
    providerId: "tekle-plumbing",
    title: "Bathroom leak repair",
    category: "Plumbing",
    area: "Yeka",
    image: "past-bathroom-repair.jpg",
    note: "Fixed pipe leak and water pressure issue.",
  },
];
```

---

## 31. Image Direction

Images should look real and Ethiopian-contextual.

### Provider images

Use:

- Real worker portraits
- Service work in progress
- Clean background
- Natural lighting
- Not overly polished corporate stock images

### Category images

Use:

- Hands-on service scenes
- Tools
- Real home/work environments
- Addis Ababa-friendly context where possible

### Image rules

- Use compressed images
- Use thumbnails in lists
- Use larger images only on provider detail
- Always use fallback initials or icon
- Avoid AI-looking faces

---

## 32. Component Inventory

### Navigation

- `ClientBottomTabBar`
- `ScreenHeader`
- `BackHeader`
- `LocationSelector`
- `SafeScreen`

### Auth

- `OtpPhoneForm`
- `OtpCodeInput`
- `AuthPromptSheet`
- `QuickProfileForm`

### Discovery

- `HomeSearchBar`
- `SearchFilterBar`
- `ThinPromoBanner`
- `CategoryChip`
- `CategoryIconCard`
- `ProviderCompactCard`
- `ProviderList`
- `FilterBottomSheet`

### Provider

- `ProviderHero`
- `ProviderTrustChips`
- `ProviderServicesList`
- `PastWorkStrip`
- `ReviewPreview`
- `StickyContactBar`
- `ContactConfirmSheet`

### Requests

- `RequestServiceForm`
- `CategoryPicker`
- `AreaPicker`
- `BudgetChips`
- `ContactPreferenceControl`
- `RequestSuccessState`

### System states

- `ProviderCardSkeleton`
- `CategoryGridSkeleton`
- `EmptyState`
- `ErrorState`
- `OfflineNotice`

---

## 33. Navigation Routes

Suggested Expo Router structure:

```text
apps/client-app/app/
  _layout.tsx
  index.tsx
  auth/
    login.tsx
    verify.tsx
    profile-setup.tsx
  tabs/
    _layout.tsx
    home.tsx
    categories.tsx
    post.tsx
    messages.tsx
    profile.tsx
  search/
    index.tsx
  categories/
    [categoryId].tsx
  providers/
    [providerId].tsx
  bookmarks.tsx
  settings.tsx
  language.tsx
  help.tsx
  safety.tsx
```

---

## 34. Build Phases

### Phase 1 — Theme and tokens

Implement or align:

- Colors
- Spacing
- Radius
- Typography
- Shadows
- Shared button styles
- Shared card styles

### Phase 2 — App shell

Build:

- Safe screen wrapper
- Bottom nav
- Header components
- Loading/splash handling

### Phase 3 — Auth

Build:

- OTP phone screen
- OTP verify screen
- Auth prompt sheet
- Quick profile setup

### Phase 4 — Home

Build:

- Location row
- Search
- Thin promo banner
- Category chips
- Provider compact list
- Past work preview

### Phase 5 — Categories and filters

Build:

- Categories screen
- Category detail
- Filter bottom sheet
- Results list

### Phase 6 — Provider detail

Build:

- Provider detail screen
- Sticky Call / WhatsApp bar
- Past work
- Reviews
- Report provider

### Phase 7 — Request service

Build:

- Post/request form
- Category picker
- Area picker
- Request success screen

### Phase 8 — Bookmarks, messages, profile

Build:

- Bookmarks screen
- Messages shell
- Profile/settings
- Language screen
- Help/support

### Phase 9 — Polish

Add:

- Skeletons
- Empty states
- Error states
- Offline states
- Performance optimization
- Accessibility checks

---

## 35. Accessibility Requirements

- Every button must have a clear label.
- Call and WhatsApp buttons must be easy to tap.
- Minimum touch target: 44x44.
- Text must have strong contrast.
- Inputs must have visible focus states.
- Do not rely only on color for verified status; use text.
- Screen reader labels should be set for icons.
- Use plain language.

Example labels:

```text
Call Tekle Plumbing
Message Tekle Plumbing on WhatsApp
Save Abebe Painting
Filter providers
Change location
```

---

## 36. Microcopy

### Search

- `What service do you need?`
- `Search plumber, painter, nanny...`

### Location

- `Choose area`
- `All Addis Ababa`
- `Near me`

### Provider actions

- `Call`
- `WhatsApp`
- `View profile`
- `Save`

### Trust

- `Verified`
- `Admin reviewed`
- `Has past work`
- `Available today`

### Request

- `Tell us what you need`
- `Submit request`
- `Request sent`

### Safety

- `Agree on price, time, and work scope before starting.`

---

## 37. Do and Do Not

### Do

- Keep browsing fast.
- Show many providers without clutter.
- Make Call and WhatsApp visible.
- Use compact rows.
- Use local Addis Ababa areas.
- Keep login optional until needed.
- Use clean icons.
- Use real service images.
- Keep text short inside the app.

### Do not

- Do not use huge provider cards.
- Do not make users log in before browsing.
- Do not hide Call and WhatsApp inside menus.
- Do not put provider dashboard features in the client app.
- Do not add extra bottom nav tabs.
- Do not use fake complex metrics.
- Do not make request service a long form.
- Do not overuse big promotional banners.
- Do not make the UI text-heavy.

---

## 38. Final UX Summary

SERRALE Basic mobile should feel like:

A clean, trusted local service directory in your pocket.

The user opens the app, searches a service, sees nearby providers, checks trust signals, and calls or WhatsApps immediately.

The app should not compete with SERRALE Plus or provider dashboards. It should focus on simple local discovery, direct contact, saved providers, request help, and basic account settings.

The strongest mobile experience is:

```text
Open app → Search service → Filter by area → See compact providers → Call or WhatsApp
```

Everything else should support that path.
