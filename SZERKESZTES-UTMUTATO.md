# Fix My Scoot – Szerkesztési útmutató

Ez az útmutató elmagyarázza, hogyan szerkesztheted az oldalt **kód nélkül, böngészőből**,
hol tudsz képeket feltölteni, és mi van még hátra az oldal befejezéséhez.

---

## 1. A vizuális szerkesztő (admin felület) megnyitása

Az oldalhoz tartozik egy böngészős tartalomkezelő, ahol kattintgatással szerkeszthetsz.

**Lépések (helyi szerkesztés, GitHub nélkül):**

1. Indítsd el a fejlesztői szervert. Nyiss egy terminált a `rollfix-website` mappában, és írd be:
   ```
   npm run dev
   ```
2. Nyisd meg **Chrome vagy Edge** böngészőben (fejlesztői módban a teljes cím kell):
   ```
   http://localhost:4322/admin/index.html
   ```
   (Miután az oldal élesben, tárhelyen lesz, ott egyszerűen `.../admin/` is elég.)
3. Kattints a **„Work with Local Repository"** gombra.
4. A megjelenő ablakban válaszd ki a **`rollfix-website`** mappát, és engedélyezd az írást.
5. Kész! Bal oldalon látod a szerkeszthető részeket: **Roller típusok** és **Főoldal**.

> A módosítások közvetlenül a fájlokba mentődnek. Ha fut a `npm run dev`, a
> weboldalt frissítve (`http://localhost:4322`) azonnal látod a változást.

---

## 2. Képek feltöltése

Minden kép a szerkesztőből tölthető fel (nem kell fájlokat másolgatni).

### Egy-egy szolgáltatáshoz külön kép
1. Admin → **Roller típusok** → válaszd ki a rollert (pl. *Kukirin G4*).
2. Görgets a **Szolgáltatások** listához, nyisd le a kívánt szolgáltatást.
3. A **„Kép ehhez a szolgáltatáshoz"** mezőnél tölts fel egy fotót.
4. Mentés (**Save**). Ez a kép fog megjelenni annál a szolgáltatásnál.

### Egy egész roller-típushoz közös kép
- Ugyanott a **„Modell borítókép"** mezőbe tölts fel egy képet. Ez jelenik meg
  minden olyan szolgáltatásnál, amelyiknek nincs saját képe.

### Főoldal (landing) képek
1. Admin → **Főoldal**.
2. **Hero kép**: a nyitó (fejléc) rész nagy képe. Ha üresen hagyod, a beépített roller-rajz látszik.
3. **Rólam – fotó**: a bemutatkozó szekció köríves fotója (pl. te vagy a műhely).

> A feltöltött képek a `public/images/uploads/` mappába kerülnek. Ajánlott
> méret: fotóknál kb. 1200 px széles, JPG. A logók helye külön van
> (`public/images/brands/`).

---

## 3. Szövegek átírása

### Böngészőből (a leggyakoribb szövegek)
- **Főoldal**: Admin → **Főoldal** – itt átírható a főcím, alcím, a „Rólam"
  bekezdések, a számláló sáv (200+, 100% stb.).
- **Szolgáltatások nevei, árai, leírásai**: Admin → **Roller típusok** → az adott roller.

### Kódfájlban (ritkábban változó dolgok)
Ezeket egyszerű szövegszerkesztővel (pl. VS Code) írhatod át:

| Mit szeretnél módosítani | Fájl |
|---|---|
| Cégnév, telefon, e-mail, cím, domain | `src/config/site.ts` |
| Nyitvatartás, zárva tartó napok | `src/config/openingHours.ts` |
| Szolgáltatás-típusok automatikus leírásai/időtartamai | `src/config/serviceCatalog.ts` |
| Kapcsolat oldal szövegei | `src/pages/kapcsolat.astro` |
| Impresszum | `src/pages/impresszum.astro` |
| Adatkezelési tájékoztató | `src/pages/adatkezelesi-tajekoztato.astro` |

---

## 4. Teendők az oldal befejezéséhez

**Kötelező az élesítés előtt:**

- [ ] **Foglalási űrlap bekapcsolása** – regisztrálj a [web3forms.com](https://web3forms.com)
      oldalon, és hozz létre egy `.env` fájlt a projekt gyökerében:
      `PUBLIC_WEB3FORMS_KEY=az_ide_kapott_kulcs`. (Enélkül a foglalás nem küld e-mailt.)
- [ ] **Működő e-mail cím** – a `src/config/site.ts`-ben az `email` legyen valós,
      és legyen hozzá tényleg elérhető postafiók.
- [ ] **Domain + tárhely** – a `fixmyscoot.hu` regisztrációja és az oldal kitétele
      az internetre (pl. Cloudflare Pages / Netlify – ebben segítek).
- [ ] **Adatkezelési tájékoztató jogi ellenőrzése** – nézze át egy szakértő élesítés előtt.
- [ ] **Impresszum** – a vállalkozói nyilvántartási szám kitöltése.

**Ajánlott (szebb, hitelesebb oldal):**

- [ ] **Valós fotók** feltöltése a szolgáltatásokhoz és a főoldalra (lásd 2. pont).
- [ ] **Pontos térkép** – GPS koordináták a `site.ts`-ben (`geo`), és Google Maps beágyazás.
- [ ] **Valós statisztikák** – a főoldali „200+ / 100%" számok cseréje.
- [ ] **Hivatalos márkalogók** – (már be vannak töltve; bármikor cserélhetők a
      `public/images/brands/` mappában).
- [ ] **Megosztási kép (OG image)** – `public/images/og-default.jpg`, ez jelenik meg,
      ha valaki megosztja az oldalt közösségi médiában.
- [ ] **Google Cégprofil** létrehozása (hogy megjelenj a Google keresésben/térképen).

---

## 5. Online (távoli) szerkesztés – később

A fenti szerkesztő most **helyben**, a saját gépeden működik. Ha azt szeretnéd,
hogy bárhonnan, telefonról is szerkeszthess (miután az oldal fent van az interneten),
akkor a `public/admin/config.yml`-ben a `repo:` sort át kell állítani a saját GitHub
tárolódra, és be kell állítani egy belépést. Ebben szívesen segítek, amikor ott tartunk.
