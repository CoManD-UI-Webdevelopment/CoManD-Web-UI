<template>
    <CmdBox :use-slots="['body']" :collapsible="true"
            :cmdHeadline="{headlineText: 'Template Settings', headlineLevel: 4, headlineIcon: {iconClass: 'icon-settings-template'}}"
            :openCollapsedBox="openBoxStatus"
            @toggleCollapse="$emit('toggle-collapse', $event)"
    >
        <template v-slot:body>
            <div v-if="editModeMessage" class="flex-container vertical">
                <div>
                    <p> You are in EditMode. You can simply edit components by clicking on them and selecting
                        one of the actions-buttons at the top-right corner of that component.</p>
                    <p><a href="#" @click.prevent="leaveEditMode">Leave EditMode</a></p>
                </div>
                <div>
                    <label for="select-template">
                        <span>Select template</span>
                        <select id="select-template" v-model="selectedTemplate">
                            <option value="blank">Blank</option>
                            <option value="material-web">Material-Web</option>
                            <option value="neumorphic">Neumorphic</option>
                            <option value="tailwind">Tailwind</option>
                        </select>
                    </label>
                </div>
            </div>
        </template>
    </CmdBox>
</template>

<script>
import {mapActions, mapState} from "pinia";
import {usePiniaStore} from "../../stores/pinia.js";
import {useWebUIStore} from "../../stores/web-ui.js"
import {applyTemplate} from "comand-component-library"

export default {
    name: "EditModeTemplateSettings",
    inject: {
        editModeContext: {
            default: false
        }
    },
    data() {
        return {
            openBoxStatus: false,
            selectedTemplate: useWebUIStore().template || "blank"
        }
    },
    props: {
        editModeMessage: {
            type: Boolean,
            default: false
        },
        openBox: {
            type: Boolean,
            required: false
        }
    },
    methods: {
        ...mapActions(usePiniaStore, ["deactivateEditMode"]),

        leaveEditMode() {
            if (confirm('Really leave EditMode? (All unsaved changes will be lost!)')) {
                this.deactivateEditMode()
            }
        },
    },
    watch: {
        openBox: {
            handler() {
                this.openBoxStatus = this.openBox
            },
            immediate: true
        },
        selectedTemplate() {
            // template-css is loaded from comand-frontend-framework (blank = no template-css)
            applyTemplate(this.selectedTemplate)

            this.$emit("input", this.selectedTemplate)
        }
    }
}
</script>