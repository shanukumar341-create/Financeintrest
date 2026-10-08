# BullBear Hub v2 (React + Vite + Tailwind)

Trading & investment website. React, Tailwind CSS, no database. Python ki zaroorat nahi hai.

## Local me chalane ke steps
1. Node.js (LTS, 18+) install karein: https://nodejs.org
2. Terminal me project folder kholein (`bullbear-hub`) aur:
   ```
   npm install
   npm run dev
   ```
3. Browser me `http://localhost:5173` kholein.
   - Upar ticker me **● LIVE** dikhna chahiye (live prices dev server se hi aate hain, Netlify CLI ki zaroorat nahi).
   - Admin panel: `http://localhost:5173/admin` (password: `Admin@12345`, pehle badal lein).

## Pages
Home, About, Articles (+ har article ka apna page), Courses, Paid Calls, Live Classes, Portfolio, Contact, Admin.

## Admin se article likhna
1. `/admin` kholein, login karein, **articles** tab me "Naya article likhein".
2. Title, category, summary, (optional) cover image URL aur article Markdown me likhein. Preview button se dekh sakte hain.
3. "Website par publish karein" tick karein, phir **Save** dabayein.
   - Local (`npm run dev`): Save seedha `src/data/content.json` me likh deta hai, site turant update ho jati hai.
   - Live site: Save `content.json` download karta hai. Use `src/data/content.json` se replace karein aur redeploy karein.

Markdown: `## Heading`, `**bold**`, `*italic*`, `- list`, `1. list`, `> quote`, `[link](https://...)`, `![image](https://...)`.

## Netlify par deploy
Build command `npm run build`, publish directory `dist` (netlify.toml me pehle se set hai).
- **Git (best):** project GitHub par push karein, Netlify me Add new site, Import from Git. Functions (live data) aur Forms auto kaam karenge.
- **CLI:** `npx netlify-cli deploy --build --prod`
- Sirf `dist` folder drag-drop karne par live data functions deploy nahi hote, isliye Git ya CLI use karein.

## Domain connect
Netlify: Domain management, Add a domain. Registrar par Netlify ke nameservers set karein (ya A record `75.2.60.5` aur www CNAME `<site>.netlify.app`; Netlify ka panel confirm karein). Fir free HTTPS certificate provision karein.

## Structure
```
src/App.jsx          layout, ticker, routes
src/pages.jsx        saare public pages
src/Admin.jsx        admin panel + article editor
src/lib.jsx          live quotes, markdown renderer, helpers
src/data/content.json  SAARA editable content (articles bhi yahin)
netlify/functions/   quotes.mjs, news.mjs (live data)
vite.config.js       dev me /api aur /__save serve karta hai
```

## Honest limits
- Admin password browser me check hota hai, real security nahi. Secrets content.json me na rakhein.
- Live data free public sources se hai: delayed, kabhi band ya rate-limited ho sakta hai.
- US 20Y yield ka Yahoo symbol nahi hai, isliye 30Y (`^TYX`) use hua hai.
- SEBI: paid calls ya portfolio management ke liye aam taur par SEBI registration (RA/IA) chahiye. Launch se pehle check karein aur footer me registration number dikhayein.
