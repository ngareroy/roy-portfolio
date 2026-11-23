# Roy Nyamiaka: portfolio, CV and rate card (GitHub Pages version)

This folder is a complete website. Put it in a GitHub repository and GitHub Pages hosts it for free. You then update it from a built-in editor at `/admin.html`, without touching code.

## What is inside

| Page | Link to share |
|---|---|
| Full profile | `https://YOUR-SITE/` |
| Interactive CV (with PDF) | `https://YOUR-SITE/cv/` |
| Rate card (KES, with quote builder) | `https://YOUR-SITE/rates/` |
| Quote request form | `https://YOUR-SITE/quote/` |
| Projects | `https://YOUR-SITE/projects/` |
| Editor (only you can save) | `https://YOUR-SITE/admin.html` |

Each share link has its own preview image for WhatsApp, LinkedIn, X and Facebook. The **Share** button on every page gives you the link, a QR code (also as a PNG download) and ready-made post text.

---

## 1. Put the site on GitHub (about 10 minutes, once)

1. Sign in at [github.com](https://github.com) (create a free account if needed).
2. Click **+ → New repository**.
   - Name it **`YOUR-USERNAME.github.io`** to get the address `https://YOUR-USERNAME.github.io/`
   - or give it any name, e.g. **`portfolio`**, to get `https://YOUR-USERNAME.github.io/portfolio/`
   - Set it to **Public**, tick **Add a README file**, then click **Create repository**.
3. In the new repository click **Add file → Upload files**. Open this unzipped folder on your computer, select **everything inside it** (all files and folders) and drag it onto the page. Click **Commit changes**.
   - `.nojekyll` is a hidden file. If your computer hides it, that is fine; the site still works.
4. Go to **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
5. Wait 1–2 minutes and refresh. GitHub shows **“Your site is live at …”**. Open it.

## 2. Turn on the quote form (2 minutes, once)

Quote requests are emailed to **royngare@gmail.com** through [FormSubmit](https://formsubmit.co) (free, no account).

1. Open your live site → **Get a quote**, and send yourself a test request.
2. FormSubmit emails you an **Activate Form** link. Click it. From then on every request lands in your inbox, with the visitor’s email set as reply-to.
   - FormSubmit is sometimes slow. If the form says **“Still sending…”** or **“not confirmed”**, wait and check your inbox and spam (search `from:formsubmit`) before trying again. The request usually still arrives.
3. Optional: after activating, FormSubmit gives you a random address that hides your real email. Paste it in **Editor → Settings → Send requests to this email**.

Prefer another service? In **Editor → Settings → Where quote requests go** you can switch to Web3Forms (free access key), Formspree, WhatsApp or the visitor’s email app. A **Send on WhatsApp instead** button is always on the form too.

## 3. Connect the editor (5 minutes, once)

1. Create a token: on GitHub open **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token** ([direct link](https://github.com/settings/personal-access-tokens/new)).
   - **Repository access:** *Only select repositories* → pick your portfolio repository.
   - **Permissions → Repository permissions → Contents:** *Read and write*. Nothing else.
   - Generate it and copy it (it starts with `github_pat_`).
2. Open `https://YOUR-SITE/admin.html` → **Save & publish**.
3. Enter your GitHub username, the repository name and branch `main`, paste the token, and click **Connect & check**.

The token stays in your browser only. It is never written into your site files. Untick “Remember on this device” on shared computers.

## 4. Update your site any time

1. Open `/admin.html`. Edit any section (profile, services, skills, projects, experience, education, rate card, testimonials, share texts, settings). The preview on the right updates as you type.
2. Upload a profile photo or project screenshots right in the editor. They are resized automatically.
3. Click **Save & publish** → **Save to GitHub** (or press **Ctrl + S**). Everything goes up in one commit, and the site updates in about a minute.

Your edits are kept in the browser until you save, so closing the tab by accident does not lose them.

**First thing to do:** in **Editor → Settings**, set **Your site address** (for example `https://YOUR-USERNAME.github.io/portfolio/`) and save. Share links, QR codes and social previews then use your real address.

## 5. Review before you share

- **Rate card:** the prices are starting points drafted from typical Kenyan market rates. Check every price and the “Good to know” terms (deposit, M-Pesa / bank transfer), and change anything that does not match how you work.
- **Social links:** add LinkedIn, GitHub, etc. in **Editor → Profile → Social links** (empty ones stay hidden).
- **Photo:** optional, in **Editor → Profile**.
- **Referees** are not published; the CV says “available on request”.

## 6. Use your own domain (optional)

1. In **Settings → Pages → Custom domain**, enter your domain (e.g. `roynyamiaka.co.ke`) and save.
2. At your domain registrar, add DNS records:
   - for the main domain: four **A** records pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - for `www`: a **CNAME** record pointing to `YOUR-USERNAME.github.io`
3. When the DNS check passes, tick **Enforce HTTPS**, and update **Your site address** in the editor.

## Files

```
index.html          the app (all pages)
admin.html          the editor
data/content.js     ALL your content: the editor saves here
assets/             styles, scripts, fonts, images, CV PDF, uploads
cv/ rates/ quote/ projects/   share links with their own preview images
404.html            friendly “not found” page
```

You can also edit `data/content.js` directly on GitHub (pencil icon). Keep it valid JSON; the editor’s **Raw JSON** section helps find mistakes.

## Code and design changes

This folder is built from the source project (`roy-portfolio-source`), which has the build scripts, tests and instructions for Claude Code. For changes the editor can't make, work there, then run `npm run export` to copy the new build into this repository (its local clone sits in the source folder as `site/`). Content edits made in the editor here are pulled back with `npm run sync-content`, so nothing is lost.

Font: Instrument Sans (SIL Open Font License, files in `assets/fonts`). QR codes: qrcode-generator by Kazuhiko Arase (MIT).
