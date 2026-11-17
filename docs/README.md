# CoManD Web-UI – Documentation

Package: `comand-web-ui` · License: GPL-3.0-only · Version: see `package.json` (1.1.04 at time of writing)

A JSON-driven website engine on top of `comand-frontend-framework` and `comand-component-library`. A site is described by JSON files (site structure + page content per language); the Web-UI loads them, builds routes and renders the configured components. It also contains an in-browser **edit mode**.

Dependencies: `vue`, `vue-router`, `pinia`, `axios`, `comand-frontend-framework`, `comand-component-library`, `comand-ui-iconfonts`.

## Quick start (consuming project)

```js
// main.js
import "comand-web-ui/css.js"
import { bootstrapAndMount } from "comand-web-ui"

bootstrapAndMount({
    rootComponentImportPath: "./App.vue",    // or rootComponent / app
    routerConfigurer: { onBeforeRouteAdd(route) {}, onRoutesAdded(addRoute) {} },
    appConfigurer: app => {}
})
```

`css.js` imports the component library CSS (including the framework), the library's generated CSS, `comand-web-ui-global-styles.scss` and `editmode.css`. Without options the default root component is `CmdWebsite`.

## Bootstrap sequence (`src/index.js`)

1. Register every Web-UI component and every component-library component globally (except the library's `EditComponentWrapper`, which is replaced by the Web-UI version) plus the directives `telephone`, `focus`, `fancybox`.
2. `app.use(createPinia())`.
3. Load `/templates/pages/data/languages.json` → store (`languageData`).
4. Load `/site.json` → `processSite()`:
   - sets languages (default `["de"]`) and pages (default `[{id: "homepage"}]`)
   - adds routes: `/` → first page in first language, `/:lang([a-z]{2})`, one route per page `/:lang/<parents…>/<page.id>` (sub pages via `subEntries`), and a catch-all redirect to `/`
   - stores default metadata, template name, `siteStructure`, `pageFooter`, `siteConfiguration`
   - calls `routerConfigurer.onBeforeRouteAdd(route)` for each route and `onRoutesAdded(addRoute)` afterwards; routes added through `addRoute` get `meta.cmdCustomRoute = true` (no page content is loaded for them).
5. Run `appConfigurer(app)`, `app.use(router)`, mount on `#app`.

## Data files (served from the project's `public/`)

```
site.json                               languages, pages (+subEntries), defaultMetadata, template, siteStructure, pageFooter, siteConfiguration
templates/pages/data/languages.json     UI language data
templates/<template>/pages-<lang>/*.json   page content per language (e.g. homepage.json, header-footer.json)
templates/<template>/styles, fonts
```

Shipped templates in this repo: `blank`, `material-web`, plus shared `pages` data. `BaseClient.BASE_URL` is `/templates/pages/data`; API clients: `BaseClient`, `I18nClient`, `ListOfLinksClient`.

## Templates

`site.json` → `template` is one of `blank`, `material-web`, `neumorphic`, `tailwind`. `App.vue` activates it with `applyTemplate()` (from the component library; CSS comes from the installed `comand-frontend-framework`, the entry `main.js` passes the URLs with `setTemplateUrls(import.meta.glob(...))`). Afterwards the optional per-site file `public/templates/<template>/styles/template.css` is loaded if it exists – it may only override tokens and is not a template itself. The edit-mode template select offers exactly the four templates.

Content folder: page JSONs are read from `templates/<contentFolder>/pages-<lang>/`; `contentFolder` defaults to `template` and can be set in `site.json`. If a file is missing there, the `blank` folder is used, so all four templates work with the same content.

## Rendering model

- `router.beforeEach` writes route meta/title, current page name and language (`:lang`) into the store and calls `store.loadPageContent(pageId, hash)`.
- Pages render through `InnerWrapper` → `ContentSection` → **`RenderComponents`**.
- A component node in the JSON looks like `{ name, props, components, allowAddComponent }`. `RenderComponents` renders `<component :is="name" v-bind="props">`, and child nodes are grouped by **slot name** and rendered recursively into the matching slot. Any globally registered component (library or Web-UI) can therefore be used from JSON.
- In edit mode every node is wrapped in `EditComponentWrapper` with its `componentPath`, enabling in-place editing.
- Main navigation is generated from the store: single-page sites show sections as entries (one-pager), multi-page sites show pages.

## Store (`src/stores/web-ui.js`, Pinia id `webUiStore`)

State: `template`, `languages`, `languageData`, `defaultMetaData`, `pages`, `currentLanguage`, `pageContent`, `currentPageName`, `siteHeader`, `siteFooter`, `siteStructure`, `pageFooterContent`, `siteConfiguration`, `routeMetaData`.
Getters (examples): `heroSectionActiveSections`, `pageHeadlineText`, `aside{Left,Right}Column{Show,Content}`, `mainNavigationEntries`, `activeSections`, `sections` (sorted by `order`, hidden via `show: false`), `pageHeader`.
Helpers: `usePiniaStore` (`stores/pinia.js`), `useLanguageData` composable.

## Components (`src/web-ui-components.js`)

- Site: `CmdWebsite`, `InnerWrapper`, `ContentSection`, `RenderComponents`, `ThumbnailScrollerWrapper`, `MostViewedProfilesWrapper`, `ListWithImages`, `LoginArea`, `RegisterForm`
- Edit mode: `EditComponentWrapper`, `EditModeSectionWrapper`, `EditModeMainSidebar`, `EditModeMetaDataSettings`, `EditModeSectionsSettings`, `EditModeTemplateSettings`, and `*Settings` components for Headline, Image, ImageGallery, Slideshow, List, LinkItem, OpeningHours, AddressData(+Item), SocialNetworks, ThumbnailScroller, TextImageBlock, ToggleDarkMode, Container, Section and ContactForm.

## Development

```
npm install
npm run dev      # vite dev server using public/ data
npm run build    # library build -> dist/comand-web-ui.js + dist/style.css
```

Release flow: commit → push → `npm publish` → git tag → push. Keep dependency ranges of framework and component library current.

## Documentation rules for contributors

- New Web-UI component: export in `web-ui-components.js`; if editable, add a `*Settings` component.
- Changes to the JSON data format (site.json / page files) are breaking for consuming sites – document them under *Changed* in `CHANGELOG.md`.

## Quality rules

These rules apply to every change (full text in `E:\CoManD-UI\CLAUDE.md`):

1. Framework, component library and web-ui must build and work at any time (build order: framework → component library → web-ui).
2. HTML-valid, responsive, accessible (WCAG 2.x AA), and working in light and dark mode.
3. Works with all four templates: `blank` (no template file), `material-web`, `neumorphic`, `tailwind` – each in light and dark mode.
4. Templates are looks only: they override tokens; nothing depends on a specific template.
5. Component base CSS lives in the component's `<style>` block and uses framework tokens only (no hard-coded colors except third-party brand colors with a dark-mode variant).
6. Template CSS is inherited from `comand-frontend-framework` only; no template copies elsewhere (a web-ui per-site, token-only override file is the one exception).
7. Every change is recorded in `CHANGELOG.md`.
