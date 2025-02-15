import {
    dirname,
    basename,
    join,
} from 'node:path';
import tryCatch from 'try-catch';
import {FatFsResult} from 'fatfs-wasm';
import montag from 'montag';
import {longToShort, shortToLong} from '../fatpath/fatpath.js';
import {packContent, extractContent} from './packer.js';

export const createFilesystem = (disk) => ({
    writeFileContent: createWriteFileContent(disk),
    readFileContent: createReadFileContent(disk),
    createDirectory: createCreateDirectory(disk),
    findFile: createFindFile(disk),
});

const createFindFile = (disk) => function walk(path, filename, list = []) {
    const files = disk.openDir(longToShort(path));
    
    for (const {isDirectory, name} of files) {
        const filePath = join(path, name);
        
        if (isDirectory) {
            walk(shortToLong(filePath), filename, list);
            continue;
        }
        
        console.log(filename, name, shortToLong(name));
        
        if (filename === shortToLong(name))
            list.push(shortToLong(filePath));
    }
    
    return list;
};

const createWriteFileContent = (disk) => (path, content) => {
    const writeFile = disk.writeFile.bind(disk);
    const packed = packContent(content);
    const shortenPath = longToShort(path);
    
    const [error] = tryCatch(writeFile, shortenPath, packed);
    
    /* c8 ignore start */
    if (!error)
        return;
    
    if (error.result === FatFsResult.INVALID_NAME)
        throw throwInvalidName(path, shortenPath);
    
    throw error;
    /* c8 ignore end */
};

const createReadFileContent = (disk) => (path) => {
    const shortenPath = longToShort(path);
    const uint8array = disk.readFile(shortenPath);
    
    return extractContent(uint8array);
};

const createCreateDirectory = (disk) => {
    const mkdir = disk.mkdir.bind(disk);
    
    return function createDirectory(path, {again} = {}) {
        const shortenPath = longToShort(path);
        const [error] = tryCatch(mkdir, shortenPath);
        
        if (!error)
            return;
        
        if (error.result === FatFsResult.EXIST)
            return;
        
        if (!again && error.result === FatFsResult.NO_PATH) {
            createDirectory(dirname(path));
            createDirectory(path, {
                again: true,
            });
            
            return;
        }
        
        if (error.result === FatFsResult.INVALID_NAME)
            throw throwInvalidName(path, shortenPath);
        
        throw `'${shortenPath}': ${error.message}`;
    };
};

function throwInvalidName(path, shortenPath) {
    return Error(montag`\n
         ╔══  
         ║    Invalid shortened name: '${shortenPath}'
         ║    Original name: '${path}'
         ║    Try to use '${basename(shortenPath).slice(0, 8)}'
         ║    Instead of '${basename(path)}'
         ╚══  
    `);
}

