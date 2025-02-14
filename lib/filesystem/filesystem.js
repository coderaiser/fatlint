import {dirname} from 'node:path';
import tryCatch from 'try-catch';
import {longToShort} from '../fatpath.js';
import {packContent, extractContent} from './packer.js';

export const createFilesystem = (disk) => {
    return {
        writeFileContent: createWriteFileContent(disk),
        readFileContent: createReadFileContent(disk),
        createDirectory: createCreateDirectory(disk),
    };
};

const createWriteFileContent = (disk) => (path, content) => {
    const writeFile = disk.writeFile.bind(disk);
    const packed = packContent(content);
    const shortenPath = longToShort(path);
    
    writeFile(shortenPath, packed);
};

const createReadFileContent = (disk) => (path) => {
    const shortenPath = longToShort(path);
    const uint8array = disk.readFile(shortenPath);
    
    return extractContent(uint8array);
};

const createCreateDirectory = (disk) => {
    const mkdir = disk.mkdir.bind(disk);
    
    return function createDirectory(path) {
        const shortenPath = longToShort(path);
        const [error] = tryCatch(mkdir, shortenPath);
        
        if (!error)
            return;
        
        if (error.message.includes('EXIST'))
            return;
        
        if (error.message.includes('NO_PATH')) {
            createDirectory(dirname(path));
            createDirectory(path);
            
            return;
        }
        
        throw error;
    };
};

