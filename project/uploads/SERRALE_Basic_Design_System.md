# SERRALE Basic Design System

**Product:** SERRALE Basic  
**Purpose:** Local service discovery for everyday needs  
**Version:** 1.0  
**Brand direction:** Trusted, local, clean, direct, warm, and professional.

---

## 1. Design Principle

SERRALE Basic should feel like a trusted local marketplace, not a complicated tech platform.

The design must communicate:

- **Trust** — users should feel safe contacting providers.
- **Clarity** — service discovery must be fast and simple.
- **Local relevance** — the design should feel grounded in Ethiopia and Addis Ababa.
- **Direct action** — phone call and WhatsApp contact should be visually clear.
- **Warm professionalism** — friendly, human, and polished.

SERRALE Basic is for everyday users who want to quickly find trusted service providers near them.

---

## 2. Brand Personality

| Attribute | Direction |
|---|---|
| Trustworthy | Verified providers, clean cards, calm green tones |
| Local | Addis Ababa-first, neighborhood-focused, direct contact |
| Simple | No heavy dashboard feeling, no unnecessary complexity |
| Warm | Cream backgrounds, soft shadows, rounded cards |
| Practical | Search, call, WhatsApp, request service |

Avoid designs that feel too futuristic, too corporate, childish, over-decorated, or visually noisy.

---

## 3. Color System

### Primary Colors

| Token | Color | HEX | Usage |
|---|---:|---|---|
| `--color-primary` | Deep Forest Green | `#064734` | Main brand color, headers, primary buttons |
| `--color-primary-dark` | Dark Green | `#033528` | Footer, top bar, strong contrast areas |
| `--color-primary-soft` | Soft Green | `#EAF8EF` | Basic cards, trust backgrounds, soft badges |
| `--color-primary-muted` | Sage Green | `#BFD8C8` | Borders, secondary highlights, icons |

### Neutral Colors

| Token | Color | HEX | Usage |
|---|---:|---|---|
| `--color-bg` | Warm Cream | `#FAF7EF` | Main page background |
| `--color-surface` | White Surface | `#FFFFFF` | Cards, navbar, inputs |
| `--color-surface-warm` | Soft Ivory | `#FFFDF7` | Section backgrounds |
| `--color-border` | Soft Green Border | `rgba(6, 71, 52, 0.12)` | Card borders, dividers |
| `--color-text` | Deep Green Text | `#102E25` | Main headings and body text |
| `--color-text-muted` | Muted Olive Gray | `#65756D` | Subtext, descriptions, helper text |

### Accent Colors

| Token | Color | HEX | Usage |
|---|---:|---|---|
| `--color-accent` | Warm Gold | `#F6B93B` | Request service CTA, important highlights |
| `--color-accent-soft` | Pale Gold | `#FFF4D8` | CTA strips, soft notification areas |
| `--color-success` | Verified Green | `#16875F` | Verified badges, available status |
| `--color-danger` | Alert Red | `#C8553D` | Error states only |

### SERRALE Basic Color Rule

SERRALE Basic should mainly use:

- Deep forest green
- Warm cream
- White cards
- Soft green surfaces
- Small gold highlights

Blue should be avoided in SERRALE Basic except when linking to SERRALE Plus.

---

## 4. Typography System

### Recommended Fonts

| Role | Font | Usage |
|---|---|---|
| Heading Font | `Fraunces` or `DM Serif Display` | Hero headings, section titles |
| Body Font | `Inter` | Paragraphs, cards, buttons, navigation |
| Ethiopic Support | `Noto Sans Ethiopic` | Amharic content and future localization |

### Font Stack

```css
--font-heading: "Fraunces", "DM Serif Display", Georgia, serif;
--font-body: "Inter", "Noto Sans Ethiopic", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

### Typography Scale

| Token | Size | Line Height | Weight | Usage |
|---|---:|---:|---:|---|
| `display-xl` | 64px | 1.02 | 700 | Hero heading |
| `display-lg` | 48px | 1.08 | 700 | Major section heading |
| `heading-xl` | 36px | 1.15 | 700 | Section titles |
| `heading-lg` | 28px | 1.2 | 700 | Card group headings |
| `heading-md` | 22px | 1.25 | 700 | Card titles |
| `body-lg` | 18px | 1.6 | 400 | Hero body |
| `body-md` | 16px | 1.55 | 400 | Main body text |
| `body-sm` | 14px | 1.5 | 400 | Card descriptions |
| `caption` | 12px | 1.4 | 600 | Labels, badges, helper text |

### Typography Rules

- Use the serif heading font only for important headings.
- Use the sans-serif font for everything functional: buttons, cards, search, navigation, badges, provider information.
- Keep headings dark green.
- Keep body text readable and not too light.
- Do not use more than two font families.

---

## 5. Spacing System

Use an 8px spacing system.

| Token | Value | Usage |
|---|---:|---|
| `space-1` | 4px | Small icon gaps |
| `space-2` | 8px | Badge padding, small gaps |
| `space-3` | 12px | Card internal gaps |
| `space-4` | 16px | Standard padding |
| `space-5` | 24px | Card padding |
| `space-6` | 32px | Section internal spacing |
| `space-7` | 48px | Between content groups |
| `space-8` | 64px | Section spacing |
| `space-9` | 96px | Major page sections |

### Layout Width

```css
--container-max: 1180px;
--container-padding: 24px;
```

Desktop sections should feel spacious. Mobile sections should stack cleanly with strong vertical rhythm.

---

## 6. Border Radius

| Token | Value | Usage |
|---|---:|---|
| `radius-sm` | 8px | Small badges, chips |
| `radius-md` | 12px | Inputs, small buttons |
| `radius-lg` | 18px | Service cards |
| `radius-xl` | 24px | Large cards and sections |
| `radius-2xl` | 32px | Hero image, major feature blocks |
| `radius-pill` | 999px | Pills, tags, badges |

SERRALE Basic should use soft rounded corners, not sharp enterprise-style corners.

---

## 7. Shadow System

| Token | Value | Usage |
|---|---|---|
| `shadow-sm` | `0 4px 14px rgba(6, 71, 52, 0.06)` | Small cards |
| `shadow-md` | `0 12px 30px rgba(6, 71, 52, 0.10)` | Provider cards |
| `shadow-lg` | `0 20px 50px rgba(6, 71, 52, 0.14)` | Hero image, major CTAs |

Shadows should be soft and natural. Avoid harsh black shadows.

---

## 8. Component System

## 8.1 Buttons

### Primary Button

Used for main actions such as Search, Call, Find Services, Get Listed.

```css
.button-primary {
  background: #064734;
  color: #ffffff;
  border-radius: 12px;
  font-weight: 700;
  padding: 12px 18px;
  box-shadow: 0 8px 20px rgba(6, 71, 52, 0.16);
}
```

### Gold CTA Button

Used for Request a Service.

```css
.button-accent {
  background: #F6B93B;
  color: #102E25;
  border-radius: 12px;
  font-weight: 700;
  padding: 12px 18px;
}
```

### Secondary Button

Used for View Profile, View All Providers, Explore links.

```css
.button-secondary {
  background: #ffffff;
  color: #064734;
  border: 1px solid rgba(6, 71, 52, 0.16);
  border-radius: 12px;
  font-weight: 700;
  padding: 11px 16px;
}
```

### Button Rules

- Primary actions must be dark green.
- Request-service actions may use gold.
- WhatsApp buttons can use green outline or soft green background.
- Avoid too many button colors on the same screen.

---

## 8.2 Cards

### Standard Card

Used for service categories, action cards, testimonials, and FAQ containers.

```css
.card {
  background: #ffffff;
  border: 1px solid rgba(6, 71, 52, 0.12);
  border-radius: 18px;
  box-shadow: 0 4px 14px rgba(6, 71, 52, 0.06);
}
```

### Provider Card

Provider cards should be scan-friendly and action-focused.

Required elements:

- Provider image
- Provider name
- Service type
- Rating
- Verified badge
- Short description
- Location
- Call button
- WhatsApp button
- View Profile link

Provider card style:

```css
.provider-card {
  background: #ffffff;
  border: 1px solid rgba(6, 71, 52, 0.12);
  border-radius: 22px;
  padding: 14px;
  box-shadow: 0 12px 30px rgba(6, 71, 52, 0.08);
}
```

### Service Category Card

Category cards should use strong imagery and simple labels.

Required elements:

- Service image
- Small icon badge
- Service name
- Number of providers

Keep them compact and visually consistent.

---

## 8.3 Badges and Chips

### Verified Badge

```css
.badge-verified {
  background: #EAF8EF;
  color: #16875F;
  border: 1px solid rgba(22, 135, 95, 0.18);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  padding: 5px 9px;
}
```

### Trust Chip

Used in the hero section for short trust signals.

Examples:

- Verified providers
- Admin reviewed
- Direct contact
- Phone & WhatsApp

Trust chips should be small, warm, and simple.

---

## 9. Page Section Rules

## 9.1 Hero Section

The hero must be the strongest SERRALE Basic section.

Required content:

- Badge: Trusted Local Services in Ethiopia
- Main headline: “Find trusted service providers near you.”
- Short supporting text
- Search input
- Area dropdown
- Search button
- Trust chips
- Large provider/workshop image
- Green overlay card: “Call or WhatsApp directly”

Hero layout:

- Desktop: two columns
- Mobile: stacked layout
- Image should have `object-fit: cover`
- Search should be visually dominant but not oversized

---

## 9.2 Quick Action Cards

Four cards:

- Find a Service
- Get Listed
- Hire Talent
- Find Work

Cards should be small, clear, and clickable.

Use icons, short descriptions, and arrow indicators.

---

## 9.3 Popular Services

Use a horizontal card grid on desktop.

Examples:

- Plumbers
- Electricians
- Cleaners
- Painters
- Carpenters
- Nannies

Each card should show:

- Image
- Icon badge
- Service name
- Provider count

---

## 9.4 Local Providers

This is one of the most important SERRALE Basic sections.

The layout should make users feel:

> “I can quickly find someone real and contact them.”

Design requirements:

- Section title on the left
- Provider grid on the right
- Verified badges
- Clear Call and WhatsApp buttons
- Short descriptions
- Location labels
- Ratings if available

---

## 9.5 How SERRALE Works

Use three clear steps:

1. Choose a service
2. Pick your provider
3. Call or WhatsApp

This section should be very simple and easy to understand.

---

## 9.6 Request Service CTA

Use a warm pale-gold strip.

Content:

- Heading: “Can’t find what you need?”
- Text: “Tell us what service you’re looking for and we’ll help you find the right provider.”
- Button: “Request a Service”

This CTA should feel helpful, not aggressive.

---

## 10. SERRALE Basic vs SERRALE Plus Placement

The “One SERRALE, two ways to use it” section should appear lower on the page.

SERRALE Basic must visually appear as the everyday local service option.

SERRALE Plus must visually appear as the advanced professional/company option.

Do not place this comparison directly under the hero.

---

## 11. Imagery Direction

SERRALE Basic imagery should feel:

- Real
- Local
- Human
- Warm
- Practical
- Service-focused

Recommended image subjects:

- Painters
- Plumbers
- Electricians
- Cleaners
- Nannies
- Carpenters
- Real homes and workshops
- Friendly provider portraits

Avoid:

- Overly AI-looking faces
- Luxury corporate stock photos
- Abstract AI graphics
- Random futuristic illustrations
- Images that do not show real service work

---

## 12. Icon Direction

Use simple line icons or soft filled icons.

Recommended icon style:

- Rounded line icons
- Consistent stroke width
- Green for Basic
- Gold for support/CTA
- Blue only when referring to SERRALE Plus

Icons should support clarity, not decorate randomly.

---

## 13. CSS Design Tokens

```css
:root {
  /* Brand */
  --color-primary: #064734;
  --color-primary-dark: #033528;
  --color-primary-soft: #EAF8EF;
  --color-primary-muted: #BFD8C8;

  /* Backgrounds */
  --color-bg: #FAF7EF;
  --color-surface: #FFFFFF;
  --color-surface-warm: #FFFDF7;

  /* Text */
  --color-text: #102E25;
  --color-text-muted: #65756D;

  /* Accents */
  --color-accent: #F6B93B;
  --color-accent-soft: #FFF4D8;
  --color-success: #16875F;
  --color-danger: #C8553D;

  /* Borders */
  --color-border: rgba(6, 71, 52, 0.12);
  --color-border-strong: rgba(6, 71, 52, 0.2);

  /* Fonts */
  --font-heading: "Fraunces", "DM Serif Display", Georgia, serif;
  --font-body: "Inter", "Noto Sans Ethiopic", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --radius-xl: 24px;
  --radius-2xl: 32px;
  --radius-pill: 999px;

  /* Shadows */
  --shadow-sm: 0 4px 14px rgba(6, 71, 52, 0.06);
  --shadow-md: 0 12px 30px rgba(6, 71, 52, 0.10);
  --shadow-lg: 0 20px 50px rgba(6, 71, 52, 0.14);

  /* Layout */
  --container-max: 1180px;
  --container-padding: 24px;
}
```

---

## 14. Tailwind Theme Reference

```js
colors: {
  serrale: {
    green: "#064734",
    dark: "#033528",
    soft: "#EAF8EF",
    sage: "#BFD8C8",
    cream: "#FAF7EF",
    ivory: "#FFFDF7",
    gold: "#F6B93B",
    goldSoft: "#FFF4D8",
    text: "#102E25",
    muted: "#65756D",
    success: "#16875F"
  }
},
fontFamily: {
  heading: ["Fraunces", "DM Serif Display", "Georgia", "serif"],
  body: ["Inter", "Noto Sans Ethiopic", "system-ui", "sans-serif"]
},
borderRadius: {
  card: "18px",
  section: "24px",
  hero: "32px"
},
boxShadow: {
  soft: "0 4px 14px rgba(6, 71, 52, 0.06)",
  card: "0 12px 30px rgba(6, 71, 52, 0.10)",
  hero: "0 20px 50px rgba(6, 71, 52, 0.14)"
}
```

---

## 15. Accessibility Rules

- Text must meet strong contrast against cream and green backgrounds.
- Buttons must be large enough to tap on mobile.
- Do not rely on color alone for status; use icons or text labels.
- Inputs must have visible focus states.
- Provider action buttons must be easy to identify.
- The search input should be reachable and usable by keyboard.

Recommended focus style:

```css
:focus-visible {
  outline: 3px solid rgba(246, 185, 59, 0.65);
  outline-offset: 3px;
}
```

---

## 16. Responsive Rules

### Desktop

- Max width: 1180px
- Hero: two-column layout
- Provider cards: 3–4 columns depending on space
- Category cards: 5–6 columns

### Tablet

- Hero can stay two columns if space allows
- Cards reduce to 2–3 columns
- Large feature sections stack more softly

### Mobile

- Hero stacks vertically
- Search input and dropdown stack
- Buttons become full width where needed
- Provider cards stack one column
- Section spacing becomes tighter
- Avoid horizontal scrolling

---

## 17. Do and Don’t

### Do

- Use dark green as the main trust color.
- Use cream backgrounds for warmth.
- Make phone and WhatsApp actions obvious.
- Keep sections clean and easy to scan.
- Use real service imagery.
- Make cards feel premium but not complex.

### Don’t

- Do not overuse blue in SERRALE Basic.
- Do not make the design look like generic SaaS only.
- Do not use childish icons.
- Do not use heavy gradients everywhere.
- Do not make cards too crowded.
- Do not hide the direct contact actions.
- Do not make local service discovery feel secondary.

---

## 18. Summary

SERRALE Basic should feel like a clean, trusted, Ethiopia-focused local service marketplace.

The design should help users quickly answer three questions:

1. What service do I need?
2. Which provider can I trust?
3. How do I contact them now?

Every design decision should support trust, speed, and direct connection.
