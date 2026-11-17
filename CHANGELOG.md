# Changelog – comand-web-ui

All notable changes are documented here, newest first. Versioning follows `package.json`.

## [Unreleased]

_Add every new change here before it is released._

### Added
- Entry `src/main.js` registers the template URLs of the installed framework via `setTemplateUrls(import.meta.glob(...))`.
- Quality rules documented (`docs/README.md`, workspace `CLAUDE.md`).

### Changed
- `App.vue`: template CSS is activated with `applyTemplate()` from `comand-component-library` for all four templates (before: only `material-web`, loaded from a `../node_modules/...` path). The per-site file `public/templates/<template>/styles/template.css` (token-only overrides) is added afterwards, only if it exists.
- `EditModeTemplateSettings.vue`: offers exactly blank / material-web / neumorphic / tailwind (before: blank, business, casual, material-web, influencer), starts with the template of the site, and uses `applyTemplate()` (before: removed the first stylesheet link blindly).
- `index.js`: the template helpers of the component library are not registered as Vue components.

### Fixed (HTML / accessibility / contrast, round 2; verified with `tools/check-matrix.mjs`)
- `public/templates/blank/pages-de/homepage.json`: the slideshow section existed twice (hero section and main content, duplicate id `slideshow`, slideshow rendered twice) - removed from the main sections (the English file already had it once).
- `public/templates/material-web/pages-de|en/homepage.json`: icon-only `CmdTabs` entries use `tooltip` (accessible name) instead of the unknown key `name`.
- `public/templates/material-web/styles/template.css` (per-site override): navigation text uses `--secondary-color-contrast-text` on the secondary-color background (was white, ratio 2.0).
- `ThumbnailScrollerWrapper.vue`: `id="thumbnail-scroller-wrapper"` => class (the wrapper is used more than once per page).
- `--default-background` (fixed light gray, does not follow the color scheme) replaced by the new framework token `--color-scheme-background-subtle` in the striped sections of the small-screen layout and the edit-mode sidebar (light text on light gray in dark mode).
- Library fixes that remove findings here: `CmdParagraph` renders a `<div>` when its (HTML) content contains block elements (`<p>` in `<p>`), empty `CmdHeadline`s are not rendered, tab/pagination/landmark names, unique ids (see the component library changelog).

### Fixed (subpages)
- Subpages were empty: `about-us`, `subpage1`, `subpage2`, `sub-subpage`, `profile`, `schwerpunkte` (and `stories` in `blank` de/en and `material-web` en) had no page JSON. Added `public/templates/{blank,material-web}/pages-{de,en}/<page>.json` (headline + text).
- Page header (breadcrumbs, headline) was pushed to the bottom of pages with little content (`margin-top: auto` on the wrapper that contains header, content AND footer). Now the wrapper fills the height and only `.cmd-page-footer` has `margin-top: auto` (`comand-web-ui-global-styles.scss`).
- Breadcrumbs: crumbs of type `""` (parents/current page, not links) render as text (was an empty `<li>` and Vue warning `linkType`) - see `CmdBreadcrumbs` in the component library.
- `faq.json` (material-web): `openBoxesByDefault: []` (was `false`, Vue prop warning).
- All pages have the same content width: the wrapper section was a flex item with auto margins and shrank to its content (faq 774px, stories 1040px, homepage 1410px at 1600px viewport); now `width: 100%` (limited by `max-width`).
- material-web per-site override: the main navigation uses `--primary-color` (purple, like all other UI elements) instead of `--secondary-color` (green); text uses `--primary-color-contrast-text`.
- New check: `tools/test-subpages.mjs`. It also checks that all pages have the same width.

### Fixed (routes of nested subpages)
- `src/index.js` `processPage`: the route path contains ALL parents (`/de/about-us/subpage1/sub-subpage`, was `/de/subpage1/sub-subpage`: only the direct parent). Navigation links and breadcrumbs follow automatically (named routes); hard-coded old URLs of third-level pages change.

### Changed (Dev-Server)
- `vite.config.js`: nutzt standardmaessig die lokalen Repos `comand-frontend-framework/dist` und `comand-component-library/dist`, wenn vorhanden (Opt-out `CMD_LOCAL_SIBLINGS=0`); sonst die installierten Pakete.

### Fixed (Content, Dark-Mode, CSS-Variablen)
- `public/templates/blank/pages-de|en/homepage.json`: Formularfeld `type: "phone"` => `"tel"` (ungueltiger HTML-Typ, 3x `attribute-allowed-values`/`input-attributes`).
- Content-Ordner: `site.json` darf `contentFolder` setzen; `store.setTemplate(template, contentFolder)`. Fehlen die Seiten-JSONs eines Templates (z. B. `neumorphic`, `tailwind`), faellt `fetchPageJson` auf den Ordner `blank` zurueck. Vorher blieb die Seite mit diesen Templates leer.
- `App.vue`: Site-Override-CSS wird nur geladen, wenn die Datei existiert und wirklich CSS ist (kein SPA-Fallback-HTML).
- Dark-Mode: `CmdToggleDarkMode` (Library) initialisiert den Zustand synchron - behebt helle Seite bei dunklem Systemschema.
- Nicht mehr existierende CSS-Variablen (`--border-color`, `--default-gap-third/-half`, `--icon-font-size`, `--pure-white/-black`, `--dark-gray`, `--hyperlink-color-hue/-saturation`) in `editmode.css`, `comand-web-ui-global-styles.scss`, `EditModeSettingsSidebar.vue`, `EditComponentWrapper.vue`, `EditModeSectionWrapper.vue` durch Framework-Tokens ersetzt (`--default-border-color`, `calc(var(--default-gap) / 3)`, `--gap-small`, `--default-icon-size`, `--color-white/-black/-dark-gray`, `--hyperlink-color-*-light-mode`).

### Fixed (Prop-Migration: alte Prop-Namen auf die neue Library-API umgestellt)
- `public/templates/material-web/pages-de|en/homepage.json`: `CmdLoginForm` nutzt `cmdLinkLogin`, `cmdLinkForgotPassword`, `cmdLinkCreateAccount` (vorher `buttonLogin`, `linkForgotPassword`, `linkCreateAccount`); `RegisterForm.cmdForm` nutzt `cmdLinkCancelButton`/`cmdLinkSubmitButton` (vorher `cancelButton`/`submitButton`). Wirkungslose Einträge `options: {}` und `i18n: "$active"` am `CmdLoginForm` entfernt (keine Props der Komponente, erzeugten Vue-Warnungen).
- `src/components/RegisterForm.vue`: Default `cmdForm.cmdLinkSubmitButton`.
- `CmdTextImageBlock`-Daten (`public/templates/{blank,material-web}/pages-de|en/content.json` + `homepage.json`, `src/assets/data/component-structure.json`): `htmlContent` => `cmdParagraph: {content}`.
- `editmode/component-settings/CmdTextImageBlockSettings.vue`: Ausrichtung des Absatzes wird in `cmdParagraph.textAlign` gelesen/geschrieben (vorher `paragraphTextAlign`).
- Ergebnis: Vue-Warnungen "Missing required prop: content" und "Extraneous non-props attributes" im Web-UI sind weg (`tools/check-matrix`, material-web).

### Fixed
- `CmdWebsite.vue`: `useHeroSection` now receives a Boolean (was a Number => Vue prop warning).
- `vite.config.js` (also library): optional `CMD_LOCAL_SIBLINGS=1` resolves `comand-frontend-framework` / `comand-component-library` from the local repos instead of installed registry copies (used by the checks in `E:\CoManD-UI	ools`; normal builds are unchanged).

### Removed
- `public/templates/blank/styles/template.css` (empty placeholder).

### Notes
- Requires a `comand-component-library` version that exports `applyTemplate`/`setTemplateUrls` (bump the dependency range when releasing; the currently installed registry copy does not have them).

### Baseline: bereits vorhandene, nicht committete Änderungen (gesichtet 2026-11-17)
Stand HEAD `78d5a30` (2025-06-01, package.json dort 1.0.97). 44 Dateien (+232/−3768 ohne Lockfile).
- **Version 1.0.97 → 1.1.04**, Dependencies auf Framework `^4.5.0` und Library `^4.3.28` angehoben.
- **Gelöscht:** `components.js` (ersetzt durch `web-ui-components.js`), `CmdOnePager.vue`, `PageWrapper.vue`, `CmdListOfLinksSettings.vue`, Template `dating` (Seiten, Fonts, Styles).
- **Neu (untracked):** `web-ui-components.js`, `composables/useLanguageData.js`, `components/editmode/EditComponentWrapper.vue`, `CmdListSettings.vue`, Template `public/templates/material-web/` (Seiten, Fonts, `styles/template.css`), `vite.config.js.timestamp-*.mjs` (Vite-Müll, kann gelöscht werden).
- `ContentSection.vue`: Prop `contentType` → `containerType`; `CmdWebsite.vue`: neue Props `CmdSiteHeader/CmdSiteFooter/CmdPageHeader/CmdPageFooter`.

**Inkonsistenzen mit der neuen Library-API (offen, Ursache der Vue-Warnungen in `tools/check-matrix`):**
- ~~alte Prop-Namen in `homepage.json`/`content.json`/`CmdTextImageBlockSettings.vue`~~ => **behoben, siehe `### Fixed (Prop-Migration)`**. (`closeOffcanvas` in `header-footer.json`/`CmdWebsite.vue` ist weiterhin gültig: es ist eine Prop von `CmdMainNavigation`.)
- Nicht definierte CSS-Variablen: `--pure-white`, `--pure-black`, `--dark-gray`, `--default-gap-half`, `--default-gap-third`, `--icon-font-size`, `--hyperlink-color-hue` (Edit-Mode-Styles, `comand-web-ui-global-styles.scss`).

## [1.1.04] – current `package.json` version
- Depends on `comand-frontend-framework ^4.5.0`, `comand-component-library ^4.3.28`.
- Recent history: SEO fixes; i18n and bug fixes for `CmdCookieDisclaimer` (mapped `currentLanguage` getter); CSS merged into `css.js`; router fixes; fixes for `RenderComponents`.
