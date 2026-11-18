# MG Captures – Brand Identity & Design System

> **Forrás:** `subdomains/photography/styles.css` (`:root` tokenek + komponens-szabályok) és a `hu/`, `sk/`, `en/` HTML-oldalak.
> **Hatókör:** weboldal, plakát, szórólap, Instagram poszt / sztori, Facebook-borító, árlap.
> **Egy fájlban, AI-agenteknek is:** [`mg-captures-brand.html`](mg-captures-brand.html) – minden szabály, színtoken, betű, komponens és a logó, gépi JSON-blokkokkal (`#brand-tokens`, `#brand-rules`).
> Az **„ÚJ”** jelölésű értékek nem szerepelnek a CSS-ben; nyomdai és világos hátterű felhasználásra vezettem be őket, a meglévő palettából származtatva.

---

## 1. Brand Essence

**Egy mondatban:** *Természetes pillanatok, letisztult keretben.*

Az MG Captures arculata **a fotót szolgálja**. Minden más – szín, betű, keret – csendes háttér, hogy a kép beszéljen.

| A fotó | A keret |
|---|---|
| Valódi, megrendezetlen pillanatok: koncert, ballagás, portré | Éles sarkok, vékony vonalak, sok levegő |
| *Instrument Serif* dőlt címek – személyes, elegáns hang | Inter szövegek, JetBrains Mono nagybetűs gombok és címkék – mint a weboldalon |
| Mély, sötét háttér, amin a kép „világít” | Egyetlen kék akcentus, visszafogottan |

**Személyiség:** nyugodt · elegáns · hiteles · személyes · magabiztos, de nem harsány.
**Nem vagyunk:** játékosak, pasztellek, lekerekítettek, gradiensesek, túldíszítettek. Kamera-kijelző effekteket (sarokjelölők, célkereszt, „REC”) nem használunk.

### A „Sharp Corners” szabály

> **Minden sarok 0 px. Kivételesen 2 px. Más érték nincs.**

| Elem | Sugár | Megjegyzés |
|---|---|---|
| Gombok, kártyák, címkék, képkeretek, plakát-elemek | **0 px** | alapértelmezés; a CSS-ben 44 helyen `border-radius: 0` |
| Űrlapmezők (`.form-control`) | **2 px** | 12 helyen `2px` – a kitölthető mezők élét kicsit tompítja |
| Állapotpötty (`.pulse-dot`), ikon-gomb kör (`.social-links a`) | 50 % | **egyetlen** kivétel: a kör itt jelentést hordoz, nem díszítés |

**Javítandó eltérések a jelenlegi CSS-ben:**
`.hero-image-col` (`styles.css:1478`), `.sidebar-link` (`:2446`), `.img-container` (`:2704`) → `4px` helyett **`0`** vagy `2px`; a görgetősáv (`:270–274`) `3px` → `0`.

---

## 2. Színpaletta (Color Tokens)

### 2.1 Fekete és sötét felületek

| Token | CSS változó | HEX | RGB | HSL | Szerep |
|---|---|---|---|---|---|
| **Void** | `--color-neutral-950` / `--surface-container-lowest` | `#0A0A0A` | 10, 10, 10 | 0°, 0 %, 4 % | legmélyebb fekete: input-háttér, lightbox, plakát-alap |
| **Graphite** (alap háttér) | `--color-background`, `--color-surface` | `#121414` | 18, 20, 20 | 180°, 5 %, 7 % | **a márka fekete.** Enyhén hideg tónus, nem tiszta #000 |
| **Carbon** | `--color-neutral-900` / `--surface-container-low` | `#171717` | 23, 23, 23 | 0°, 0 %, 9 % | címke-háttér, sávok |
| **Container** | `--color-surface-container` | `#1E2020` | 30, 32, 32 | 180°, 3 %, 12 % | kártyák (`.service-card`), aktív szűrő |
| **Steel** | `--color-neutral-800` / `--surface-container-high` | `#262626` | 38, 38, 38 | 0°, 0 %, 15 % | kártyaszegély, hover-felület |

### 2.2 Szürkék és vonalak

| Token | CSS változó | HEX | RGB | HSL | Szerep |
|---|---|---|---|---|---|
| **Line** | `--color-neutral-700` / `--outline-variant` | `#404040` | 64, 64, 64 | 0°, 0 %, 25 % | **alap 1 px-es szegély**: gomb-outline, címke, input |
| **Line Strong** | `--color-neutral-600` / `--outline` | `#525252` | 82, 82, 82 | 0°, 0 %, 32 % | hover-szegély |
| **Mute** | `--color-neutral-500` | `#737373` | 115, 115, 115 | 0°, 0 %, 45 % | másodlagos szöveg (csak ≥ 18 px, lásd 2.5) |
| **Ash** | `--color-neutral-400` | `#A3A3A3` | 163, 163, 163 | 0°, 0 %, 64 % | kisebb címkék, dátum, helyszín |
| **Mist** | `--color-on-surface-variant` | `#BFC7D2` | 191, 199, 210 | 215°, 17 %, 79 % | leírások, bekezdések sötét háttéren |

### 2.3 Fehérek

| Token | CSS változó | HEX | RGB | HSL | Szerep |
|---|---|---|---|---|---|
| **Paper** | – (`.text-white`, `.btn-white`) | `#FFFFFF` | 255, 255, 255 | 0°, 0 %, 100 % | címek, fehér CTA, világos plakát-alap |
| **Bone** | `--color-on-background` | `#E3E2E2` | 227, 226, 226 | 0°, 2 %, 89 % | alap szövegszín sötét háttéren |

### 2.4 Kék akcentus

A CSS-ben négy kék él egymás mellett. A márka szintjén **egy fő kék** van, a többi ennek változata:

| Token | CSS változó | HEX | RGB | HSL | Szerep |
|---|---|---|---|---|---|
| **MG Blue** ★ | `--color-primary-container` | `#3498DB` | 52, 152, 219 | 204°, 70 %, 53 % | **a márka-kék.** Elsődleges gomb, kiemelt kártya, aktív szűrő |
| **Bright Blue** | – (literálként 26×, kalkulátor) | `#3EA6FF` | 62, 166, 255 | 208°, 100 %, 62 % | aktív / kijelölt állapot sötét háttéren |
| **Light Blue** | `--color-primary` | `#92CCFF` | 146, 204, 255 | 208°, 100 %, 79 % | kék *szöveg* sötét háttéren, a fehér gomb hover-színe |
| **Deep Navy** | `--color-on-primary-container` | `#002D47` | 0, 45, 71 | 202°, 100 %, 14 % | szöveg MG Blue kitöltésen |
| **Print Blue** · ÚJ | – | `#1B6FA8` | 27, 111, 168 | 204°, 72 %, 38 % | kék szöveg **fehér/világos** alapon (plakát, árlap) |
| ~~Sky 500~~ | `--color-sky-500` | `#0EA5E9` | 14, 165, 233 | 199°, 89 %, 48 % | csak a `.nav-btn`-ben → **javasolt kivezetni** |
| ~~Sky 400~~ | `--color-sky-400` | `#38BDF8` | 56, 189, 248 | 199°, 93 %, 60 % | nem használt → törölhető |

**Kódtisztítás javaslat:**
```css
:root { --color-bright: #3ea6ff; --color-print-blue: #1b6fa8; }
```

**Hibaszín:** `#E74C3C` – kizárólag űrlaphibákhoz, máshol nem használjuk.

### 2.5 WCAG kontraszt-mátrix

Mért arányok (WCAG 2.x). **AA** normál szövegnél ≥ 4,5, nagy szövegnél (≥ 24 px, vagy ≥ 18,66 px félkövér) ≥ 3,0. **AAA** ≥ 7,0.

| Szöveg ↓ / Háttér → | Void `#0A0A0A` | Graphite `#121414` | Container `#1E2020` | Paper `#FFFFFF` | MG Blue `#3498DB` |
|---|---|---|---|---|---|
| Paper `#FFFFFF` | 19,8 AAA | 18,5 AAA | 16,4 AAA | – | **3,2 csak nagy** |
| Bone `#E3E2E2` | 15,3 AAA | 14,3 AAA | 12,7 AAA | ✗ 1,3 | ✗ 2,4 |
| Mist `#BFC7D2` | 11,6 AAA | 10,8 AAA | 9,6 AAA | ✗ | ✗ |
| Ash `#A3A3A3` | 7,9 AAA | 7,3 AAA | 6,5 AA | ✗ 2,5 | ✗ |
| Mute `#737373` | **4,2 csak nagy** | **3,9 csak nagy** | **3,5 csak nagy** | 4,7 AA | ✗ |
| Light Blue `#92CCFF` | 11,6 AAA | 10,8 AAA | 9,6 AAA | ✗ 1,7 | ✗ |
| Bright Blue `#3EA6FF` | 7,6 AAA | 7,1 AAA | 6,3 AA | ✗ 2,6 | ✗ |
| MG Blue `#3498DB` | 6,3 AA | 5,9 AA | 5,2 AA | **3,2 csak nagy** | – |
| Print Blue `#1B6FA8` | ✗ 3,4 | ✗ 3,4 | – | 5,4 AA | – |
| Deep Navy `#002D47` | ✗ | ✗ | ✗ | 14,3 AAA | 4,5 AA |
| Void `#0A0A0A` | – | – | – | 19,8 AAA | 6,3 AA |

**Szabályok röviden:**
1. Sötét háttéren a szöveg **Bone** vagy **Mist**, a címek **Paper**.
2. **Mute (`#737373`) sötét háttéren csak ≥ 18 px-es szöveg lehet.** Kisebb címkéknél **Ash**.
3. **MG Blue kitöltésen a szöveg Deep Navy vagy Void, soha nem fehér** (3,2:1). Kivétel: ≥ 32 px-es plakátcím.
4. Fehér háttéren a kék szöveg **Print Blue**; az MG Blue itt csak felület vagy ≥ 24 px-es cím.
5. A kék sosem hordoz egyedül információt: az aktív állapotot szegély vagy aláhúzás is jelzi.

### 2.6 60-30-10 színhasználat – receptek

Az arány a **felületre** vonatkozik; a fotó nem számít bele.

| Recept | 60 % (alap) | 30 % (másodlagos) | 10 % (akcentus) | Mikor |
|---|---|---|---|---|
| **A · Este** (alapértelmezett) | Graphite / Void | Paper + Bone szöveg | MG Blue | koncert, fesztivál, rendezvényplakát, IG poszt |
| **B · Világos** | Paper | Void szöveg, halványszürke vonalak | MG Blue felület + Print Blue szöveg | árlap, iskolai/tablós szórólap (nyomtatásban takarékos) |
| **C · Kék** | MG Blue | Void / Deep Navy szöveg | Paper | egyetlen erős üzenet: „Foglalj most”, akció, sztori-CTA |

**Az 1-1-1 szabály (a zsúfoltság ellen):** minden anyagon **egy fotó, egy cím, egy kék elem**. Ha ennél több kerül rá, valamit ki kell venni. Ha a színes logó rajta van, **a kék gyűrű a G körül már az egy kék elem** – akkor máshol nem használunk kéket.

**Amitől minden anyag elsőre felismerhető:**
1. **nagy, jó fotó**, sok levegővel körülötte, egységes képszerkesztéssel,
2. **Instrument Serif dőlt cím**,
3. **éles sarkok** mindenhol, Mono nagybetűs címke vagy gomb, mint a weboldalon,
4. a **logó** mindig ugyanott (alsó sarok).

#### Recept-példák

**Eseményplakát (A3 / A2, Este):**
- nagy fotó felül vagy teljes kifutóval; ha a szöveg a képre kerül, alul egy enyhe sötétítés a kép alján (az egyetlen engedélyezett átmenet),
- cím: *Instrument Serif Italic*, Paper,
- alatta egy sor: dátum · helyszín (JetBrains Mono 700, nagybetű, 0,1 em, Ash – mint a weboldal címkéi),
- **egyetlen kék elem:** a dátum kék háttérrel kiemelve, vagy egy rövid kék vonal a cím fölött,
- alul a márkanév és a weboldal, egy vékony vonallal elválasztva.

**Instagram portfólió poszt (1080×1350, Este):**
- a fotó a felület ~75 %-a, 48 px-es sötét margóval,
- alatta rövid, személyes mondat Serif-ben (pl. „Valódi pillanat, egyszerű keret.”),
- jobb alsó sarokban: a logó kicsiben.

**Árlap / csomagkártya (Világos vagy Este):**
- csomagnév: Inter 600, ár: Instrument Serif (nagy, elegáns szám),
- tételek: Inter 400, egyszerű felsorolás,
- **a „Legnépszerűbb” csomag az egyetlen kék kártya** (Deep Navy szöveggel), a többi 1 px-es vonallal keretezett.

**Instagram sztori (1080×1920):**
- felül és alul 250 px biztonsági sáv (az Instagram gombjai miatt),
- középen a fotó, alatta a cím; a CTA-sáv a „Kék” recept szerint.

---

## 3. Tipográfia és hierarchia

### 3.1 Betűcsaládok

| Szerep | Család | Súly(ok) | CSS változó | Mire |
|---|---|---|---|---|
| **Cím** | Instrument Serif | 400, *400 Italic* | `--font-display` | címek, nevek, árak – a márka „hangja” |
| **Szöveg** | Inter (variable) | 400 · 500 · 600 · 700 | `--font-body` | minden olvasnivaló, alcímek, csomagnevek |
| **Címke, gomb** | JetBrains Mono | 500 adat · 700 címke | `--font-mono` | gombfeliratok, menü, kategóriacímkék, dátum/helyszín sor – **mindig rövid, nagybetűs, 0,1 em ritkítással** |

Mindhárom betűtípus self-hosted (`fonts/`), latin-ext lefedéssel → **á, é, ő, ű, č, š, ž, ľ, ť, ň** helyesen jelenik meg. Nyomdai anyagokhoz ingyenesen letölthetők (SIL Open Font License).

### 3.2 Webes skála (a CSS-ből)

| Token | Család | Méret | Sormagasság | Betűköz | Súly | Átalakítás |
|---|---|---|---|---|---|---|
| `display-xl` | Instrument Serif | `clamp(48px, 6vw, 80px)` | 1,1 | −0,02 em | 400 | – |
| `h1-editorial` | Instrument Serif | `clamp(32px, 4vw, 48px)` | 1,2 | 0 | 400 (gyakran *italic*) | – |
| `group-header h2` | Instrument Serif *Italic* | 48 px (3 rem) | – | 0 | 400 | – |
| `h2-ui` | Inter | 24 px | 1,4 | −0,01 em | 600 | – |
| `body-md` | Inter | 16 px | 1,6 | 0 | 400 | – |
| `data-mono` | JetBrains Mono | 13 px | 1,4 | 0,02 em | 500 | – |
| `label-caps` | JetBrains Mono | 13 px (mobilon min. 12 px) | 1,0 | 0,1 em | 700 | UPPERCASE |

**Szabályok:**
- Nagybetűs szöveg csak JetBrains Mono-val és csak rövid címkében, gombon (1–4 szó), mindig 0,1 em ritkítással. Hosszabb szöveg soha nem csupa nagybetű.
- Serif címnél a **dőlt** a hangulatos, személyes forma (album-, eseménycímek), az álló a tényszerű (név, szolgáltatás).
- Egy felületen legfeljebb **egy** nagy Serif cím.
- Magyar szövegben mondatkezdő nagybetű: „Gyakori kérdések”, nem „Gyakori Kérdések”.

### 3.3 Plakát- és print-skála

| Szint | Web | A4 szórólap | A3 plakát | A2 plakát | IG poszt 1080×1350 | IG sztori 1080×1920 |
|---|---|---|---|---|---|---|
| Nagy cím (Serif) | 80 px | 54 pt | 96 pt | 136 pt | 120 px | 132 px |
| Cím (Serif Italic) | 48 px | 36 pt | 64 pt | 90 pt | 80 px | 88 px |
| Alcím (Inter 600) | 24 px | 18 pt | 28 pt | 40 pt | 40 px | 44 px |
| Szöveg (Inter 400) | 16 px | 10 pt | 14 pt | 20 pt | 28 px | 32 px |
| Címke (Mono 700 CAPS) | 13 px | 8 pt | 11 pt | 16 pt | 22 px | 24 px |

- Minimum nyomtatott szövegméret: 8 pt.
- Social: a legkisebb szöveg se legyen 22 px-nél kisebb, hogy telefonon is olvasható maradjon.

### 3.4 Háromnyelvű mintaszövegek

- **HU:** „Természetes pillanatok, letisztult keretben. Ballagás, koncert, portré – Galánta, Érsekújvár, Dunaszerdahely.”
- **SK:** „Prirodzené momenty v čistom ráme. Rozlúčky, koncerty, portréty – Galanta, Nové Zámky, Dunajská Streda.”
- **EN:** „Natural moments, simply framed. Graduations, concerts, portraits – western Slovakia.”

---

## 4. Komponensek és grafikai elemek

### 4.1 Gombok (mind 0 px sarok)

| Változat | CSS osztály | Kitöltés | Szöveg | Szegély | Padding | Hover |
|---|---|---|---|---|---|---|
| **Elsődleges** | `.btn-primary` | MG Blue | Deep Navy | 1 px MG Blue | 12 × 32 px | Bright Blue |
| **Körvonalas** | `.btn-outline` | átlátszó | Paper | 1 px Line `#404040` | 12 × 32 px | szegély → Line Strong |
| **Fehér** | `.btn-white` | Paper | Void | – | 16 × 40 px | háttér → Light Blue |

Felirat mindig a weboldal `.font-label-caps` stílusa: **JetBrains Mono 700, 13 px, nagybetű, 0,1 em**, ikon/nyíl jobbra (pl. „AJÁNLATKÉRÉS →”). Egy felületen **egy** elsődleges gomb legyen.

### 4.2 Címkék és szűrők

| Elem | CSS | Megjelenés |
|---|---|---|
| **Címke** | `.tag` | 32 px magas, Carbon háttér, 1 px Line, Ash, Mono nagybetű (pl. INGATLAN · DESIGN · PRECÍZIÓ) |
| **Szűrő (inaktív)** | `.filter-btn` | Graphite, 1 px Line, Mist, Mono nagybetű |
| **Szűrő (aktív)** | `.filter-btn.active` | Container háttér, 1 px **MG Blue** szegély, MG Blue szöveg |

### 4.3 Kék kiemelő vonal

- Rövid, vízszintes vonal: **24 × 4 px** (web) · **12 × 2 mm** (print) · **64 × 8 px** (social).
- A cím vagy a márkanév fölött/előtt, balra zárva.
- Felületenként **egy darab**.

### 4.4 Vonalak és elválasztók

- **Finom elválasztó:** `1px solid rgba(255,255,255,0.08)` – szakaszok között.
- **Szegély:** `1px solid #404040` – kártyák, gombok, mezők.
- Vastagabb vonalat, dupla vonalat, szaggatott vonalat nem használunk.

### 4.5 Képkeret

- 0 px sarok, opcionálisan 1 px Line szegély. Más díszítés nincs.
- Hover (web): a kép legfeljebb 1,03×-ra nagyítódik.
- Felirat: esemény neve dőlt Serifben + Mono nagybetűs kategória (pl. „KONCERT · HAJÓMALOM 25”), mint a weboldal galériájában.

### 4.6 Pontrács háttér

- Minta: `radial-gradient(circle, #2A2A2A 1px, transparent 1px)` 24 px-es rácsban.
- **Alapból nem használjuk.** Csak ritkán, **szakaszelválasztó sávként**, ha egy hosszú oldalon meg kell törni az egyforma szürkét (oldalanként legfeljebb egy sáv).
- **Soha nem keveredik a tartalommal:** szöveg, gomb, kép nem állhat közvetlenül a pontokon. Ami a sávba kerül, az tömör hátterű dobozon (Graphite vagy Container, 1 px Line szegély) áll.
- Fotó mögé és nyomtatott anyagra nem.

```css
.dot-band { background: #121414 radial-gradient(circle, #2a2a2a 1px, transparent 1px) 0 0 / 24px 24px;
            border-block: 1px solid #404040; padding: 48px 24px; }
.dot-band .panel { background: #121414; border: 1px solid #404040; }
```

> A weboldal főoldalán most a teljes `body` pontrácsos (`class="dot-grid page-home"`). Ezt a szabály szerint le kell szűkíteni egy-két szakaszra.

### 4.7 Logó

A saját logód, változtatás nélkül: fényképezőgép + MG + Captures, a G körül kék gyűrűvel.

| Fájl | Mire |
|---|---|
| `pictures/mg-captures-logo.svg` | **fő logó**, vektoros, átlátszó háttér (színes: szürke–fehér gép, kék gyűrű), sötét háttérre: weboldal, plakát, Instagram, borítókép |
| `pictures/mg-captures-logo-light.svg` | fekete-fehér, vektoros, átlátszó háttér, világos háttérre: árlap, szórólap, matrica, egyszínű nyomtatás |
| `pictures/mg-captures-logo.png`, `…-light.png` | az eredeti, 1024×1024-es képek (fekete / átlátszó háttérrel) |

Az SVG-k az eredeti képekből készültek vektorizálással (VTracer), alakra 1:1-ben megegyeznek velük; a betűk is görbék, így nyomdában sem cserélődnek le.

**A logó színei** (az eredeti képből mérve):

| Szín | HEX | Megjegyzés |
|---|---|---|
| Logó szürke | `#4D5E66` | a gép bal fele és az „M” |
| Logó fehér | `#EDF0F2` | a gép jobb fele, a „G” és a „Captures” |
| Logó kék | `#0D99D3` | a gyűrű – kicsit cián, mint a weboldal `#3498DB` kékje; a logóban így marad |

**Szabályok:**
- Körülötte legalább a „G” magasságának fele üres tér.
- Legalább 120 px / 30 mm széles legyen; favicon / 32 px alatt a „Captures” felirat már nem olvasható.
- Csak ez a két változat létezik; nincs átszínezés, árnyék, ragyogás, torzítás.

### 4.8 Szóvédjegy szövegként

- „MG Captures” – Inter 700, −0,01 em; mellette vagy alatta: „Madový Gábor · fotós” – Inter 500, Ash.

---

## 5. Csipetnyi technika

Fotós és fejlesztő vagy – ez a márka része lehet, de **csak finoman**. A weboldalra ezekből legfeljebb **kettő-három** kerüljön; plakátra és posztra egyik sem.

| # | Elem | Hol | Szabály |
|---|---|---|---|
| 1 | **Betöltés:** a logó finoman előtűnik, alatta egy vékony kék sáv töltődik | weboldal, első megnyitás | ~1 mp, csak egyszer; `prefers-reduced-motion` esetén kimarad |
| 2 | **Fókuszgyűrű:** vékony kék kör követi az egeret a galériaképek fölött | galéria, asztali gép | csak `(pointer: fine)` eszközön; telefonon nincs |
| 3 | **Fotóadat:** „85 mm · f/1.8 · 1/250 s · ISO 200” | csak a nagyított (lightbox) nézetben | JetBrains Mono 12 px, Mute; csak valódi EXIF-adat |
| 4 | **Rejtett üzenet** a böngészőkonzolban | weboldal | átlagos látogató nem látja |
| 5 | **Lábléc:** „Fotózta és kódolta: Madový Gábor” | weboldal lábléc | egy sor, Inter 13 px, Ash |

**Javasolt hármas:** 1 + 3 + 5.

---

## 6. Gyors ellenőrzőlista

- [ ] Minden sarok 0 px (kivéve a 2 px-es űrlapmezőt és a jelentéssel bíró köröket)
- [ ] A fotó a főszereplő, körülötte elég üres tér
- [ ] Egy Serif cím, Inter szöveg, Mono nagybetűs címke/gomb – mint a weboldalon
- [ ] 1-1-1: egy fotó, egy cím, egy kék elem (ha van színes logó, a gyűrű az)
- [ ] A logó ott van, mindig ugyanott
- [ ] Kék kitöltésen Deep Navy / Void szöveg, fehér alapon Print Blue szöveg
- [ ] Nincsenek kamera-kijelző effektek (sarokjelölő, célkereszt, „REC”)
- [ ] Az ékezetek (ő, ű, č, ľ) rendben vannak
