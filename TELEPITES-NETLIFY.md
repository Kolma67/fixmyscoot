# Fix My Scoot – Kitétel az internetre (GitHub + Netlify + domain)

Ez az útmutató végigvezet, hogyan tedd ki az oldalt élesbe, ingyenesen.
A végén a `fixmyscoot.hu` címen lesz elérhető, a foglalások pedig egy
Netlify felületre érkeznek (ez az „adatbázisod"), és e-mailt is kapsz róluk.

---

## 1. lépés – Töltsd fel a projektet GitHubra

1. Készíts egy fiókot: [github.com](https://github.com) (ingyenes).
2. Hozz létre egy új, **üres** tárolót (repository): jobb fent **+ → New repository**.
   - Név: `fixmyscoot-website`
   - Legyen **Private** (privát), „Add README" **ne** legyen bepipálva.
   - Create repository.
3. A gépeden, a projekt mappájában (`D:\fixmyscoot-website`) egy terminálban futtasd
   (a GitHub is kiírja ezeket a „…or push an existing repository" résznél – a
   `URL` helyére a saját tárolód címe kerül):
   ```
   git add -A
   git commit -m "Elso feltoltes"
   git branch -M main
   git remote add origin https://github.com/FELHASZNALONEVED/fixmyscoot-website.git
   git push -u origin main
   ```
   (Bejelentkezés a böngészőben nyílik meg – engedélyezd.)

> Ha módosítasz valamit később (akár a CMS-ben), a változásokat így töltöd fel:
> `git add -A && git commit -m "modositas" && git push`

---

## 2. lépés – Kösd rá a Netlify-t

1. Készíts fiókot: [netlify.com](https://netlify.com) → **Sign up with GitHub** (a
   legegyszerűbb, mert így látja a tárolóidat).
2. **Add new site → Import an existing project → GitHub** → válaszd a
   `fixmyscoot-website` tárolót.
3. A build beállításokat a Netlify a `netlify.toml`-ból automatikusan felismeri
   (Build command: `npm run build`, Publish directory: `dist`). Csak **Deploy**.
4. Pár perc múlva kapsz egy ideiglenes címet, pl. `random-nev.netlify.app` – ez már él!

> Ezután minden GitHub-ra feltöltött módosítás **automatikusan** újra kiteszi az oldalt.

---

## 3. lépés – A foglalások (adatbázis + e-mail)

A foglalási űrlap **Netlify Forms**-ra van kötve, ezért külön beállítás alig kell:

- **Hol látod, kik foglaltak?** Netlify vezérlőpult → a site-od → **Forms** fül →
  „booking" űrlap. Itt lesz egy lista az összes foglalásról (név, telefon, roller,
  szolgáltatás, dátum, megjegyzés) – ez az „adatbázisod", akár exportálható is.
- **E-mail értesítés neked:** Netlify → Forms → **Settings & notifications** →
  „Form notifications" → **Add notification → Email notification** → add meg a saját
  e-mail címed. Mostantól minden új foglalásról kapsz egy e-mailt.
- **Az ügyfél is kapjon visszaigazolást e-mailben:** az űrlap után úgyis neked kell
  megerősítened a pontos időpontot (ezt jelzi is a visszajelző üzenet). A
  legegyszerűbb, ha a foglalásnál megadott e-mail címre válaszolsz a megerősítéssel.
  Ha teljesen automatikus visszaigazoló e-mailt szeretnél az ügyfélnek, azt is meg
  tudjuk oldani (Resend + egy kis Netlify Function) – szólj, és beállítom.

---

## 4. lépés – A saját domain (fixmyscoot.hu)

1. Regisztráld a `fixmyscoot.hu` domaint egy szolgáltatónál (pl. Rackhost, Nave,
   forpsi – magyar `.hu`-hoz magyar szolgáltató ajánlott).
2. Netlify → a site-od → **Domain management → Add a domain** → írd be:
   `fixmyscoot.hu` → Verify → Add.
3. A Netlify megmutatja, milyen **DNS rekordokat** kell beállítani a domain
   szolgáltatónál (általában egy `A` rekord a Netlify IP-jére és/vagy a `www`
   `CNAME`-je). Állítsd be őket a domain szolgáltató felületén.
4. A HTTPS (lakat) tanúsítványt a Netlify automatikusan, ingyen beállítja (Let's Encrypt).

---

## 5. lépés (opcionális) – Online szerkesztés telefonról is

Ha azt szeretnéd, hogy a gép bekapcsolása nélkül, bárhonnan (telefonról is)
szerkeszthess a `fixmyscoot.hu/admin/` címen:

1. A `public/admin/config.yml`-ben a `repo:` sort írd át a saját tárolódra:
   `repo: FELHASZNALONEVED/fixmyscoot-website`.
2. Kapcsold be a belépést: Netlify → **Integrations / Identity**, vagy a
   Sveltia CMS „Sign in with GitHub" gombja egy GitHub OAuth-appon keresztül.
   Ennek beállításában szívesen segítek, amikor idáig érsz.
