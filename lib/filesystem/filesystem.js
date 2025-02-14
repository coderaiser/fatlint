import {dirname} from 'node:path';
import tryCatch from 'try-catch';
import {FatFsResult} from 'fatfs-wasm';
import {longToShort} from '../fatpath.js';
import {packContent, extractContent} from './packer.js';

export const createFilesystem = (disk) => ({
    writeFileContent: createWriteFileContent(disk),
    readFileContent: createReadFileContent(disk),
    createDirectory: createCreateDirectory(disk),
});

const createWriteFileContent = (disk) => (path, content) => {
    const writeFile = disk.writeFile.bind(disk);
    const packed = packContent(content);
    const shortenPath = longToShort(path);
    
    const [error] = tryCatch(writeFile, shortenPath, packed);
    
    if (!error)
        return;
    
    if (error.result === FatFsResult.INVALID_NAME)
        throw Error(`Invalid name: ${shortenPath}`);
    
    throw error;
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
        
        if (error.result === FatFsResult.EXIST)
            return;
        
        if (error.result === FatFsResult.NO_PATH) {
            createDirectory(dirname(path));
            createDirectory(path);
            
            return;
        }
        
        if (error.result === FatFsResult.INVALID_NAME)
            throw Error(`Invalid name: ${path}`);
        
        throw error;
    };
};

