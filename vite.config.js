import { existsSync } from 'node:fs'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import { resolve } from "path"
import vue from '@vitejs/plugin-vue'
import Components from "unplugin-vue-components/vite"


// CMD_LOCAL_SIBLINGS=1: resolve sibling packages from the local repos (dist) instead of the installed registry copies (used by E:/CoManD-UI/tools checks)
// By default the local repos are used when present (components rely on current tokens/props; installed older copies render wrongly). Opt out: CMD_LOCAL_SIBLINGS=0
const localSiblings = process.env.CMD_LOCAL_SIBLINGS === "1" || (process.env.CMD_LOCAL_SIBLINGS !== "0" && existsSync(resolve(__dirname, "../comand-frontend-framework/dist/style.css")) && existsSync(resolve(__dirname, "../comand-component-library/dist/comand-component-library.js")))
const siblingAliases = localSiblings ? [
  { find: /^comand-frontend-framework\/styles\.css$/, replacement: resolve(__dirname, "../comand-frontend-framework/dist/style.css") },
  { find: /^comand-frontend-framework\/(material-web|neumorphic|tailwind)\.css$/, replacement: resolve(__dirname, "../comand-frontend-framework/dist/templates/$1.css") },
  { find: /^comand-frontend-framework\/demopage-only\.css$/, replacement: resolve(__dirname, "../comand-frontend-framework/dist/demopage-only.css") },
  { find: /^comand-component-library\/css\.js$/, replacement: resolve(__dirname, "../comand-component-library/src/css.js") },
  { find: /^comand-component-library\/comand-component-library\.css$/, replacement: resolve(__dirname, "../comand-component-library/dist/comand-component-library.css") },
  { find: /^comand-component-library$/, replacement: resolve(__dirname, "../comand-component-library/dist/comand-component-library.js") }
] : []

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), Components({resolvers: [(componentName) => {
      if(componentName.startsWith("Cmd")) {
        return {
          name: componentName,
          from: "comand-component-library"
        }
      }
    }]})],
    css: {
        preprocessorOptions: {
            scss: {
                api: "modern-compiler"
            }
        }
    },
    resolve: {
    alias: [
        { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
        ...siblingAliases
     ],
    },
    server: { fs: { allow: localSiblings ? [resolve(__dirname, "..")] : undefined } },
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.js"),
            formats: ["es"]
        },
        copyPublicDir: false,
        rollupOptions: {
            external: ["vue"],
            output: {
                globals: {
                    vue: "Vue"
                }
            }
        }
    }
})
