# BrundaSreedhar.github.io

My portfolio, live at <https://brundasreedhar.github.io>.

Plain HTML, CSS and JS. No build step, no dependencies, no framework:

| File | What's in it |
| --- | --- |
| `index.html` | All content, plus the sticker artwork as inline SVG symbols |
| `style.css` | Design tokens at the top (light theme, then dark), components below |
| `script.js` | Sticker dragging, coin fringe, weekend planner, theme toggle |
| `static/` | Photo and company logos |

## Run it locally

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which publishes the
repo root to GitHub Pages.

## Editing cheatsheet

- **Hero stickers**: the `.board` block in `index.html`. Each sticker carries
  `--x` and `--y` (position as a percent of the board), `--r` (rotation) and
  `--w` (width in px). Drag one in the browser, then copy the numbers back if
  you like where it landed.
- **Weekend plans**: the `plans` object at the top of `script.js`. Add lines to
  any of the three lists and the planner will use them.
- **Colors and fonts**: the `:root` token block at the top of `style.css`. Every
  dark-theme value is redefined twice below it, once for `prefers-color-scheme`
  and once for the manual toggle, so change all three.
- **Achievements**: each badge is one `<li>` in the `.badges` list. The medal
  text is the number; `--fs` sets its size so long values still fit.
