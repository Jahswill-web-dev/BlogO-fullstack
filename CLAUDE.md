# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
```

There is no test suite configured.

## Architecture

**BlogO** is a Next.js 16 (App Router) frontend for a content scheduling/generation SaaS product.

### Stack
- **Next.js 16** with App Router (`src/app/`)
- **React 19** + **TypeScript 5**
- **Tailwind CSS v4** (PostCSS-based, no `tailwind.config.js` — config lives in `globals.css`)
- **Framer Motion** for animations
- **React Query (`@tanstack/react-query`)** for server state; **Axios** for HTTP
- **React Hook Form** + **Zod** for form validation
- **Radix UI** + **Headless UI** for accessible primitives

### Directory layout

```
src/
├── app/                   # App Router pages & root layout
│   ├── layout.tsx         # Root layout; imports fonts, sets metadata
│   ├── page.tsx           # Landing page (renders LandingPage component)
│   ├── globals.css        # Tailwind v4 import + custom CSS theme variables (oklch)
│   ├── fonts.ts           # Geist, IBM Plex Serif, Kumbh Sans — exposed as CSS vars
│   └── [route]/page.tsx   # calendar, posts, pricing, signin, signup, startup
├── components/
│   ├── landingPage/       # Landing page shell + section sub-components
│   │   └── sections/      # hero, cta, footer, howItWorks, problemSection, whoItsForSection
│   ├── modules/           # Shared feature components (Navbar, PostCard, modals, WeeklyOverview)
│   └── ui/                # Design-system atoms: buttons, card, dialog, form, input, googleloginbutton
└── lib/
    └── utils.ts           # `cn()` helper (clsx + tailwind-merge)
```

### Key conventions

- **Path alias**: `@/*` → `src/*`
- **Client components** are marked with `"use client"` at the top; server components are the default.
- **Fonts**: Three fonts loaded in `fonts.ts` and applied via CSS utility classes (`.font-geist`, `.font-ibm-plex-serif`, `.font-kumbh-sans`) defined in `globals.css`.
- **Styling**: Use Tailwind utilities + the `cn()` helper from `@/lib/utils` for conditional class composition. Custom theme tokens are CSS variables in `globals.css`.
- **No global state library** — state is co-located in components with `useState`; server state goes through React Query.
- **Remote images**: Only `pbs.twimg.com` is allowed in `next.config.ts`; add new domains there if needed.

## Design System

All colors, gradients, fonts, and shadows below are the **only** ones used in this project. Never introduce new values — always pick from this reference.

### Fonts

Three fonts are loaded in `src/app/fonts.ts`, exposed as CSS vars, and applied via utility classes defined in `globals.css`.

| Class | CSS Var | Fallback | Where used |
|---|---|---|---|
| `.font-geist` | `--font-geist` | `system-ui, sans-serif` | Default UI text across the landing page |
| `.font-ibm-plex-serif` | `--font-ibm-plex-serif` | `serif` | Hero headings, problem section headings |
| `.font-kumbh-sans` | `--font-kumbh-sans` | `sans-serif` | Signup / auth pages |

---

### Brand Color Palette

These are custom hex values. Never substitute a Tailwind approximation.

| Token | Hex | Where used |
|---|---|---|
| Brand Purple | `#5C3FED` | Primary brand — gradient endpoints, buttons, CTA |
| Brand Dark | `#10060A` | Dark backgrounds, gradient endpoints |
| Brand Orange | `#E36A3A` | Gradient start (buttons, pricing highlight) |
| Brand Pink/Violet | `#B44BD6` | Gradient mid-stop |
| Near-Black BG | `#08060A` | How It Works section background |
| Footer Black | `#060507` | Footer background |
| Dark Blue BG | `#0B0F19` | Signup right panel, Navbar |
| Dark Blue BG Alt | `#0F1419` | Pricing page, GradientBorderButton inner fill, PricingCard |
| Surface Dark | `#171819` → `#212224` | Pricing card (non-highlighted) gradient |
| Border Dark | `#1F2933` | Pricing card / button borders |
| Light BG | `#F9F9F9` | Problem section, Who It's For section background |
| Light Purple Tint | `#E4DFFF` | Co-founder section gradient start |
| Pill BG | `#BABABA2E` | Pill component semi-transparent fill |
| Pill Border | `#88888AD9` | Pill component border |
| Pill Text | `#F9FAFB` | Pill component text |

---

### Gradients

#### Buttons
```
/* GradientButton — primary CTA (hero section, CTA section) */
bg-[linear-gradient(109.69deg,#E36A3A_11.2%,#B44BD6_49.66%,#5C3FED_88.12%)]

/* GradientBorderButton — outline gradient variant (Navbar) */
/* border layer */ bg-linear-to-r from-[#E36A3A] via-[#B44BD6] to-[#5C3FED]
/* inner fill   */ bg-[#0F1419] hover:bg-[#151B22]

/* Signup page submit button */
bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500
```

#### Section / Page Backgrounds
```
/* Hero section */
bg-linear-to-b from-[#5C3FED] to-[#10060A]

/* CTA section */
bg-linear-to-b from-[#10060A] via-[#10060A] to-[#5C3FED]

/* Co-founder section */
bg-[linear-gradient(180.54deg,#E4DFFF_0.47%,#F9F9F9_99.54%)]

/* Signup page — left decorative panel */
bg-gradient-to-t from-[#000000] to-[#5c3fed]

/* Signin page — left decorative panel */
bg-linear-to-br from-blue-500 to-purple-600
```

#### Grid Overlay Patterns
```
/* Problem / Who It's For sections (light BG) */
bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)]
bg-size-[40px_40px]

/* How It Works section (dark BG) */
bg-[linear-gradient(to_right,#BABABA1C_1px,transparent_1px),linear-gradient(to_bottom,#BABABA1C_1px,transparent_1px)]
bg-size-[40px_40px]
```

#### Text Gradients
```
/* Section headings — Problem, Who It's For */
bg-linear-to-r from-[#10060A] to-[#5C3FED] bg-clip-text text-transparent
```

#### Cards
```
/* Pricing card — highlighted/featured plan (header bar) */
bg-[linear-gradient(90deg,#5C3FED_0%,#5C3FED_35%,#B44BD6_65%,#E36A3A_100%)]

/* Pricing card — normal plan */
bg-linear-to-b from-[#171819] to-[#212224]

/* PostCard — Instagram platform indicator */
bg-gradient-to-br from-purple-600 to-pink-500

/* Signup page — decorative glow blob */
bg-gradient-to-br from-blue-400/30 to-purple-500/30
```

---

### OKLCH Theme Variables (`globals.css`)

These power Radix/shadcn primitives. Do not override them with raw hex.

| Variable | Light | Dark |
|---|---|---|
| `--background` | `oklch(1 0 0)` | `oklch(0.145 0 0)` |
| `--foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` |
| `--primary` | `oklch(0.205 0 0)` | `oklch(0.922 0 0)` |
| `--muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` |
| `--border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` |

---

### Platform & Status Colors (Calendar, PostCard)

Use these exact Tailwind class combinations — do not mix and match.

| Platform | Border | BG | Text | Dot |
|---|---|---|---|---|
| LinkedIn | `border-blue-600` | `bg-blue-50` | `text-blue-700` | `bg-blue-600` |
| Twitter/X | `border-sky-500` | `bg-sky-50` | `text-sky-700` | `bg-sky-500` |
| Instagram | `border-pink-500` | `bg-pink-50` | `text-pink-700` | `bg-pink-500` |
| Facebook | `border-blue-700` | `bg-blue-50` | `text-blue-700` | `bg-blue-700` |
| Default | `border-gray-400` | `bg-gray-50` | `text-gray-700` | `bg-gray-600` |

| Status | Classes |
|---|---|
| Draft | `bg-gray-100 text-gray-600` |
| Scheduled | `bg-blue-50 text-blue-600` |
| Posted | `bg-green-50 text-green-600` |

---

### Shadows

```
/* GradientButton default / hover */
shadow-[5px_5px_7.4px_0px_#1E103538]
hover:shadow-[7px_7px_10px_0px_#1E103560]

/* PricingButton default / hover */
shadow-[0_4px_12px_rgba(0,0,0,0.25)]
hover:shadow-[0_6px_16px_rgba(0,0,0,0.35)]
```

---

### Border Radius Variables

```css
--radius:    0.625rem                    /* 10px — base */
--radius-sm: calc(var(--radius) - 4px)  /* 6px */
--radius-md: calc(var(--radius) - 2px)  /* 8px */
--radius-lg: var(--radius)              /* 10px */
--radius-xl: calc(var(--radius) + 4px)  /* 14px */
```

## Rules
- Never introduce colors, gradients, fonts, or shadows not listed above
- Never approximate brand colors with Tailwind defaults (e.g. don't use `purple-600` where `#5C3FED` is correct)
- Always use the `cn()` helper from `@/lib/utils` for conditional classes
- Mark new components `"use client"` only when they use hooks or browser APIs