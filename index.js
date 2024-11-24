const express = require("express")
const fs = require('fs');
const { type } = require('os');

const app = express()

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json()); 

app.get('/', (req, res) => {
    res.render('index')
})

app.post('/getFolders', (req, res) => {
    const data = req.body;
    const filePath = __dirname + "/test_root" + data.path;

    const files = fs.readdirSync(filePath);

    let foldernames = []

    files.forEach(file => {
        let filestats = fs.statSync(filePath + '/' + file);

        if (!filestats.isFile()) {
            foldernames.push({name: file})
        }
    });


    let response = {"folders": foldernames}

    res.json(response);
})

app.post('/getFiles', (req, res) => {
    const data = req.body;
    const filePath = __dirname + "/test_root" + data.path;
    const files = fs.readdirSync(filePath);

    let fileMetadata = []

    files.forEach(file => {
        let filestats = fs.statSync(filePath + '/' + file);

        fileMetadata.push({
            name: file, 
            changedate: filestats.mtime.toLocaleString(),
            size: `${filestats.size} Байт`,
            isFolder: !filestats.isFile()
        })
    });


    let response = {"files": fileMetadata}

    res.json(response);
})


const PORT = 3000

app.listen(PORT, () => {
    console.log(`Server started: http://localhost:${PORT}`)
})