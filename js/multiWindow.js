const electron = require('electron');
const { app } = require('electron')
const path = require('path')
const fs = require('fs')
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
ipcRenderer.on('files_done', (e, data) => {
    data = JSON.parse(data)
    console.log(data)
    let dl_good = path.join(data["dl_path"], 'good.txt')
    let dl_bad = path.join(data["dl_path"], 'bad.txt')
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
    for (const [key, value] of Object.entries(data['good'])){
        fs.appendFileSync(dl_good, `${value}\n\n`, (err) =>{
            if(err) throw err;
        })
    }
    for (const [key, value] of Object.entries(data['bad'])){
        fs.appendFileSync(dl_bad, `${value}\n\n`, (err) =>{
            if(err) throw err;
        })
    }
    // fs.readFile(path.join(__dirname, '../output.json'), 'utf8', (err, data) => {
    //     if (err) {
    //         console.error(err)
    //         return
    //     }
    //     data = JSON.parse(data)
    //     let downloads = path.join(data["dl_path"], 'good.txt')
    //     fs.unlink(downloads, (err)=>{
    //         if (err){
    //             console.error(err)
    //             return
    //         }
    //     })
    //     for (let mission of data["good"]) {
    //         fs.appendFile(downloads, mission, (err) => {
    //             if (err) throw err;
    //             console.log('The file has been saved!');
    //         })
    //     }
    // })

    console.log('files are done...')
    dl_links.style.display = 'block'
})
