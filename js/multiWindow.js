const electron = require('electron');
const { ipcRenderer } = electron;
const form = document.getElementById('form')
const dl_links = document.getElementById('dl_links')

// Pass file path to main.js to be sent to pos.py
form.addEventListener('submit', (e) => {
    e.preventDefault()
    const file = document.getElementById('upload_file').files[0].path
    console.log(file)
    ipcRenderer.send('file', file)
})
// On signal from main.js, display btns to dl good+bad files
ipcRenderer.on('files_done', (e) => {
    console.log('files are done...')
    dl_links.style.display = 'block'
})