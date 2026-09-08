# Nova — AI product landing page

A marketing landing page for "Nova", a fictional AI workspace product.
Static HTML/CSS/JS frontend, with a real PHP + SQLite backend for the
signup form.

## Running

Requires Node and PHP (`php` on your PATH).

```bash
npm install
npm start
```

Then open http://localhost:3000. The Node server serves the static site
and transparently proxies `/api/*` requests to a PHP process it spawns,
so the signup form actually works — no separate command needed.

If you don't have Node available, you can run the whole `public/`
directory with PHP's built-in server instead:

```bash
php -S localhost:3000 -t public
```

## Structure

- `public/index.html` — page markup (hero, features, how-it-works, pricing, FAQ, CTA)
- `public/style.css` — styling and responsive layout
- `public/script.js` — mobile nav toggle, scroll-reveal animation, signup form submission
- `public/api/signup.php` — validates and stores signups in SQLite (`data/signups.sqlite`, gitignored)
- `server.js` — serves `public/` and proxies `/api/*` to a spawned PHP server
