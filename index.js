const express = require("express")
const fs = require('fs');
const { type } = require('os');
const multer  = require("multer");
const path = require('path');

const files_root = "/test_root";

let uploading = false;
let folderName = "";
let onlyFile = false;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const data = req.body;
        let uploadPath = __dirname + files_root + data.path;
        
        if (data.folderName) {
            if (folderName === "") {
                folderName = data.folderName.trim()
            }

            if (!uploading) {
                uploading = true;
                const files = fs.readdirSync(uploadPath);
                let count_duplicate = 0;
                let buffer_check = folderName;

                while (files.includes(buffer_check)) {
                    count_duplicate += 1;
                    buffer_check = folderName + ` (${count_duplicate})`
                }

                folderName = buffer_check;
            }

            uploadPath = uploadPath + `/${folderName}`;
            fs.mkdirSync(uploadPath, { recursive: true });
            cb(null, uploadPath);
        }
        else {
            onlyFile = true;
            cb(null, uploadPath);
        }
    },
    filename: function (req, file, cb) {
        if (onlyFile) {
            const data = req.body;
            let uploadPath = __dirname + files_root + data.path;
            const files = fs.readdirSync(uploadPath);

            let count_duplicate = 0;
            let buffer_check = file.originalname;

            while (files.includes(buffer_check)) {
                count_duplicate += 1;
                buffer_check = file.originalname + ` (${count_duplicate})`
            }

            cb(null, buffer_check.trim());
        }
        else {
            cb(null, file.originalname.trim());
        } 
    }
});

const upload = multer({ storage: storage });
const app = express()

app.set('view engine', 'ejs')
app.use(express.static('public'))+
app.use(express.json()); 


app.get('/', (req, res) => {
    res.render('index')
})


app.post('/getFolders', (req, res) => {
    const data = req.body;

    try {
        const filePath = __dirname + files_root + data.path;
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

    } catch (error) {
        return res.status(400).send('Unexpected error');
    }
})

app.post('/getFiles', (req, res) => {
    const data = req.body;
    try {
        const filePath = __dirname + files_root + data.path;
    
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
    } catch (error) {
        return res.status(400).send('Unexpected error');
    }
    
})


app.post('/upload', upload.array('files'), (req, res) => {
    uploading = false;
    onlyFile = false;
    folderName = "";

    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).send('The folder or file was not uploaded');
        }
    
        res.send('Folder/file uploaded successfully.');
    } catch (error) {
        return res.status(400).send('Unexpected error');
    } 
});



const PORT = 3000

app.listen(PORT, () => {
    console.log(`Server started: http://localhost:${PORT}`)
})