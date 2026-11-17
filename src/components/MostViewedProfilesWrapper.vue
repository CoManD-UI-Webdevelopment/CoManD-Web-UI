<template>
    <div id="most-viewed-profiles-wrapper">
        <CmdBox :cmdHeadline="{
            'headlineText': currentLanguageData['box.most_viewed_profiles.headline'],
            'headlineLevel': 4,
            'textAlign': 'center'
        }" :useSlots="['body']" :useBoxBodyPadding="false" :stretchVertically="true">
            <template v-slot:body>
                <CmdList listContentType="images" :items="personas" />
            </template>
        </CmdBox>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import { useWebUIStore } from '../stores/web-ui';

// import {fetchPersonas} from "../utils/fetchPersonas.js"


export default {
    name: "MostViewedProfilesWrapper",
    data() {
        return {
            personas: []
        }
    },
    props: {
        gender: {
            type: String,
            default: "male"
        }
    },
    computed: {
        ...mapState(useWebUIStore, ["currentLanguageData"])
    },
    created() {
        fetch('https://www.comand-ui.com/content/random_personas.php')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                this.personas = data.map(persona => {
                    return {
                        image: {
                            "id": persona.id,
                            "src": "https://www.comand-ui.com" + persona.imgSrc,
                            "alt": persona.name
                        },
                        figcaption: {
                            "text": persona.name + ' (' + persona.demographics.age + ')'
                        }
                    }
                })
            })
            .catch(error => {
                console.error('Error fetching the file:', error);
            })
    }
}
</script>

<style>
#most-viewed-profiles-wrapper {
    .cmd-box {
        height: 100%;

        .cmd-list {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            margin: 0;
            height: 100%;

            ul {
                height: inherit;
            }

            li {
                --local-transition: all linear .3s;

                margin: inherit;
                align-items: center;
                transition: var(--local-transition);
                padding: 0 var(--default-padding);

                img {
                    max-height: 5rem;
                    margin: 0;
                    filter: blur(.5rem);
                }

                &:hover,
                &:active,
                &:focus {
                    background: hsla(var(--primary-color-hue), var(--primary-color-saturation), var(--primary-color-lightness), .2);
                    transition: all linear 2s;
                }
            }
        }
    }
}
</style>