# Van der Werff Controlling: website

Nieuwe site voor Van der Werff Controlling, boekhouder en fiscaal adviseur Andries van der Werff (Stiens, werkt online in heel Nederland). Platte HTML, CSS en JavaScript, geen build en geen libraries, plus een kleine Node-server voor het boekingssysteem van het gratis consult (powered by Mettafel).

## Concept

**Kernbelofte:** minder belasting, meer rust in je bedrijf. Andries doet je boekhouding en aangifte online, je ziet je cijfers live en hij denkt vooruit.

**Het ene idee: het live dashboard.** De signatuur is een zwevende dashboardkaart in de hero, in HTML en SVG. Bij het laden bouwt hij zich op: omzet, kosten en winst tellen op, staven groeien, de winstlijn tekent zich, bankmutaties schuiven binnen en de regel "Btw-aangifte" rekent met JavaScript de echte eerstvolgende kwartaaldeadline uit (30 april, 31 juli, 31 oktober, 31 januari) met het aantal dagen dat nog rest. Met de muis kantelt de kaart licht in 3D (alleen bij `pointer: fine`, uit bij minder beweging). Klein eronder staat dat het een voorbeeld is en dat de bedragen ter illustratie zijn. Het portret van Andries hangt als pil aan de kaart.

Het dashboardidee komt subtiel terug: KPI-tegels met tellende cijfers en sparklines in de bewijsstrook, de USP-kaarten als fotokaarten met een zwevende dashboard-widget (sparkline, kwartaalbalk, berichtje), de diensten als grootboekregels met een tariefkolom, "Zo werkt het" als tijdlijn met een rechte voortgangslijn die zich bij het scrollen vult (knopen lichten op zodra de lijn ze passeert), een grafieklijn in de slotband, en de e-commercevragen als aan/uit-schakelaars (dezelfde ja/nee-vragen als in het aanvraagformulier).

## Keuzes

**Kleur (afgeleid van het logo: mint en perzik op zwart).**

| Token | Hex | Rol |
|---|---|---|
| `--inkt` | `#0f1c1b` | Diep groenzwart: tekst, donkere secties, dashboard |
| `--papier` / `--papier-2` | `#f3f6f5` / `#e6eeeb` | Koel gebroken wit, sectieritme |
| `--merk` | `#9fd7cf` | Mint uit het logo: vlakken, accenten en knoppen op donker |
| `--merk-diep` / `--cta` | `#12534c` | Diep teal voor knoppen en links op licht. Bewust donkerder dan het voorgestelde #1b6a61: wit op #1b6a61 haalt maar 6,4:1, op #12534c ruim 9:1 en als linkkleur 7,4:1 op papier |
| `--tweede` | `#f9d1af` | Perzik uit het logo: staven in het dashboard, markeringen, bedragen op donker |
| `--dim` / `--dim-op-donker` | `#3d4f4c` / `#bfd2ce` | Zachte tekst, beide minimaal 7:1 op hun eigen ondergrond |

**Waarom het rood weg is.** De oude site gebruikte veel rood (`#ef3f56`). Dat was de standaardkleur van het WordPress-thema en kwam nergens in het logo voor. Het logo zelf is mint en perzik met zwart; daar is het nieuwe palet op gebouwd, zodat site en logo eindelijk één merk zijn.

**Typografie.** Display: Red Hat Display (zwaar, 800 tot 900, strak, met tabulaire cijfers zodat bedragen netjes onder elkaar staan). Body: Red Hat Text. Beide zelf gehost als variabele woff2 in `assets/fonts/`. Knoppen zijn pillen, kaarten hebben radius 12px (groot 20px).

**Logo.** Het bestaande logo (balkjes met pijlen) als één component: `assets/img/logo.png` op licht, `assets/img/logo-wit.png` op donker. Vervangen = die twee bestanden overschrijven. De favicon komt uit `favicon-origineel.png` (32, 192, 512 en apple-touch-icon). Het logo is 350 pixels breed; scherp genoeg voor de header op 2x. Een vectorversie (SVG) van de eigenaar zou nog mooier zijn: zie open punten.

**Iconen.** Eigen set in `assets/iconen.svg` (lijnen afgeleid van Lucide, MIT), afgestemd op het logo: staafjes, draaiende pijlen, kalender met pijl vooruit, tekstballon met maan voor "ook na kantoortijd".

## Pagina's

| Pagina | Inhoud |
|---|---|
| `index.html` | Hero met live dashboard, bewijsstrook, drie USP-fotokaarten met widget, diensten als grootboek, e-commerce (bol.com, artikel 23, éénloketsysteem), Andries, reviews (uitgelichte review met kanteling plus scorepaneel, zes reviewkaarten, carrousel op mobiel), tijdlijn in drie stappen, kennisbank-zoeker met uitgelicht begrip, slotband |
| `diensten.html` | Alle vier de diensten met tarief: uitbesteden, aangifte IB, audit, adviesgesprek (Zoom-sessie en masterclass), plus waar klanten Andries nog meer voor vragen (financiering, cashflow, belastingstrategie, bespaartips) met reviewquotes |
| `boekhouding-uitbesteden.html` | Voordelen, quotes en het volledige aanvraagformulier (naam, bedrijfsnaam, rechtsvorm, transacties 0-30/31-50/50+, telefoon, e-mail, e-commerce, artikel 23, éénloketsysteem, privacy) dat een nette e-mail opbouwt |
| `aangifte-inkomstenbelasting.html` | Tarief, werkwijze, de volledige checklist in uitklapblokken (zonder het oude jaartal) en aanmeldformulier met live prijs (partner erbij) |
| `over-andries.html` | Verhaal, opleiding FSDC, wat klanten merken, Jortt |
| `ervaringen.html` | Alle 43 reviews: twee uitgelicht, de rest in een raster (carrousel met teller op mobiel) |
| `kennisbank.html` | Alle 59 begrippen A tot Z, inklapbaar, met live zoeken en markeren, A-Z-sprongen, `?q=` vanaf de homepage |
| `gratis-consult.html` | Het boekingssysteem (zie hieronder) |
| `contact.html` | NAW, formulier, 8 veelgestelde vragen met FAQPage-JSON-LD |
| `privacy.html` | Vereenvoudigde privacyverklaring op basis van de oude |
| `404.html` | Nette foutpagina (noindex) |

De 43 reviews komen uit `_bouw/Van der Werff Controlling reviews.docx`. Daarin staan 44 blokken, maar Demi Huizenga staat er twee keer in met bijna dezelfde tekst; die tweede is weggelaten. "Kashmira (geanonimiseerd)" staat er als "Kashmira", "Kiki G" als "Kiki G.". Bij de anonieme review "Andries is altijd de beste." is de toegevoegde beschrijvende zin weggelaten, de strekking is gelijk.

## Boekingssysteem gratis consult (powered by Mettafel)

- Flow in drie stappen op `gratis-consult.html`: vorm (video of telefonisch), dag en tijdslot (dagchips voor de eerstvolgende acht werkdagen plus datumkiezer), gegevens (naam, e-mail, telefoon, bedrijfsnaam optioneel, onderwerp, opmerking). Live samenvatting, fouten bij het veld, bevestigingsscherm met wat er nu gebeurt en een `.ics`-download.
- **Tijden instellen:** `consult-instellingen.json` (slotduur 20 minuten, 09:00 tot 17:00, ma t/m vr, pauzes, gesloten dagen, hoe ver vooruit). Wordt bij elke aanvraag opnieuw gelezen, dus aanpassen werkt zonder herstart.
- **API:** `GET /api/consult/bezet?datum=JJJJ-MM-DD` (alleen vrij of bezet, geen persoonsgegevens), `POST /api/consult` (weigert dubbele boekingen met 409, ook bij twee gelijktijdige verzoeken), status wijzigen via de beheerpagina. Alle tijden in Nederlandse tijd, ook op een server in UTC.
- **Beheer:** `/beheer?token=...` toont Andries een dagoverzicht (vanaf vandaag, vandaag, eerder, alles) met status nieuw, bevestigd, afgerond of geannuleerd, belbare nummers en een knop "Mail bevestiging" die een kant-en-klare bevestigingsmail opent. Een geannuleerde afspraak maakt het slot weer vrij.
- **Fail-open:** zonder JavaScript, of als de server niet bereikbaar is (bijvoorbeeld op een puur statische host), staat er een gewoon aanvraagformulier dat een mail naar info@vanderwerffcontrolling.nl opbouwt.
- Opslag: `_data/consult.json` (niet via de site op te vragen). Getest: slot geboekt, daarna bezet in de flow en in `/beheer`, dubbele boeking geweigerd, annuleren maakt het slot vrij. Testdata is verwijderd.

## Draaien en uitrollen

```bash
node server.js            # http://localhost:8197, beheer: /beheer?token=demo
node _bouw/bouw.mjs       # na het aanpassen van een pagina in _bouw/paginas/
```

De pagina's worden geschreven door `_bouw/bouw.mjs` uit `_bouw/paginas/*.html` (gedeelde header, footer en slotband staan één keer in het script). Pas teksten aan in `_bouw/paginas/` en draai het script; de site zelf heeft geen build nodig.

**Uitrollen:** het boekingssysteem heeft een Node-host nodig (Railway, Render, Fly of een VPS). Start `node server.js` met deze omgevingsvariabelen:

- `BEHEER_TOKEN`: verplicht, een lang wachtwoord voor `/beheer` (lokaal standaard `demo`)
- `PORT`: door de host gezet
- `MELDING_URL`: optioneel, een webhook die bij elke nieuwe afspraak een JSON-bericht krijgt (bijvoorbeeld naar e-mail of Slack)

Zet een persistente schijf op `_data/`, anders zijn afspraken weg na een herstart. Op een statische host (Vercel, `vercel.json` staat klaar) werkt alles behalve het boekingssysteem; daar valt de consultpagina terug op het mailformulier.

`server.js` stuurt oude URL's permanent door (`/over-ons/`, `/gratis-consult/`, `/inkomstenbelasting-aangifte/`, `/boekhouding-administratie-uitbesteden/`, `/belasting-financieel-kennisbank/<begrip>/` naar het juiste begrip, `/privacyverklaring/`, `/shop/`).

## Beeld

- Portretten van Andries: aangeleverd (`IMG_4643.jpg` wit met blauw colbert, `gravatar-andries.jpg` in de tuin, `DSC_0684.jpg` casual tegen een lichte muur). Let op: het colbertportret op witte achtergrond bleek `IMG_4643.jpg` te zijn, niet `gravatar-andries.jpg`.
- `bureau-laptop.webp`: Pexels, foto van Bongkarn Thanyakij (stond al op de oude site). `cijfers-papier.webp` (Pexels, Lukas) is niet meer in gebruik; vervangen door `audit-spreadsheet`.
- Stockfoto's (Unsplash License), elk als webp in 700 en 1200 breed, aangifte ook 2000:
  - `aangifte-documenten`: Vitaly Gariev, https://unsplash.com/photos/Vvn0OD0IxBM (kop aangiftepagina, aangifteblok diensten, grootboekregel 02)
  - `audit-spreadsheet`: Bluestonex, https://unsplash.com/photos/iDqNlr1Y1_w (audit op diensten en grootboekregel 03)
  - `cijfers-live`: litoon dev, https://unsplash.com/photos/NOZETh4j2FE (USP live inzicht)
  - `vooruit-plannen`: Vitaly Gariev, https://unsplash.com/photos/3DN7VYRgyNk (USP vooruitdenken)
  - `antwoord-bank`: Vitaly Gariev, https://unsplash.com/photos/CRSf5dsbPbk (USP bereikbaar)
  - `consult-video`: Vitaly Gariev, https://unsplash.com/photos/UHfJI_lZoPo (tijdlijn stap 1)
  - `bellen-laptop`: Vitaly Gariev, https://unsplash.com/photos/6BR7Da1HEF4 (tijdlijn stap 2, contactpagina)
  - `rust-onderneemt`: Rodeo Project Management Software, https://unsplash.com/photos/HBMPQZZondc (tijdlijn stap 3, boekhouding uitbesteden)
  - `kennis-leren`: Julio Lopez, https://unsplash.com/photos/i6mLbhsbukg (kennisbank-band op de homepage)
  - Bewust overgeslagen: kandidaten met rekenmachine of Amerikaanse belastingformulieren (cliché), felgekleurde achtergronden die vloeken met mint en perzik, en Unsplash+-foto's. Nooit stock bij reviews.
- Partnerlogo Jortt: aangeleverd.
- OG-beeld `assets/img/og.jpg`: zelf opgemaakt met logo, kop en staafjes.

## Keuring en metingen

- `keuring.mjs`: 0 fouten. Resterende waarschuwingen: 404.html zonder JSON-LD (bewust, noindex), sitemap 10 van 11 pagina's (404 bewust niet opgenomen), "geen duidelijke knop in de hero" op de homepage (vals alarm: de hero-tekst staat in een eigen kolom, de knoppen staan er wel).
- `contrast.js` op alle pagina's op 1440 en 390: 0 meldingen. Na de herziening (okt 2026) opnieuw gemeten op index, aangifte, diensten, uitbesteden, contact en ervaringen op 1440 en 375: 0 meldingen.
- `meten.js` na de herziening: "leesbreedte" op index en aangifte meet de eerste alinea, en dat is nu tekst in een kaart (USP-kaart, tijdlijnkaart); bewust smal.
- `meten.js`: geen horizontale scroll op 390, tikdoelen op mobiel 44 pixels. Twee meldingen zijn vals alarm: "letterspatiëring kop" (het script ziet "serif" in "sans-serif") en "onzichtbare inhoud" (het dichtgeklapte mobiele menu). De kennisbank (59 begrippen) en de reviewpagina (43 reviews) zitten boven de 900 DOM-elementen; dat is inhoud, geen opvulling.
- Gerepareerd na de metingen: initialen-kleur op perzik (6,8 naar ruim 7:1), tikdoelen in topbalk, kruimelpad, footer en A-Z op mobiel, sterren als één element in plaats van vijf SVG's (DOM van de reviewpagina flink lager), dashboardpil die op mobiel het bijschrift overlapte, kopregels op subpagina's die op desktop over drie regels liepen, bullets die op 390 naar twee regels sprongen.

## Open punten

1. **Prijzen bevestigen voor livegang:** aangifte IB € 180 plus € 20 partner, meerprijs € 50 per uur (alle excl. btw); Zoom-sessie € 39,97 en Masterclass 1-op-1 € 249,99 komen uit de oude webshop (onbekend of die incl. of excl. btw zijn, en of ze nog gelden).
2. **Boekhouding audit:** geen prijs bekend, nu "in overleg". Graag een tarief of bandbreedte.
3. **Masterclass 1-op-1:** de oude site had geen omschrijving. Nu: "Een uitgebreide persoonlijke sessie. De inhoud stem je vooraf met Andries af." Graag bevestigen of aanvullen.
4. **All-in tarief boekhouding uitbesteden:** geen bedragen bekend. Een "vanaf"-prijs per transactieklasse (0-30, 31-50, 50+) zou de drempel flink verlagen.
5. **Beschikbaarheid gratis consult:** nu 20 minuten, werkdagen 09:00 tot 17:00. Andries bevestigt zijn echte tijden; aanpassen in `consult-instellingen.json`.
6. **Videogesprekslink:** de bevestigingsmail vanuit `/beheer` heeft een plek voor de link (`[link videogesprek]`). Kies een vaste link (bijvoorbeeld Zoom of Google Meet) en zet die er standaard in.
7. **Korting besloten groep:** de oude aangiftepagina noemde 20% korting voor leden van "de besloten groep". Weggelaten omdat onduidelijk is of die groep nog bestaat.
8. **Blogartikelen niet overgezet** (bewust). Lijst van de oude URL's, te herschrijven of door te sturen:
   /blog/, /agrarisch/goed-investeren-investeer-als-een-boer/, /belasting-aangifte/belastingmiddeling/, /belasting-aangifte/fiscaal-voordelig-sporten-in-2024/, /belasting/assurantiebelasting-de-ultieme-handleiding-2020/, /belasting/belastingdienst-contact/, /boekhouden/beste-boekhoudpakket-zzp/, /boekhouden/bol-boekhouding/, /boekhouden/inschrijven-bij-de-kvk-zo-start-je-een-onderneming-2023/, /boekhouden/kosten-boekhouder-accountant-of-fiscaal-adviseur/, /boekhouder-leeuwarden/, /btw/btw-aangifte/, /btw/btw-verlegd-voorbeeld/, /btw/de-kleineondernemersregeling-tips/, /energie-vergelijken/welke-energieleverancier-is-het-goedkoopste/, /geen-categorie/de-fiets-is-fiscaal-voordelig/, /geen-categorie/investeren-in-slaap-is-de-beste-investering/, /investeringsaftrek/de-desinvesteringsbijtelling/, /investeringsaftrek/de-energieinvesteringsaftrek/, /investeringsaftrek/de-investeringsaftrek/, /investeringsaftrek/de-kleinschaligheidsinvesteringsaftrek/, /investeringsaftrek/de-milieuinvesteringsaftrek/, /investeringsaftrek/de-vamil-regeling/, /leeuwarden/webdesigner-de-beste-in-leeuwarden-2019/, /mkb/afschrijvingen-hoe-werkt-dat/, /mkb/een-factuur-maken/, /mkb/het-nut-van-de-zakelijke-bankrekening/, /mkb/is-mijn-aankoop-een-investering/, /mkb/ondernemer-voor-de-btw/, /mkb/ondernemer-voor-de-inkomstenbelasting/, /ondernemersaftrek/de-zelfstandigenaftrek-voorbeeld/, /ondernemersaftrek/het-urencriterium/, /overig/3-succesvolle-bedrijven-waar-je-wat-van-kunt-opsteken/, /overig/body-en-fit/, /overig/minder-hard-werken-en-meer-verdienen/, /rechtsvormen/welke-rechtsvorm-moet-ik-kiezen/, /toeslagen/hoe-krijg-je-meer-toeslagen/, /vervoersmiddel/een-auto-op-de-zaak/, /vervoersmiddel/een-scooter-op-de-zaak/, /zakelijke-laptop/beste-laptop-voor-ondernemers/, /zorgverzekering/welke-zorgverzekering-is-het-beste/
9. **Kennisbank actualiseren:** de 59 begrippen zijn licht gepolijst (spelfouten, één jaartal in het kasstelselvoorbeeld van 2017 naar 2019, de verwijzing naar Knab bij crowdfunding weggehaald). Laat Andries de inhoud nalopen; sommige regelingen (zoals de WASO-regeling bij willekeurige afschrijving) kunnen verouderd zijn.
10. **Privacyverklaring:** het oude adres (Koarnjum) is vervangen door Stiens. Bewaartermijn voor afspraakverzoeken (vier weken, zoals bij het contactformulier) en de zin "geen tracking- of advertentiecookies" kloppen voor deze site; voegt de eigenaar analytics of een pixel toe, dan moet dit aangepast.
11. **Reviews:** de bron van de reviews (bijvoorbeeld Google) is niet vermeld en er is geen link naar een profiel. Is er een Google-bedrijfsprofiel, dan kan "Bekijk alle reviews op Google" erbij, en kan `aggregateRating` in de JSON-LD (nu bewust weggelaten).
12. **Openingstijden** en exacte geo-coördinaten staan niet in de bron; daarom niet in de JSON-LD.
13. **Logo in vector:** een SVG- of hoge-resolutieversie van het logo is welkom voor het scherpste resultaat op grote schermen.
14. **WhatsApp:** niet opgenomen omdat niet bevestigd is dat 06 11 89 92 88 op WhatsApp bereikbaar is.

## Wijziging header (12 oktober 2026)
Het voorbeeld-dashboard in de hero is vervangen op verzoek van de opdrachtgever (voegde inhoudelijk niets toe). Nieuwe signatuur: een klein rond portret van Andries met de zeven belastingrechten als zwevende tegels (eigen iconen) uit de opleiding Fiscaal Adviseur van het FSDC (IB particulier, IB ondernemer, loonbelasting, vennootschapsbelasting, btw en internationaal, formeel belastingrecht, erf- en schenkbelasting; bron: fsdc.nl en Springest). De oude site noemt "de opleiding tot belastinginspecteur voor alle zeven belastingrechten".
**Open punt:** Andries bevestigt dat hij alle zeven modules heeft afgerond (en of hij de titel FA voert), en of deze indeling klopt met zijn opleiding.
