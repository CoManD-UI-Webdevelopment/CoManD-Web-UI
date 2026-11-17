<template>
    <CmdWebsite />
</template>

<script>
import {mapState} from "pinia";
import {useWebUIStore} from "./stores/web-ui"
import { responsiveBodyClasses, applyTemplate } from "comand-component-library"

const SITE_OVERRIDE_LINK_ID = "cmd-site-template-overrides"

export default {
    computed: {
        ...mapState(useWebUIStore, ["template"])
    },
    async created() {
        responsiveBodyClasses()

        // template-css always comes from comand-frontend-framework ("blank" = no template-css)
        applyTemplate(this.template)

        // optional per-site overrides (tokens only) - loaded AFTER the framework-template, only if the file exists
        const overridesUrl = "/templates/" + this.template + "/styles/template.css"
        try {
            const response = await fetch(overridesUrl, {method: "HEAD"})

            if (response.ok && response.headers.get("content-type")?.includes("css")) {
                document.getElementById(SITE_OVERRIDE_LINK_ID)?.remove()

                const linkTagOverrides = document.createElement("link")
                linkTagOverrides.id = SITE_OVERRIDE_LINK_ID
                linkTagOverrides.rel = "stylesheet"
                linkTagOverrides.href = overridesUrl
                document.head.append(linkTagOverrides)
            }
        } catch {
            // no overrides available - nothing to do
        }
    }
}
 </script>
