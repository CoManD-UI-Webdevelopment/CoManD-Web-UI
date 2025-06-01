function fetchPersonas() {
    fetch('https://www.comand-ui.com/content/random_personas.php')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Loaded JSON:', data);
        this.personas = data.filter(persona => persona.demographics.gender === this.gender).map(persona => {
            return {
                "image": {
                    "id": persona.id,
                    "src": "https://www.comand-ui.com" + persona.imgSrc,
                    "alt": persona.name
                },
                "figcaption": {
                    "show": true,
                    "position": "bottom",
                    "text": persona.name + ' (' + persona.demographics.age + ')',
                    "textAlign": "center"
                }
            }
        })
    })
    .catch(error => {
        console.error('Error fetching the file:', error);
    })
}

export { fetchPersonas }