import {defineStore} from "pinia"
import axios from "axios"
import {nextTick} from "vue"
import {findComponent} from "./pinia.js"

function findPageById(pages, id, parents) {
    for (let i = 0; i < pages.length; i++) {
        if (pages[i].id === id) {
            return pages[i]
        }
        if (pages[i].subEntries?.length > 0) {
            const page = findPageById(pages[i].subEntries, id, parents)
            if (page) {
                if (parents) {
                    parents.unshift(pages[i])
                }
                return page
            }
        }
    }
    return null
}

export const useWebUIStore = defineStore("webUiStore", {
    state: () => ({
        template: "blank", // look and feel (name of a framework-template: blank, material-web, neumorphic, tailwind)
        contentFolder: "blank", // folder in /templates/ that contains the page-content (pages-<language>/*.json), falls back to "blank"
        languages: [],
        languageData: {},
        defaultMetaData: {},
        pages: [],
        currentLanguage: "de",
        pageContent: {},
        currentPageName: "",
        siteHeader: {},
        siteFooter: {},
        siteStructure: [],
        pageFooterContent: {},
        siteConfiguration: {},
        routeMetaData: {}
    }),
    getters: {
        heroSectionActiveSections() {
            return this.currentPageContent?.heroSection?.sections?.filter(section => section.show !== false) || []
        },
        pageHeadlineText() {
            return this.currentPageContent?.mainContent?.pageHeadlineText
        },
        asideLeftColumnShow() {
            return this.currentPageContent?.mainContent?.aside?.leftColumn?.show
        },
        asideLeftColumnContent() {
            return this.currentPageContent?.mainContent?.aside?.leftColumn?.components || []
        },
        asideRightColumnShow() {
            return this.currentPageContent?.mainContent?.aside?.rightColumn?.show
        },
        asideRightColumnContent() {
            return this.currentPageContent?.mainContent?.aside?.rightColumn?.components || []
        },
        mainNavigationEntries(state) {
            // onePager
            if (state.pages.length === 1) {
                return this.sectionEntries
            }
            // multi-page
            return this.pageEntries
        },
        /**
         * return active/visible sections (of current page) only
         */
        activeSections() {
            return this.sections.filter(section => section.show !== false)
        },
        /**
         * return all existing sections (of current page)
         */
        sections() {
            return this.currentPageContent?.mainContent?.sections?.toSorted((section1, section2) => section1.order - section2.order) || []
        },
        pageHeader() {
            if (this.currentPageName === '' || (this.currentPageName === 'homepage' && !this.pageHeadlineText)) {
                return null
            }

            // check if breadcrumbs exist and should be shown
            let breadcrumbs = null
            if (this.siteConfiguration.breadcrumbs?.showBreadcrumbs && this.currentPageName !== 'homepage') {
                breadcrumbs = this.breadcrumbs
            }

            return {
                cmdBreadcrumbs: breadcrumbs,
                cmdHeadline: {
                    headlineText: this.pageHeadlineText,
                    headlineLevel: 1
                }
            }
        },
        pageFooter() {
            // create deep-copy of pageFooterContent from state
            const pageFooterContent = JSON.parse(JSON.stringify(this.pageFooterContent))

            const buttonPrintViewText = pageFooterContent.cmdLinkPrintView

            if (buttonPrintViewText?.show) {
                buttonPrintViewText.text = this.currentLanguageData[buttonPrintViewText.text] ?? buttonPrintViewText.text
            }

            const dataPrivacyLabelText = pageFooterContent.cmdSocialNetworks.cmdFormElementDataPrivacy

            if (dataPrivacyLabelText) {
            // assign key from site.json to translate label-text
            dataPrivacyLabelText.labelText = this.currentLanguageData[dataPrivacyLabelText.labelText]
            }

            pageFooterContent.cmdSocialNetworks.networks?.forEach((item) => {
                // assign values of specific keys from currentLanguageData to keys for each social network
                item.tooltip = this.currentLanguageData[item.tooltip] ?? item.tooltip
                item.linkText = this.currentLanguageData[item.linkText] ?? item.linkText
            })

            return pageFooterContent
        },
        cookieDisclaimer() {
            return {
                useCookieDisclaimer: this.siteConfiguration.cookieDisclaimer?.useCookieDisclaimer,
                cookieOptions: {
                    required: {
                        ...this.siteConfiguration.cookieDisclaimer?.required,
                        cookies: this.siteConfiguration.cookieDisclaimer?.required?.cookies?.map(cookie => ({
                            ...cookie,
                            description: this.currentLanguageData[cookie.description] ?? cookie.description,
                            labelText: this.currentLanguageData[cookie.labelText] ?? cookie.labelText,
                            linkDataPrivacy: {
                                ...cookie.linkDataPrivacy,
                                label: this.currentLanguageData[cookie.linkDataPrivacy?.label] ?? cookie.linkDataPrivacy?.label,
                                link: this.currentLanguageData[cookie.linkDataPrivacy?.link] ?? cookie.linkDataPrivacy?.link,
                                linkText: this.currentLanguageData[cookie.linkDataPrivacy?.linkText] ?? cookie.linkDataPrivacy?.linkText
                            }
                        })) || []
                    },
                    optional: {
                         ...this.siteConfiguration.cookieDisclaimer?.optional,
                            cookies: this.siteConfiguration.cookieDisclaimer?.optional?.cookies?.map(cookie => ({
                            ...cookie,
                            description: this.currentLanguageData[cookie.description] ?? cookie.description,
                            labelText: this.currentLanguageData[cookie.labelText] ?? cookie.labelText,
                            linkDataPrivacy: {
                                ...cookie.linkDataPrivacy,
                                label: this.currentLanguageData[cookie.linkDataPrivacy?.label] ?? cookie.linkDataPrivacy?.label,
                                link: this.currentLanguageData[cookie.linkDataPrivacy?.link] ?? cookie.linkDataPrivacy?.link,
                                linkText: this.currentLanguageData[cookie.linkDataPrivacy?.linkText] ?? cookie.linkDataPrivacy?.linkText
                            }
                        })) || []
                    }
                }
            }
        },
        breadcrumbs() {
            const parents = []
            const currentPage = findPageById(this.pages, this.currentPageName, parents)
            if (this.siteConfiguration.breadcrumbs?.showHomeLinkFirst) {
                const homepage = this.pages[0]
                parents.unshift(homepage)
            }

            return {
                breadcrumbLabel: this.siteConfiguration.breadcrumbs?.showBreadcrumbLabel !== false ? this.currentLanguageData["breadcrumbs.labeltext.you_are_here"] : "",
                breadcrumbSeparator: this.siteConfiguration.breadcrumbs?.breadcrumbSeparator || undefined,
                breadcrumbLinks: [
                    ...(parents.map((page, index) => ({
                        "type": index === 0 ? "router" : "", // homepage should be router, all other parents should not be a link/router
                        "text": this.currentLanguageData[page.navEntry] ?? page.navEntry, // check for language-string to translate else show given string
                        "route": {
                            "name": page.id,
                            params: {
                                lang: this.currentLanguage
                            }
                        }
                    }))),
                    {
                        "type": "",
                        "text": this.currentLanguageData[currentPage?.navEntry] ?? currentPage?.navEntry,
                        "route": {
                            "name": this.currentPageName,
                            params: {
                                lang: this.currentLanguage
                            }
                        }
                    }
                ]
            }
        },
        showSiteHeader(state) {
            return state.siteStructure.includes("siteHeader")
        },
        showSiteFooter(state) {
            return state.siteStructure.includes("siteFooter")
        },
        metaData(state) {
            return {
                title: state.routeMetaData?.title || findPageById(state.pages, state.currentPageName)?.navEntry,
                ...state.defaultMetaData,
                ...(this.currentPageContent?.metadata || {}) // load meta-data from json
            }
        },
        currentPage(state) {
            return findPageById(state.pages, state.currentPageName)
        },
        currentPageContent(state) {
            return state.pageContent[state.currentLanguage]?.[state.currentPageName]
        },
        sectionEntries(state) {
            return this.currentPageContent?.mainContent?.sections
                ?.filter(section => section.showLinkInMainNavigation)
                ?.map(section => ({
                    iconClass: section.iconClass,
                    text: section.navEntry,
                    path: "#anchor-" + section.id,
                    type: "href"
                    // active: location.hash === "#anchor-" + section.id
                }))
        },
        pageEntries(state) {
            const filterbyNavigation = (pages, isSubentry = false) => {

                return (pages || [])
                    // check if page has a navEntry (displayed text for navigation)
                    .filter((page) => page.navEntry)
                    // check if subentry (else check location of navigation-entry (i.e. "main", "footer")
                    .filter((page) => isSubentry || !page.navigation || page.navigation?.includes("main"))
                    .map(page => ({
                        iconClass: page.iconClass,
                        text: this.currentLanguageData[page.navEntry] ?? page.navEntry,
                        ...navEntryType(page),
                        subentries: filterbyNavigation(page.subEntries, true)
                    }))
            }

            function navEntryType(page) {
                if (!page.externalLink) {
                    return {
                        route: {
                            name: page.id,
                            params: {
                                lang: state.currentLanguage
                            }
                        },
                        type: page.subEntries?.length ? "href" : "router",
                    }
                }
                return {
                    path: page.path,
                    type: "href",
                    target: "_blank"
                }
            }

            return filterbyNavigation(state.pages)
        },
        currentLanguageData(state) {
            return state.languageData[state.currentLanguage] || {}
        },
        numberOfPages(state) {
            return state.pages.length
        }
    },
    actions: {
        deleteContent(componentPath) {
              if(componentPath?.length > 1 && componentPath[0] === "siteFooter") {
                  const result = findComponent(this.siteFooter, componentPath.slice(1))
                  // check if component parent is array
                  if (Array.isArray(result.parent) && result.nodeIndex != null) {
                      // delete entry from array
                      result.parent.splice(result.nodeIndex, 1)
                  }
              }
        },
        updateContent(componentPath, updateHandlers) {
            console.log("componentPath", componentPath)
            console.log("updateHandlers", updateHandlers)
            if(componentPath?.length > 1) {
                let isSiteFooterUpdate = componentPath[0] === "siteFooter";
                const data = isSiteFooterUpdate ? this.siteFooter : this.sections
                const component = findComponent(data, isSiteFooterUpdate ? componentPath.slice(1) : componentPath)?.node

                console.log("component", component)

                if (!component || !Array.isArray(updateHandlers) || updateHandlers.length === 0) {
                    return
                }
                const childUpdateHandlers = []
                if (updateHandlers.length > 1) {
                    childUpdateHandlers.push(...updateHandlers.slice(1))
                }
                const updateHandler = updateHandlers[0].update
                if (typeof updateHandler === "function") {
                    updateHandler(component.props || component, childUpdateHandlers)
                }
            }
            // if(componentPath?.length > 1 && componentPath[0] === "siteFooter") {
            //     const component = findComponent(this.siteFooter, componentPath.slice(1))?.node
            //
            //     if (!component || !Array.isArray(updateHandlers) || updateHandlers.length === 0) {
            //         return
            //     }
            //     const childUpdateHandlers = []
            //     if (updateHandlers.length > 1) {
            //         childUpdateHandlers.push(...updateHandlers.slice(1))
            //     }
            //     const updateHandler = updateHandlers[0].update
            //     if (typeof updateHandler === "function") {
            //         updateHandler(component.props || component, childUpdateHandlers)
            //     }
            // }
        },
        addContent(componentPath, addHandler, componentPosition) {
            if(componentPath?.length > 1 && componentPath[0] === "siteFooter") {
                const result = findComponent(this.siteFooter, componentPath.slice(1))

                // add new component-entry
                if (Array.isArray(result.parent) && result.nodeIndex != null) {
                    let position = 1 // default adds '1' to nodeIndex to insert new component after existing one

                    if (componentPosition === 'before') {
                        // set position to '0' to not raise nodeIndex and insert new component before existing one
                        position = 0
                    }
                    // insert new component
                    result.parent.splice(result.nodeIndex + position, 0, addHandler.item())
                }
            }
        },
        scrollToAnchor(hash) {
            if (hash) {
                nextTick(() => {
                    document.querySelector(hash)?.scrollIntoView({
                        behavior: "smooth",
                    })
                })
            } else {

                // go to top if no hash is provided (to reset scroll-position)
                document.querySelector(".site-wrapper")?.scrollTo({top: 0, behavior: "instant"})
            }
        },
        setTemplate(template, contentFolder) {
            this.template = template
            this.contentFolder = contentFolder || template
        },
        /**
         * load a json-file with page-content (<contentFolder>/pages-<language>/<file>.json).
         * Templates are looks only, so if the content-folder (or the file) does not exist, the content of "blank" is used.
         *
         * @returns {Promise<Object|null>}
         */
        async fetchPageJson(file) {
            for (const folder of [...new Set([this.contentFolder, "blank"])]) {
                try {
                    const response = await axios(new URL(`/templates/${folder}/pages-${this.currentLanguage}/${file}.json`, location.href).href)
                    // a dev-server may answer missing files with the index.html (status 200) => accept json-objects only
                    if (response.data && typeof response.data === "object") {
                        return response.data
                    }
                } catch {
                    // try next folder
                }
            }
            return null
        },
        setLanguages(languages) {
            this.languages = languages || []
            if (!this.languages.includes(this.currentLanguage)) {
                this.setCurrentLanguage(this.languages?.[0] || "de")
            }
        },
        setLanguageData(languageData) {
            this.languageData = languageData
        },
        setDefaultMetaData(metaData) {
            this.defaultMetaData = metaData || {}
        },
        setCurrentLanguage(language) {
            this.currentLanguage = language
            // if (this.pageContent[this.currentLanguage]?.["header-footer"]) {
            //     return
            // }
            if (!this.pageContent[this.currentLanguage]) {
                this.pageContent[this.currentLanguage] = {}
            }
            this.fetchPageJson("header-footer")
                .then(structure => {
                    this.siteHeader = structure?.siteHeader || {}
                    this.siteFooter = structure?.siteFooter || {}
                    // this.pageContent[this.currentLanguage]["header-footer"] = true
                })
        },
        setRouteMetaData(metaData) {
            this.routeMetaData = metaData
        },
        addPage(page) {
            this.pages.push(page)
        },
        setCurrentPageName(name) {
            this.currentPageName = name
            document.body.setAttribute("id", name)
        },
        loadPageContent(name, hash) {
            if (this.pageContent[this.currentLanguage]?.[name]) {
                this.scrollToAnchor(hash)
                return
            }
            if (!this.pageContent[this.currentLanguage]) {
                this.pageContent[this.currentLanguage] = {}
            }

            // load data from json for this page/section
            const language = this.currentLanguage
            this.fetchPageJson(name)
                .then(pageContent => {
                    if (!pageContent) {
                        return
                    }
                    this.pageContent[language][name] = pageContent
                    this.scrollToAnchor(hash)
                })
        },
        loadSiteStructure(siteStructure) {
            this.siteStructure = siteStructure || []
        },
        updateMetaData(metaData) {
            // update meta data for current page
            this.currentPageContent.metadata = {...metaData}
        }
    }
})
