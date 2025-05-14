const express = require("express")
const fs = require('fs');
const { type } = require('os');
const multer  = require("multer");
const path = require('path');
const archiver = require('archiver');
const files_root = "/test_root";
const glob = require('glob');

let uploading = false;
let folderName = "";
let onlyFile = false;


function findDuplicates(name, filePath) {
    const files = fs.readdirSync(filePath);
    let count_duplicate = 0;
    let splittedName = name.split(".");
    let buffer_check = name;

    while (files.includes(buffer_check)) {
        count_duplicate += 1;
        if (splittedName.length === 1) {
            buffer_check = `${name} (${count_duplicate})`
        }
        else {
            buffer_check = `${splittedName.slice(0, splittedName.length - 1).join(".")} (${count_duplicate}).${splittedName[splittedName.length - 1]}`
        }
    }

    return buffer_check;
}

function copyDir(sourceDir, destinationDir) {
    try {
        fs.mkdirSync(destinationDir, { recursive: true });
        const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
    

        for (const entry of entries) {
            const sourcePath = path.join(sourceDir, entry.name);
            const destinationPath = path.join(destinationDir, entry.name);
    
            if (entry.isDirectory()) {
                copyDir(sourcePath, destinationPath);
            } 
            else if (entry.isFile()) {
                let error = fs.copyFile(sourcePath, destinationPath, (err) => {
                    if (err) {
                        return Error(err);
                    }
                });

                if (error) {
                    throw error;
                }
            }
        }
    } catch (err) {
        throw err;
    }
}

function findFilesAndFolders(startPath, searchTerm) {
    const results = [];

    function traverseDirectory(dirPath) {
        try {
            const files = fs.readdirSync(dirPath);
    
            for (const file of files) {
            const filePath = path.join(dirPath, file);
    
            try {
                const stat = fs.statSync(filePath);
    
                if (file.toLowerCase().includes(searchTerm.toLowerCase())) {
                results.push(filePath);
                }
    
                if (stat.isDirectory()) {
                traverseDirectory(filePath);
                }
            } catch (err) {
                console.error(`Ошибка при получении информации о файле/папке: ${filePath}`, err);
            }
            }
        } catch (err) {
            console.error(`Ошибка при чтении каталога: ${dirPath}`, err);
        }
    }
  
    traverseDirectory(startPath);
    return results;
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
        let filename = Buffer.from(file.originalname, 'latin1').toString('utf8');
        if (onlyFile) {
            const data = req.body;
            let uploadPath = __dirname + files_root + data.path;

            let name = findDuplicates(filename, uploadPath);

            cb(null, name.trim());
        }
        else {
            cb(null, filename.trim());
        } 
    }
});


const upload = multer({ storage: storage });
const app = express()

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json()); 


app.get('/', (req, res) => {
    res.render('index')
})


app.post('/get-folders', (req, res) => {
    const data = req.body;

    if (!data.path) {
        return res.status(400).send('Parameter "path" not specified.');
    }

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

app.post('/get-files', (req, res) => {
    const data = req.body;

    if (!data.path) {
        return res.status(400).send('Parameter "path" not specified.');
    }

    try {
        const filePath = __dirname + files_root + data.path;
    
        const files = fs.readdirSync(filePath);
    
        let fileMetadata = []

        for (const file of files) {
            let filestats = fs.statSync(filePath + '/' + file);
            let base64DataUrl = null;

            if (file.length - 4 > 0 && ['.png', '.jpg', 'jpeg', 'webp'].includes(file.slice(file.length - 4))) {
                const data = fs.readFileSync(path.join(filePath, file)); 
                const base64Image = data.toString('base64');

                if (file.endsWith(".png")) {
                    base64DataUrl = `data:image/png;base64,${base64Image}`;
                }
                else if (file.endsWith(".jpeg") || file.endsWith(".jpg")) {
                    base64DataUrl = `data:image/jpeg;base64,${base64Image}`;
                }
                else if (file.endsWith(".webp")) {
                    base64DataUrl = `data:image/webp;base64,${base64Image}`;
                }
            }

            const options = {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              };

            fileMetadata.push({
                name: file, 
                changedate: filestats.mtime.toLocaleString('ru-RU', options),
                size: `${filestats.size} Байт`,
                isFolder: !filestats.isFile(),
                image: base64DataUrl
            })
        }

    
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

app.post('/remove-file', (req, res) => {
    const data = req.body;
    if (!data.path) {
        return res.status(400).send('Parameter "path" not specified.');
    }

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

app.post('/rename-file', (req, res) => {
    const data = req.body;

    if (!data.oldPath) {
        return res.status(400).send('Parameter "oldPath" not specified.');
    }

    if (!data.newPath) {
        return res.status(400).send('Parameter "newPath" not specified.');
    }

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

app.post('/copy-file', (req, res) => {
    const data = req.body;

    if (!data.oldPath) {
        return res.status(400).send('Parameter "oldPath" not specified.');
    }

    if (!data.newPath) {
        return res.status(400).send('Parameter "newPath" not specified.');
    }


    try {
        const fileOldPath = __dirname + files_root + data.oldPath;
        
        let paths = data.newPath.split("/");
        let filename = findDuplicates(paths[paths.length - 1], __dirname + files_root + paths.slice(0, paths.length - 1).join("/"));
        paths[paths.length - 1] = filename;

        const fileNewPath = __dirname + files_root + paths.join("/");
        let filestats = fs.statSync(fileOldPath);

        try {
            if (filestats.isFile()) { 
                let error = fs.copyFile(fileOldPath, fileNewPath, (err) => {
                    if (err) {
                        return Error(err);
                    }
                });

                if (error) {
                    throw error;
                }
            }
            else {
                copyDir(fileOldPath, fileNewPath);
            }
        }
        catch (err) {
            if (err.contains("EPERM")) {
                return res.status(500).send('Copying is not permitted');
            }

            return res.status(400).send('Copy error');
        }

        return res.send('File or folder successfully copied.');
    } catch (error) {
        return res.status(400).send('Unexpected error');
    } 
});

app.post('/download-files', async (req, res) => {
    const data = req.body;

    if (!data.paths || !Array.isArray(data.paths) || data.paths.length === 0) {
        return res.status(400).send('Parameter "paths" must be a non-empty array.');
    }

    try {
        const archiveName = 'archive.zip'; 
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${archiveName}"`);

        const archive = archiver('zip', {
            zlib: { level: 4 }
        });

        archive.on('error', (err) => {
            console.error('Ошибка архивации:', err);
            res.status(500).send('Ошибка сервера: ' + err.message);
            res.end();
        });

        archive.pipe(res);

        for (const filePath of data.paths) {
            const fullPath =  __dirname + files_root + filePath;

            // if (!fullPath.startsWith(path.resolve(files_root))) {
            //     res.status(400).send(`Invalid path: ${filePath}`);
            //     return res.end();
            // }

            try {
                const stat = await fs.promises.stat(fullPath);

                if (stat.isFile()) {
                    archive.file(fullPath, { name: path.basename(fullPath) });
                } else if (stat.isDirectory()) {
                    archive.directory(fullPath, path.basename(fullPath));
                }
            } catch (err) {
                res.status(500).send(`Ошибка при обработке файла/папки ${filePath}: ${err.message}`);
                return res.end();
            }
        }

        archive.finalize();
    } catch (error) {
        res.status(500).send('Непредвиденная ошибка: ' + error.message);
        res.end();
    }
});

app.post('/search-files', (req, res) => {
    const data = req.body;
    if (!data.searchString) {
        return res.status(400).send('Parameter "searchString" not specified.');
    }

    if (!data.path) {
        return res.status(400).send('Parameter "path" not specified.');
    }

    try {
        const filePath = __dirname + files_root + data.path;

        const foundFiles = findFilesAndFolders(filePath, data.searchString);

        let fileMetadata = []

        for (const file of foundFiles) {
            let filestats = fs.statSync(file);
            let base64DataUrl = null;

            if (file.length - 4 > 0 && ['.png', '.jpg', 'jpeg', 'webp'].includes(file.slice(file.length - 4))) {
                const data = fs.readFileSync(file); 
                const base64Image = data.toString('base64');

                if (file.endsWith(".png")) {
                    base64DataUrl = `data:image/png;base64,${base64Image}`;
                }
                else if (file.endsWith(".jpeg") || file.endsWith(".jpg")) {
                    base64DataUrl = `data:image/jpeg;base64,${base64Image}`;
                }
                else if (file.endsWith(".webp")) {
                    base64DataUrl = `data:image/webp;base64,${base64Image}`;
                }
            }

            const options = {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              };

            let finalPath = file.split("test_root").slice(-1).join("").replaceAll("\\", "/");
            fileMetadata.push({
                name: path.basename(file), 
                changedate: filestats.mtime.toLocaleString('ru-RU', options),
                size: `${filestats.size} Байт`,
                isFolder: !filestats.isFile(),
                image: base64DataUrl,
                path: finalPath
            })
        }

        res.json({
            files: fileMetadata
        });

    } catch (error) {
        return res.status(400).send('Unexpected error');
    } 
});

app.post('/create-empty-file', (req, res) => {
    const data = req.body;

    if (!data.path) {
        return res.status(400).send('Parameter "path" not specified.');
    }

    try {
        let filename = findDuplicates("file", __dirname + files_root + data.path);

        const fileNewPath = __dirname + files_root + data.path + "/" + filename;

        fs.writeFileSync(fileNewPath, '');
    
        return res.send('File successfully created.');
    } catch (error) {
        return res.status(400).send('Unexpected error');
    } 
});

app.post('/create-empty-folder', (req, res) => {
    const data = req.body;

    if (!data.path) {
        return res.status(400).send('Parameter "path" not specified.');
    }

    try {
        let filename = findDuplicates("folder", __dirname + files_root + data.path);

        const folderNewPath = __dirname + files_root + data.path + "/" + filename;

        fs.mkdirSync(folderNewPath);
    
        return res.send('Create successfully created.');
    } catch (error) {
        return res.status(400).send('Unexpected error');
    } 
});

const PORT = 3002

app.listen(PORT, () => {
    console.log(`Server started: http://localhost:${PORT}`)
})