import { FileManager, FileManagerServer } from 'https://unpkg.com/vanilla-filemanager';

class MyFileManagerServer extends FileManagerServer {
    async getFolders(path) {
        const url = '/get-folders';
    
        const body = JSON.stringify({ path: path });

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: body
        });
    
        try {
            if (!res.ok) { 
                throw new Error(`Ошибка сервера: ${res.status}`);
            }
    
            const data = await res.json();
            return data.folders;
    
        } catch (error) {
            const errorText = await res.text();
            throw new Error(`HTTP Error: ${res.status} - ${res.statusText}, Body: ${errorText}`);
        }
    }

    async getFiles(path) {
        const url = '/get-files';
    
        const body = JSON.stringify({ path: path });
    
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: body
        });
        try {
            if (!res.ok) { 
                throw new Error(`Ошибка сервера: ${res.status}`);
            }
    
            const data = await res.json();
    

            return data.files;
    
        } catch (error) {
            const errorText = await res.text();
            throw new Error(`HTTP Error: ${res.status} - ${res.statusText}, Body: ${errorText}`);
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
            const errorText = await res.text();
            throw new Error(`HTTP Error: ${res.status} - ${res.statusText}, Body: ${errorText}`);
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
            const errorText = await response.text();
            throw new Error(`HTTP Error: ${response.status} - ${response.statusText}, Body: ${errorText}`);
        }
    }

    async removeFileOrFolder(path) {
        const url = '/remove-file';
    
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
            const errorText = await res.text();
            throw new Error(`HTTP Error: ${res.status} - ${res.statusText}, Body: ${errorText}`);
        }
    }

    async renameFileOrFolder(oldPath, newPath) {
        const url = '/rename-file';
    
        const body = JSON.stringify({ oldPath: oldPath, newPath: newPath });
    
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

    async copyFileOrFolder(oldPath, newPath) {
        const url = '/copy-file';
    
        const body = JSON.stringify({ oldPath: oldPath, newPath: newPath });
    
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
            const errorText = await res.text();
            throw new Error(`HTTP Error: ${res.status} - ${res.statusText}, Body: ${errorText}`);
        }
    }

    async downloadFiles(paths) {
        const url = '/download-files';
    
        const body = JSON.stringify({ paths: paths });
    
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: body
        });

        if (res.ok) {
            const blob = await res.blob();
            const urlObject = URL.createObjectURL(blob);
            
            let fileName = "archive.zip";

            const link = document.createElement('a');
            link.href = urlObject;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(urlObject);

            console.log("Всё ок!");
            return true;
        } 
        else {
            const errorText = await res.text();
            throw new Error(`HTTP Error: ${res.status} - ${res.statusText}, Body: ${errorText}`);
        }
    }

    async searchFiles(searchString, path) {
        const url = '/search-files';
    
        const body = JSON.stringify({ searchString: searchString, path: path });
    
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: body
        });

        try {
            if (!res.ok) { 
                throw new Error(`Ошибка сервера: ${res.status}`);
            }
    
            const data = await res.json();
    

            return data.files;
    
        } catch (error) {
            const errorText = await res.text();
            throw new Error(`HTTP Error: ${res.status} - ${res.statusText}, Body: ${errorText}`);
        }
    }

    async createEmptyFile(path) {
        const url = '/create-empty-file';
        const body = JSON.stringify({ path: path });
    
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: body
        });

        try {
            if (!res.ok) { 
                throw new Error(`Ошибка сервера: ${res.status}`);
            }
    
            return;
    
        } catch (error) {
            const errorText = await res.text();
            throw new Error(`HTTP Error: ${res.status} - ${res.statusText}, Body: ${errorText}`);
        }
    }

    async createEmptyFolder(path) {
        const url = '/create-empty-folder';
        const body = JSON.stringify({ path: path });
    
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: body
        });

        try {
            if (!res.ok) { 
                throw new Error(`Ошибка сервера: ${res.status}`);
            }
    
            return;
    
        } catch (error) {
            const errorText = await res.text();
            throw new Error(`HTTP Error: ${res.status} - ${res.statusText}, Body: ${errorText}`);
        }
    }
}


function main() {
    const icons = {
        addFile: "/icons/add_file.png",
        addFolder: "/icons/add_folder.png",
        arrowDownFolder: "/icons/arrow-point-to-down.png",
        arrowRightFolders: "/icons/arrow-point-to-right.png",
        arrowRightNavigation: "/icons/arrow-right.png",
        cut: "/icons/cut.png",
        copy: "/icons/copy.png",
        folder: "/icons/folder2.png",
        settings: "/icons/gear.png",
        grid: "/icons/grid.png",
        insert: "/icons/insert.png",
        arrowBack: "/icons/next-left.png",
        arrowUp: "/icons/next-upper.png",
        refresh: "/icons/refresh.png",
        picture: "/icons/picture.png",
        remove: "/icons/remove.png",
        rename: "/icons/rename.png",
        addFilesButton: "/icons/sticky-notes.png",
        list: "/icons/list.png",
        textfile: "/icons/textfile.png",
        openedFolder: "/icons/open-folder.png",
        download: "/icons/download.png",
        createFile: "/icons/create-file.png",
        createFolder: "/icons/create-folder.png",
        css: "/icons/css.png",
        doc: "/icons/doc.png",
        docx: "/icons/docx.png",
        exe: "/icons/exe.png",
        html: "/icons/html.png",
        mp4: "/icons/mp4.png",
        pdf: "/icons/pdf.png",
        php: "/icons/php.png",
        ppt: "/icons/ppt.png",
        pptx: "/icons/pptx.png",
        py: "/icons/python-file.png",
        svg: "/icons/svg.png",
        wav: "/icons/wav.png",
        xls: "/icons/xls.png",
        xlsx: "/icons/xlsx.png",
        zipFolder: "/icons/zip-folder.png"
    }

    const customStyles = {
        "fm_folders_nav": {
            border: "3px solid red"
        }
    }

    const customLanguages = {
        es: {
            "Upload": "Subir",
            "Searching": "Buscando",
            "Upload file": "Subir archivo",
            "Upload folder": "Subir carpeta",
            "Settings": "Configuración",
            "Hover color": "Color al pasar el ratón",
            "Background color": "Color de fondo",
            "Border color": "Color del borde",
            "Select color": "Seleccionar color",
            "Text color": "Color del texto",
            "Address Pane interface": "Interfaz del panel de dirección",
            "Tools Pane interface": "Interfaz del panel de herramientas",
            "Navigation Pane interface": "Interfaz del panel de navegación",
            "Content Pane interface": "Interfaz del panel de contenido",
            "Settings Pane interface": "Interfaz del panel de configuración:",
            "medium": "mediano",
            "xsmall": "extra pequeño",
            "small": "pequeño",
            "large": "grande",
            "xlarge": "extra grande",
            "To default": "Por defecto",
            "Submit": "Enviar",
            "Success": "Éxito",
            "Refresh": "Actualizar",
            "Up": "Arriba",
            "Back": "Atrás",
            "This folder is empty.": "Esta carpeta está vacía.",
            "Cut file/folder": "Cortar archivo/carpeta",
            "Copy file/folder": "Copiar archivo/carpeta",
            "Paste file/folder": "Pegar archivo/carpeta",
            "Rename file/folder": "Renombrar archivo/carpeta",
            "Remove file/folder": "Eliminar archivo/carpeta",
            "Download file/folder": "Descargar archivo/carpeta",
            "Create empty file": "Crear archivo vacío",
            "Create empty folder": "Crear carpeta vacía",
            "Name": "Nombre",
            "Date of change": "Fecha de modificación",
            "Type": "Tipo",
            "Size": "Tamaño",
            "Byte": "Byte",
            "Folder": "Carpeta",
            "file": "archivo",
            "Change file display to list": "Cambiar visualización de archivos a lista",
            "Change file display to tiles": "Cambiar visualización de archivos a mosaicos",
            "MB": "MB",
            "KB": "KB",
            "Image": "Imagen",
            "Are you sure you want to reset?": "¿Estás seguro de que quieres restablecer?",
            "Are you sure you want to delete?": "¿Estás seguro de que quieres eliminar?",
            "Are you sure you want to download?": "¿Estás seguro de que quieres descargar?"
        }
    }

    const options = {
        rootFolderName: "Root",
        icons: icons,
        language: "ru",
        addressPaneOptions: {
            addressPaneEnabled: true,
            searchingEnabled: true,
            refreshButtonEnabled: true,
            upButtonEnabled: true,
            backButtonEnabled: true,
        },
        toolsPaneOptions: {
            toolsPaneEnabled: true,
            uploadingFilesEnabled: true,
            toolsEnabled: {
                deletingFiles: true,
                renamingFiles: true,
                downloadingFiles: true,
                movingFiles: true,
                createFiles: true,
            },
            defaultFileDisplayMode: "list",
            fileDisplayModesEnabled: true,
            settingsOptions: {
                settingsEnabled: true,
                colorSettingsEnabled: true,
                sizeSettingsEnabled: true,
            },
        },
        navigationPaneEnabled: true,
    }


    const filemanagerRoot = document.querySelector(".somediv");
     
    const myFileManagerServer = new MyFileManagerServer();
    const filemanager = new FileManager(filemanagerRoot, myFileManagerServer, options, customStyles, customLanguages);

}

main();