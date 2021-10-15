const electron = require('electron');
const { ipcRenderer } = electron;
const form = document.getElementById('form')
const mission_quality = document.getElementById('mission_quality')
const checkMissionBtn = document.getElementById('checkMissionBtn')
const path = require('path')
const configFile = path.join(__dirname, '../configs/pos_config.json')


form.addEventListener('submit', (e) => {
    e.preventDefault()
    let form_content = document.getElementById('form_content').value + `,${configFile}`
    // modify page to show check in progress
    checkMissionBtn.classList.remove('btn-primary')
    checkMissionBtn.classList.add('btn-secondary')
    checkMissionBtn.innerHTML = 'checking...'
    mission_quality.innerHTML = ''
    // send mission to be checked to main.js
    ipcRenderer.send('formContent', form_content)
    console.log('form content sent')
})

ipcRenderer.on('return_content', (e, return_content) => {
    // update page to show result
    if (return_content == 'Bad Mission') {
        mission_quality.style.color = 'red'
    } else {
        mission_quality.style.color = 'rgb(50, 251, 50)'
    }
    mission_quality.innerHTML = return_content
    // and reset button to show ready for new check
    checkMissionBtn.classList.remove('btn-secondary')
    checkMissionBtn.classList.add('btn-primary')
    checkMissionBtn.innerHTML = 'Check Mission'
})