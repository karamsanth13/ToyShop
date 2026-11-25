# Design System

Use these shared tokens and components across the showroom and admin UI. Nunito Sans is the sole typeface. It is loaded once by the root layout through `next/font/google`; if offline builds are required, replace it centrally with an approved local font asset.

## Tokens

| Token | Light | Dark |
|---|---|---|
| Page | `#FFF9F1` | `#171A24` |
| Surface | `#FFFFFF` | `#222736` |
| Text | `#24283B` | `#F7F4EF` |
| Muted | `#697386` | `#B5BDCC` |
| Coral | `#FF6B6B` | `#FF8585` |
| Blue | `#4D96FF` | `#70AAFF` |
| Yellow | `#FFD166` | `#FFD166` |
| Mint | `#77C9A4` | `#77C9A4` |
| Border | `#F0E6DA` | `#343B4D` |
| Success | `#238A65` | `#55C497` |
| Danger | `#D64545` | `#FF7777` |

CSS custom properties in `src/app/globals.css` are authoritative; use token-backed utilities. Radius: controls 10–12px, cards 16px, feature panels 24px. Spacing follows 4px increments. Content max width 1200px; mobile gutter 16px, larger gutter 24px. Interactive controls target at least 44px. Focus rings, hover/disabled states, errors, loading and empty states must be visible and accessible. Use Lucide icons; never use emoji as interface icons. Respect reduced motion.

## Shared UI
`src/components/ui/` owns Button, Input, Textarea, Select, Card, Badge, Dialog, Skeleton, EmptyState, PageContainer and SectionHeading. Feature components compose these primitives and do not fork their visual rules.

## Responsive review widths
360px, 390px, 768px, 1024px and 1440px.
