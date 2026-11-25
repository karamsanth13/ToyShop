# Toy Shop design system

This is the shared visual specification for all members. Load Nunito Sans once from the root framework layout. Use CSS custom properties as the only color source; components must not introduce feature-specific palettes, radius systems, spacing systems, fonts, icon families, or global overrides.

## Brand and color tokens

Brand character: playful, welcoming, colorful, trustworthy, polished, and uncluttered.

| Token | Light | Dark |
|---|---|---|
| `--background` | `#FFF9F1` | `#171A24` |
| `--surface` | `#FFFFFF` | `#222736` |
| `--text` | `#24283B` | `#F7F4EF` |
| `--text-muted` | `#697386` | `#B5BDCC` |
| `--brand` | `#FF6B6B` | `#FF8585` |
| `--blue` | `#4D96FF` | `#79AEFF` |
| `--yellow` | `#FFD166` | `#FFD166` |
| `--mint` | `#77C9A4` | `#77C9A4` |
| `--border` | `#F0E6DA` | `#343B4D` |
| `--success` | `#238A65` | `#52C99B` |
| `--danger` | `#D64545` | `#FF7777` |
| `--focus` | `#286AD6` | `#9DC4FF` |
| `--on-brand` | `#24283B` | `#24283B` |

Dark brand values are provisional; verify contrast for each foreground/background pairing during implementation. Do not place raw hex values in feature components.

## Type, shape, spacing

- Typeface: Nunito Sans throughout; sensible system sans-serif fallback.
- Card radius: 16px; large feature panels: 24px; controls: 10–12px.
- Spacing increments: 4px. Shared container max width: about 1200px.
- Gutters: 16px mobile; 24px tablet/desktop.
- Interactive targets: at least 44px where practical.
- Use consistent focus rings, hover/disabled states, form errors, skeletons, and empty states.
- Use Lucide icons. Emoji are not interface icons.

## Responsive and accessible behavior

Design mobile first; inspect 360, 390, 768, 1024, and 1440px widths. Preserve readable contrast and visible focus in both themes. Respect `prefers-reduced-motion`; avoid layout shifts and reserve image dimensions. Customer-facing floating controls must not obscure essential content.

## Shared components

The initial component set lives in `src/components/ui/`: Button, Input, Textarea, Select, Card, Badge, Dialog, Skeleton, EmptyState, PageContainer, and SectionHeading. Reuse these components instead of making feature-specific visual forks. Dialog uses the native modal element for Escape handling and focus containment/restoration.
