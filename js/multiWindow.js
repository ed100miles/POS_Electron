const electron = require('electron');
const path = require('path')
const fs = require('fs');
const { ipcRenderer } = electron;
const homedir = require('os').homedir();

// Page elements:
const form = document.getElementById('form')
const configFile = path.join(__dirname, '../configs/pos_config.json')
const dlComplete = document.getElementById('dl_complete')
const openGood = document.getElementById('open-good')
const openBad = document.getElementById('open-bad')
const uploadFile = document.getElementById('upload_file')
const checkBtn = document.getElementById('checkBtn')

uploadFile.addEventListener('change', () => {
    if (uploadFile.value != '') {
        console.log(uploadFile.value)
        checkBtn.style.display = 'block'
        dlComplete.style.display = 'none'
    }
})

// Pass file path to main.js to be sent to pos.py
form.addEventListener('submit', (e) => {
    e.preventDefault()
    dlComplete.style.display = 'none'
    checkBtn.classList.remove('btn-primary')
    checkBtn.classList.add('btn-secondary')
    checkBtn.innerHTML = 'checking...'
    const file = uploadFile.files[0].path + `,${configFile}`
    console.log(file)
    ipcRenderer.send('file', file)
})

// On signal from main.js, display btns to dl good+bad files
ipcRenderer.on('files_done', (_, data) => {
    data = JSON.parse(data)
    let dl_good = path.join(data["dl_path"], 'good.txt')
    let dl_bad = path.join(data["dl_path"], 'bad.txt')
    try {
        fs.unlinkSync(dl_good, (err) => {
            if (err) {
                console.error(err)
                return
            }
        })
        fs.unlinkSync(dl_bad, (err) => {
            if (err) {
                console.error(err)
                return
            }
        })
    } catch (error) {
        console.log(error)
    }
    for (let value of Object.values(data['good'])) {
        fs.appendFileSync(dl_good, `${value}\n\n`, (err) => {
            if (err) throw err;
        })
    }
    for (let value of Object.values(data['bad'])) {
        fs.appendFileSync(dl_bad, `${value}\n\n`, (err) => {
            if (err) throw err;
        })
    }
    uploadFile.value = ''
    checkBtn.classList.remove('btn-secondary')
    checkBtn.classList.add('btn-primary')
    checkBtn.innerHTML = 'Check Missions'
    checkBtn.style.display = 'none'
    console.log('files are done...')
    dlComplete.style.display = 'block'
})

// open good and bad files when displayed
openGood.addEventListener('click', () => {
    electron.shell.openPath(path.join(homedir, 'Downloads', 'good.txt'));
})
openBad.addEventListener('click', () => {
    electron.shell.openPath(path.join(homedir, 'Downloads', 'bad.txt'));
})

