import {useWebUIStore} from "../stores/web-ui.js"

export function useLanguageData() {
    return useWebUIStore()?.currentLanguageData
}