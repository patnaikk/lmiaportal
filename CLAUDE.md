# LMIA Check Portal — Claude Instructions

## Design Rules

### Card Differentiation — Apple Style
**Never use left-border bands (`border-l-4`) to differentiate cards.** That is a GitHub/Notion pattern and looks out of place in this design system.

Instead, differentiate cards the Apple way:
- **Tinted background** — e.g. `bg-indigo-50`, `bg-amber-50`, `bg-green-50`
- **Icon in a rounded square** — e.g. `w-9 h-9 rounded-xl bg-indigo-100` with a coloured SVG inside
- Let the card speak through colour and iconography, not a border stripe

**Example (correct):**
```tsx
<div className="p-5 bg-indigo-50 rounded-2xl">
  <div className="flex items-start gap-3">
    <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
      <svg ... stroke="#4F46E5" />
    </div>
    <div>
      <p className="text-sm font-semibold text-indigo-900">Title</p>
      <p className="text-xs text-indigo-700">Body copy.</p>
    </div>
  </div>
</div>
```

**Example (wrong — never do this):**
```tsx
<div className="p-5 card-elevated border-l-4 border-l-indigo-300">
  ...
</div>
```
