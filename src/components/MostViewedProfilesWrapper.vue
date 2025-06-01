<template>
    <div id="most-viewed-profiles-wrapper">
        <CmdBox
            :cmdHeadline="{
               'headlineText': 'Most viewed profiles',
               'headlineLevel': 4
            }"
            :useSlots="['body']"
            :useBoxBodyPadding="false"
            :stretchVertically="true"
        >
            <template v-slot:body>
                <ListWithImages
                    :items="personas"
                />
            </template>
        </CmdBox>
    </div>
</template>

<script>
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
                        cmdLink: {
                            linkType: "href"
                        },
                        "image": {
                            "id": persona.id,
                            "src": "https://www.comand-ui.com" + persona.imgSrc,
                            "alt": persona.name
                        },
                        "text": persona.name + ' (' + persona.demographics.age + ')'
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
    }
}
</style>