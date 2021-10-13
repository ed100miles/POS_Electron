const electron = require('electron');
const fs = require('fs')
const { ipcRenderer } = electron;
const configForm = document.getElementById('config-form')
const ignoreWordsForm = document.getElementById('ignore-words-form')
const ignoredWordsList = document.getElementById('ignored-words-list')

let ignoreWords = []

ignoreWordsForm.addEventListener('submit', addIgnoreWord)
configForm.addEventListener('submit', saveConfig)

ipcRenderer.on('update-config', updateConfig())

function updateConfig() {
    let posConfig
    fs.readFile('./configs/pos_config.json', (err, data) => {
        if (err) throw err;
        posConfig = JSON.parse(data);
        for (let noun of posConfig['nouns']) {
            document.getElementById(noun).checked = true
        };
        for (let verb of posConfig['verbs']) {
            document.getElementById(verb).checked = true
        };
        for (let word of posConfig['ignore_words']) {
            let item = document.createElement('li');
            item.classList.add('dblClickDelete', 'list-group-item')
            item.addEventListener('dblclick', dblClickDelete)
            let item_text = document.createTextNode(word)
            item.appendChild(item_text)
            ignoredWordsList.appendChild(item)
            ignoreWords.push(word)
        }
        if (posConfig['save_pos_tags']) {
            document.getElementById('PTAG').checked = true
        }
        if (posConfig['ambig_nouns']) {
            document.getElementById('AMBI_NOUN').checked = true
        }
        if (posConfig['spell_check']) {
            document.getElementById('SPELL_C').checked = true
        }
        if (posConfig['capitalize_i']) {
            document.getElementById('CAP_I').checked = true
        }
        if (posConfig['expand_contractions']) {
            document.getElementById('EXP_CONT').checked = true
        }
    });
};

function addIgnoreWord(e) {
    e.preventDefault()
    let item = document.createElement('li');
    item.classList.add('dblClickDelete', 'list-group-item')
    item.addEventListener('dblclick', dblClickDelete)
    let ignoreWord = document.getElementById('ignore-words-input').value
    let item_text = document.createTextNode(ignoreWord)
    item.appendChild(item_text)
    ignoredWordsList.appendChild(item)
    document.getElementById('ignore-words-form').reset()
    ignoreWords.push(ignoreWord)
}

function dblClickDelete(e) {
    let index = ignoreWords.indexOf(e.target.innerHTML)
    ignoreWords.splice(index, 1)
    ignoredWordsList.removeChild(e.target)
    console.log(ignoreWords)
}

function saveConfig(e) {
    // TODO: tidy this
    e.preventDefault()
    let configJSON = {}
    let nouns = []
    let verbs = []
    let savePosTags = false
    let ambiguous_nouns = false
    let spell_check = false
    let capitalize_i = false
    let expand_contractions = false
    let ignore_words = ignoreWords
    let elements = document.getElementById('config-form').elements;

    for (let element of elements) {
        if (element.checked) {
            if (element.value[0] == 'N') {
                nouns.push(element.value)
            }
            if (element.value[0] == 'V') {
                verbs.push(element.value)
            }
            if (element.value[0] == 'P') {
                savePosTags = true
            }
            if (element.value == 'AMBI_NOUN') {
                ambiguous_nouns = true
            }
            if (element.value == 'SPELL_C') {
                spell_check = true
            }
            if (element.value == 'EXP_CONT') {
                expand_contractions = true
            }
            if (element.value == 'CAP_I') {
                capitalize_i = true
            }
        }
    }

    configJSON["nouns"] = nouns
    configJSON["verbs"] = verbs
    configJSON['ambig_nouns'] = ambiguous_nouns
    configJSON["save_pos_tags"] = savePosTags
    configJSON["ignore_words"] = ignoreWords
    configJSON["spell_check"] = spell_check
    configJSON["capitalize_i"] = capitalize_i
    configJSON["expand_contractions"] = expand_contractions


    fs.writeFile('./configs/pos_config.json', JSON.stringify(configJSON), function (err) {
        if (err) return console.log('Configuration Update Error. Speak to Ed.')
    })

    // Edit saved button to show saved, then revert
    document.getElementById('save-config-btn').classList.remove('btn-primary')
    document.getElementById('save-config-btn').classList.add('btn-success')
    document.getElementById('save-config-btn').innerHTML = 'Saved!'
    setTimeout(() => {
        document.getElementById('save-config-btn').classList.remove('btn-success')
        document.getElementById('save-config-btn').classList.add('btn-primary')
        document.getElementById('save-config-btn').innerHTML = 'Save Config'
    }, 2000)
}