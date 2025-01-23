class MyFileManagerServer extends FileManagerServer {
    async getFolders(path) {
        const url = '/getFolders';
    
        const body = JSON.stringify({ path: path });
    
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: body
            });
    
            if (!res.ok) { 
                throw new Error(`Ошибка сервера: ${res.status}`);
            }
    
            const data = await res.json();
            return data.folders;
    
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getFiles(path) {
        const url = '/getFiles';
    
        const body = JSON.stringify({ path: path });
    
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: body
            });
    
            if (!res.ok) { 
                throw new Error(`Ошибка сервера: ${res.status}`);
            }
    
            const data = await res.json();
    

            return data.files;
    
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async uploadFile(file, path) {
        const formData = new FormData();

        formData.append('path', path);
        formData.append('files', file);

        const response = await fetch('/upload', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            console.log("Всё ок!");

            return true;
        } 
        else {
            throw new Error(`Ошибка сервера: ${res.status}`);
        }
    }

    async uploadFolder(files, path) {
        const formData = new FormData();
        formData.append('path', path);

        let folderName = null;
        if (files.length > 0 && files[0].webkitRelativePath) {
            const firstPath = files[0].webkitRelativePath;
            const firstSlash = firstPath.indexOf('/');
            folderName = firstPath.slice(0, firstSlash > 0 ? firstSlash : firstPath.length );
        }

        if (folderName != null) {
            formData.append('folderName', folderName);
        }
        else {
            formData.append('folderName', "folder");
        }
        
        for (const file of files) {
            formData.append('files', file);
        }

        const response = await fetch('/upload', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            console.log("Всё ок!");
            return true;
        } 
        else {
            throw new Error(`Ошибка сервера: ${res.status}`);
        }
    }

    async removeFileOrFolder(path) {
        const url = '/removeFileOrFolder';
    
        const body = JSON.stringify({ path: path });
    
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: body
        });

        if (res.ok) {
            console.log("Всё ок!");
            return true;
        } 
        else {
            throw new Error(`Ошибка сервера: ${res.status}`);
        }
    }
}


function main() {
    const filemanagerRoot = document.querySelector(".somediv");
     
    const myFileManagerServer = new MyFileManagerServer();
    const filemanager = new FileManager(filemanagerRoot, myFileManagerServer);
}

main();