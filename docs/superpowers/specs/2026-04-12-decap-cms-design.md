# Decap CMS for planra.no — Design Spec
**Dato:** 2026-04-12

## Mål
Gi Aleksander og én annen bruker mulighet til å redigere tekster, priser og bilder på planra.no uten å skrive kode, via et admin-panel på `planra.no/admin`.

---

## Arkitektur

```
planra-website/
├── content.json          ← alt redigerbart innhold
├── cms-inject.js         ← laster content.json og injiserer i HTML
├── index.html            ← får data-cms attributter + script-tag
├── admin/
│   ├── index.html        ← Decap CMS admin-panel
│   └── config.yml        ← definerer collections og felt
└── api/
    ├── auth.js           ← starter GitHub OAuth (Vercel function)
    └── callback.js       ← fullfører OAuth, sender token til CMS
```

### Dataflyt ved redigering
1. Bruker går til `planra.no/admin` → logger inn med GitHub
2. Bruker endrer innhold (f.eks. pris) → klikker Publiser
3. Decap committer `content.json` (og evt. nye bilder) til GitHub-repoet
4. Vercel oppdager commit → deployer automatisk (~30 sek)
5. `index.html` laster `cms-inject.js` → fetcher `content.json` → injiserer verdier i DOM via `data-cms`-attributter

### Autentisering
- GitHub OAuth App med callback til `https://planra.no/api/callback`
- To Vercel serverless functions håndterer flyten
- Brukere må være Collaborators på GitHub-repoet
- Env vars i Vercel: `OAUTH_CLIENT_ID`, `OAUTH_CLIENT_SECRET`

---

## Innholdsschema (`content.json`)

### Hero
- `hero_badge` — badge-tekst øverst
- `hero_tittel_1` — tittel linje 1
- `hero_tittel_highlight` — uthevet ord i tittelen
- `hero_tittel_3` — tittel linje 3
- `hero_tekst` — undertekst

### For personlige trenere
- `trener_overskrift`
- `trener_tekst`
- `trener_funksjoner` — liste med 4 objekter: `{ tittel, beskrivelse }`
- `trener_bilde` — filreferanse til app-skjermbilde

### For kunder
- `kunde_overskrift`
- `kunde_tekst`
- `kunde_funksjoner` — liste med 4 objekter: `{ tittel, beskrivelse }`
- `kunde_bilde` — filreferanse til app-skjermbilde

### Innebygd chat
- `chat_overskrift`
- `chat_tekst`
- `chat_bilde` — filreferanse til app-skjermbilde

### Pris
- `pris_trener_kr` — tall (f.eks. 249)
- `pris_proveperiode` — tekst (f.eks. "30 dager gratis prøveperiode")
- `pris_trener_punkter` — liste med 5 strenger
- `pris_kunde_punkter` — liste med 5 strenger

### FAQ (opp til 8 elementer)
- `faq` — liste med objekter: `{ sporsmal, svar }`

### CTA
- `cta_overskrift_1`
- `cta_overskrift_highlight`
- `cta_overskrift_3`
- `cta_tekst`

---

## Decap CMS config

Bruker `github` backend med OAuth-proxy på `/api/auth` og `/api/callback`. Media lagres i `/uploads/`-mappen i repoet og serveres statisk.

Collections:
- **Innhold** (files collection) — én fil: `content.json`
- Widgets: `string`, `text`, `number`, `image`, `list`, `object`

---

## Hva brukeren gjør én gang (manuelt oppsett)

1. Gå til GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
   - Name: `Planra CMS`
   - Homepage URL: `https://planra.no`
   - Callback URL: `https://planra.no/api/callback`
2. Kopier Client ID og Client Secret
3. Gå til Vercel → prosjekt → Settings → Environment Variables:
   - `OAUTH_CLIENT_ID` = Client ID
   - `OAUTH_CLIENT_SECRET` = Client Secret
4. Legg til den andre brukeren som Collaborator på GitHub-repoet

---

## Ikke inkludert i denne spec
- Støtte for flere språk i CMS
- Versionshistorikk / rollback (GitHub-historikk dekker dette)
- Forhåndsvisning av endringer før publisering
