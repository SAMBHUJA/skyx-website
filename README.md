# SKYX Energy Website

A fully static, production-ready website for SKYX Energy — Solar without investment.

## 📁 File Structure

```
skyx-energy/
├── index.html          ← Main website (single page)
├── css/
│   └── style.css       ← All styles
├── js/
│   └── main.js         ← Nav, calculator, counters, form
├── _redirects          ← Netlify SPA redirect rule
├── netlify.toml        ← Netlify config (headers, cache)
└── README.md
```

---

## 🚀 Deploy Options

### Option A — Netlify (Recommended — free custom domain + SSL)

1. Go to [netlify.com](https://netlify.com) and sign up free
2. Click **"Add new site" → "Deploy manually"**
3. Drag the entire `skyx-energy/` folder onto the upload box
4. Site is live in seconds at a `*.netlify.app` URL
5. **Custom domain:** Site settings → Domain management → Add custom domain → enter `yourdomain.com`
6. Netlify gives free SSL automatically

**Or via Git (auto-deploy on push):**
```bash
git init
git add .
git commit -m "Initial SKYX Energy site"
# Push to GitHub, then connect repo in Netlify dashboard
```

---

### Option B — GitHub Pages (free)

1. Create a new GitHub repo named `skyx-energy` (or any name)
2. Push all files:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/skyx-energy.git
git push -u origin main
```
3. Go to repo **Settings → Pages → Source → Deploy from branch → main / root**
4. Site live at `https://YOUR_USERNAME.github.io/skyx-energy/`
5. **Custom domain:** Add `CNAME` file with your domain, then set DNS:
   - Type A → `185.199.108.153`
   - Type A → `185.199.109.153`
   - Type A → `185.199.110.153`
   - Type A → `185.199.111.153`

---

### Option C — Vercel (free)

```bash
npm i -g vercel
cd skyx-energy
vercel
```
Follow prompts. Custom domain in Vercel dashboard → Settings → Domains.

---

## 🌐 Custom Domain DNS (General)

Point your domain registrar (GoDaddy / Namecheap / Cloudflare) to:

| Provider  | Record Type | Value                        |
|-----------|-------------|------------------------------|
| Netlify   | CNAME       | `your-site.netlify.app`      |
| GitHub    | A (×4)      | `185.199.108–111.153`        |
| Vercel    | CNAME       | `cname.vercel-dns.com`       |

---

## 📧 Contact Form Integration

The form currently shows a success message after 1.2 s (simulated).
To make it actually send emails, replace the `handleSubmit` timeout in `js/main.js` with one of:

### Formspree (easiest — free tier)
```html
<!-- In index.html, change the form tag to: -->
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" class="contact-form">
```
Sign up at [formspree.io](https://formspree.io), create a form, copy the ID.

### EmailJS (no backend, free tier)
Add to `<head>`:
```html
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
```
Then in `main.js`, replace the setTimeout with:
```js
emailjs.sendForm('SERVICE_ID', 'TEMPLATE_ID', form, 'PUBLIC_KEY')
  .then(() => { form.style.display='none'; success.style.display='block'; });
```

---

## ✅ Features

- Responsive (mobile-first, 480 / 768 / 1024 breakpoints)
- Animated hero with solar ray burst effect
- Scroll-triggered counter animations
- Card reveal animations on scroll
- Interactive savings calculator (₹ estimates + CO₂ offset)
- Mobile hamburger nav with smooth drawer
- Active nav link highlighting on scroll
- Contact form with validation
- Netlify/GitHub Pages ready (zero build step — pure HTML/CSS/JS)
