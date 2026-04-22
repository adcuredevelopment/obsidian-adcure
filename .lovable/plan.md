

## Remove Native Number Spinner Arrows

You spotted the small up/down arrows inside the "Top-up amount" input — those are the browser's default number spinner controls. They don't fit the dark Obsidian aesthetic.

### Approach

The cleanest fix is to **hide the native spinner globally via CSS**, so every `type="number"` input across the app (top-up modals on ad accounts, wallet, and any future ones) stays consistent. Quick increment/decrement is already covered by the quick-amount preset buttons (€100, €500, €1000, €5000), so removing the spinner doesn't take away functionality.

### Changes

**1. `src/styles.css`** — Add a small utility block at the bottom that strips the spinner in all browsers:

```css
/* Hide native number input spinners (Obsidian aesthetic) */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}
```

This handles:
- Chrome / Edge / Safari (WebKit pseudo-elements)
- Firefox (`-moz-appearance: textfield`)
- Standard `appearance: textfield` for forward compatibility

### What stays the same

- The amount input still accepts only numeric input (validation, min value, decimals all unchanged).
- Quick-amount preset buttons remain the primary way to bump values.
- Currency toggle (EUR / USD) is unaffected.
- No component logic changes — pure CSS, zero risk.

### Files touched

- `src/styles.css` (append ~10 lines)

