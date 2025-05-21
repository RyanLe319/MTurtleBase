# MTurtleBase Color Style Guide (Based on Existing Usage)

This guide summarizes the color palette actually used in your CSS files for consistent, maintainable design.

---

## 1. Primary & Accent Colors

| Purpose          | Color        | Where Used / Notes                                  |
|------------------|-------------|-----------------------------------------------------|
| Signature Blue   | `#b0d2f7`   | Main accent: buttons, borders, highlights           |
| Blue Hover       | `#8fbde8`   | Button hover/active states                          |
| Deep Blue        | `#1976d2`   | Badges, links, important accents                    |
| Darker Blue      | `#1565c0`   | Button/link hover                                  |
| Light Blue Tint  | `rgba(176, 210, 247, 0.1)` / `0.2` | Button hover/active backgrounds         |

---

## 2. Neutrals & Backgrounds

| Purpose          | Color        | Where Used / Notes                                  |
|------------------|-------------|-----------------------------------------------------|
| Background Gray  | `#f0f0f0`   | Hover backgrounds, disabled, modal cancel           |
| Light Gray       | `#e0e0e0`   | Tags, borders, disabled, modals                     |
| Medium Gray      | `#ddd`      | Borders, form fields                               |
| Medium Gray 2    | `#ccc`      | Borders, form fields                               |
| Lighter Gray     | `#f5f5f5`   | Disabled button background                         |
| Off-White        | `#fafafa`   | General backgrounds                                |
| White            | `#fff`, `white` | Main backgrounds, popups, cards                |

---

## 3. Text & Icon Colors

| Purpose          | Color        | Where Used / Notes                                  |
|------------------|-------------|-----------------------------------------------------|
| Main Text        | `#333`      | Button, primary text, titles                        |
| Secondary Text   | `#555`      | Secondary text, icons                               |
| Tertiary Text    | `#666`      | Less prominent text, subtitles                      |
| Faded Text       | `#aaa`      | Disabled, muted                                    |
| Inverse Text     | `#fff`, `white` | On badges, blue backgrounds                    |

---

## 4. Status & Feedback

| Purpose          | Color        | Where Used / Notes                                  |
|------------------|-------------|-----------------------------------------------------|
| Success          | `#4caf50`   | Completed badge (status)                            |
| Warning          | `#ff9800`   | WatchList badge (status)                            |
| Error/Destructive| `#f44336`, `#ff4444`, `#d32f2f`, `#dc3545` | Error messages, delete, error badge  |
| Info             | `#007bff`   | Edit modal button hover                             |

---

## 5. Overlays, Shadows, & Effects

| Purpose          | Color        | Where Used / Notes                                  |
|------------------|-------------|-----------------------------------------------------|
| Popup Overlay    | `rgba(0,0,0,0.7)` | Popup background overlay                       |
| Modal Overlay    | `rgba(0,0,0,0.5)` | Modal overlay                                   |
| Card Shadow      | `rgba(176,210,247,0.1)`, `rgba(0,0,0,0.05)`, `rgba(0,0,0,0.1)` | Card, modal, header shadows |

---

## 6. Example CSS Variables

```css
:root {
  --color-signature-blue: #b0d2f7;
  --color-blue-hover: #8fbde8;
  --color-deep-blue: #1976d2;
  --color-darker-blue: #1565c0;
  --color-background-gray: #f0f0f0;
  --color-light-gray: #e0e0e0;
  --color-medium-gray: #ddd;
  --color-off-white: #fafafa;
  --color-white: #fff;
  --color-main-text: #333;
  --color-secondary-text: #555;
  --color-tertiary-text: #666;
  --color-faded-text: #aaa;
  --color-success: #4caf50;
  --color-warning: #ff9800;
  --color-error: #f44336;
  --color-error-alt: #ff4444;
  --color-info: #007bff;
}
```

---

## 7. Status Badge Colors (from mangaDetails.css)

- Ongoing: `#1976d2` (blue)
- Completed: `#4caf50` (green)
- WatchList: `#ff9800` (orange)
- Dropped: `#f44336` (red)

---

## 8. Red/Destructive/Warning Colors

- Used for errors, delete buttons, and error messages:
  - `#ff4444`
  - `#dc3545`
  - `#f44336`
  - `#d32f2f`

---

## 9. Accessibility

- Ensure text on colored backgrounds has sufficient contrast.
- Use white or near-black text on strong color backgrounds.

---

_This style guide is based on colors actually present in your project’s CSS files as of May 2025._