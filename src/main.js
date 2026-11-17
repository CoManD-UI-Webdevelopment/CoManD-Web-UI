import "./css"
import { setTemplateUrls } from "comand-component-library"
import {bootstrapAndMount} from "./index.js";

/* tell the library where the template-css of the installed comand-frontend-framework is */
setTemplateUrls(import.meta.glob("/node_modules/comand-frontend-framework/dist/templates/*.css", {query: "?url", import: "default", eager: true}))

bootstrapAndMount({rootComponentImportPath: "./App.vue"})
