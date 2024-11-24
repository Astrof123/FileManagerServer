class MyFileManagerServer extends Filemanager.FileManagerServer {
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
    
            console.log(data);

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
    
            console.log(data);

            return data.files;
    
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}


function main() {
    const filemanagerRoot = document.querySelector(".somediv");
    const myFileManagerServer = new MyFileManagerServer();
    const filemanager = new Filemanager.FileManager(filemanagerRoot, myFileManagerServer);
}

main();