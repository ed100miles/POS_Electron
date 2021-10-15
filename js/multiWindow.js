const electron = require('electron');
const { app } = require('electron')
const path = require('path')
const fs = require('fs');
const { resolve } = require('path');
const { rejects } = require('assert');
const { ipcRenderer } = electron;
const form = document.getElementById('form')
const dl_links = document.getElementById('dl_links')
const configFile = path.join(__dirname, '../configs/pos_config.json')

// Pass file path to main.js to be sent to pos.py
form.addEventListener('submit', (e) => {
    e.preventDefault()
    const file = document.getElementById('upload_file').files[0].path + `,${configFile}`
    console.log(file)
    ipcRenderer.send('file', file)
})

// On signal from main.js, display btns to dl good+bad files
ipcRenderer.on('files_done', (_, data) => {
    data = JSON.parse(data)
    let dl_good = path.join(data["dl_path"], 'good.txt')
    let dl_bad = path.join(data["dl_path"], 'bad.txt')
    let deletedFiles = new Promise((resolve, reject) => {
        fs.unlink(dl_good, (err) => {
            if (err) {
                console.error(err)
                return
            }
        })
        fs.unlink(dl_bad, (err) => {
            if (err) {
                console.error(err)
                return
            }
        })
        resolve('done')
    })
    deletedFiles.then((message) => {
        for (const value of Object.values(data['good'])) {
            fs.appendFileSync(dl_good, `${value}\n\n`, (err) => {
                if (err) throw err;
            })
        }
        for (const value of Object.values(data['bad'])) {
            fs.appendFileSync(dl_bad, `${value}\n\n`, (err) => {
                if (err) throw err;
            })
        }
    })
    console.log('files are done...')
    dl_links.style.display = 'block'
})
