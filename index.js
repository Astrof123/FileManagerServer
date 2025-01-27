const express = require("express")
const fs = require('fs');
const { type } = require('os');
const multer  = require("multer");
const path = require('path');

const files_root = "/test_root";

let uploading = false;
let folderName = "";
let onlyFile = false;


function findDuplicates(name, filePath) {
    const files = fs.readdirSync(filePath);
    let count_duplicate = 0;
    let buffer_check = name;

    while (files.includes(buffer_check)) {
        count_duplicate += 1;
        buffer_check = name + ` (${count_duplicate})`
    }

    return buffer_check;
}



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
            
                folderName = findDuplicates(folderName, uploadPath);
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

            let name = findDuplicates(file.originalname, uploadPath);

            cb(null, name.trim());
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
    
        return res.send('Folder/file uploaded successfully.');
    } catch (error) {
        return res.status(400).send('Unexpected error');
    } 
});

app.post('/removeFileOrFolder', (req, res) => {
    const data = req.body;

    try {
        const filePath = __dirname + files_root + data.path;

        let filestats = fs.statSync(filePath);

        if (filestats.isFile()) {
            fs.unlinkSync(filePath)
        }
        else {
            try {
                fs.rmSync(filePath, { recursive: true }, (err) => {
                    if (err) {
                        throw error;
                    }
                });
            }
            catch (error) {
                return res.status(400).send(error);
            }
        }
    
        return res.send('File or folder successfully deleted.');
    } catch (error) {
        return res.status(400).send('Unexpected error');
    } 
});

app.post('/renameFileOrFolder', (req, res) => {
    const data = req.body;
    try {
        const fileOldPath = __dirname + files_root + data.oldPath;
        let paths = data.newPath.split("/");

        let filename = findDuplicates(paths[paths.length - 1], __dirname + files_root + paths.slice(0, paths.length - 1).join("/"));
        paths[paths.length - 1] = filename;

        const fileNewPath = __dirname + files_root + paths.join("/");

        try {
            fs.renameSync(fileOldPath, fileNewPath);
        } catch (err) {
            return res.status(400).send('Renaming error');
        }

        return res.send('File or folder successfully renamed.');
    } catch (error) {
        return res.status(400).send('Unexpected error');
    } 
});


const PORT = 3000

app.listen(PORT, () => {
    console.log(`Server started: http://localhost:${PORT}`)
})