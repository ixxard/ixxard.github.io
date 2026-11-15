# Sankrant's Tech Blog

Source of <https://sankrant.systems>, served by GitHub Pages from `ixxard/ixxard.github.io`. A personal site for multi-part series, standalone posts and short notes. You write Markdown; Hugo renders it to plain static HTML. GitHub Actions publishes it on every push.

- **Writing:** [WRITING.md](WRITING.md) has the cheat sheet. `make dev` serves a live preview with drafts, and `/posts/style-guide/` shows every element.
- **Making it yours:** the top of [hugo.toml](hugo.toml) holds your name, wordmark, bio, accent colour, links and default theme.

## First run

```sh
brew install hugo        # 0.170 or newer
make dev                 # http://localhost:1313
```

## Publish on GitHub Pages

1. Create a repository named `<your-username>.github.io` on GitHub. For any other name, the site is served at `/<repo>/` and the workflow handles that.
2. In that repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push this folder:

   ```sh
   git init -b main
   git add -A && git commit -m "site"
   git remote add origin git@github.com:<your-username>/<your-username>.github.io.git
   git push -u origin main
   ```

4. Every later push to `main` rebuilds and redeploys the site (about 30 s). See [.github/workflows/pages.yml](.github/workflows/pages.yml).

Update `repo` in `hugo.toml` so the "view on GitHub" links point at the right place. For a custom domain, put the domain in `static/CNAME` and set it under Settings → Pages.

## How it fits together

| path | what |
|---|---|
| `content/series/<name>/` | one folder per series: `_index.md` plus one folder per part |
| `content/posts/`, `content/notes/` | standalone posts, dated notes |
| `code/<series>/<part>/` | programs the posts show with `{{< src >}}`, browsable on GitHub |
| `layouts/` | templates. `_markup/` handles code blocks, headings, images, links and callouts; `_shortcodes/` holds `src` and `reg` |
| `assets/css/main.css` | the whole design: tokens at the top, both themes |
| `assets/js/main.js` | the only script: theme toggle, copy buttons, contents tracking, `[` `]` keys |
| `assets/og/base.png` | background for the generated share cards |

What a reader downloads: one HTML file per page, with CSS and JS inlined, no web fonts, no third-party requests and no trackers. About 8 KB gzipped for the home page.
