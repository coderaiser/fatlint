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

const getRegExp = (wildcard) => {
    const escaped = wildcard
        .replace(/\./g, '\\.')
        .replace(/\*/g, '.*')
        .replace('?', '.?');
    
    return RegExp(`^${escaped}$`);
};

export const createFilesystem = (disk) => ({
    writeFileContent: createWriteFileContent(disk),
    readFileContent: createReadFileContent(disk),
    createDirectory: createCreateDirectory(disk),
    findFile: createFindFile(disk),
    removeFile: createRemoveFile(disk),
    readDirectory: createReadDirectory(disk),
    renameFile: createRenameFile(disk),
});

const createRenameFile = (disk) => {
    const rename = disk.rename.bind(disk);
    
    return (from, to) => {
        const [error] = tryCatch(rename, longToShort(from), longToShort(to));
        
        if (error)
            throw Error(`${from} -> ${to}: ${error.message}`);
    };
};

const createFindFile = (disk) => function walk(path, filename, list = []) {
    const files = disk.openDir(longToShort(path));
    
    for (const {isDirectory, name} of files) {
        const filePath = join(path, name);
        
        if (isDirectory) {
            walk(shortToLong(filePath), filename, list);
            continue;
        }
        
        if (getRegExp(filename).test(shortToLong(name)))
            list.push(shortToLong(filePath));
    }
    
    return list;
};

const createWriteFileContent = (disk) => {
    const createDirectory = createCreateDirectory(disk);
    const writeFile = disk.writeFile.bind(disk);
    const unlink = disk.unlink.bind(disk);
    
    return function writeFileContent(path, content) {
        const packed = packContent(content);
        const shortenPath = longToShort(path);
        
        tryCatch(unlink, shortenPath);
        const [error] = tryCatch(writeFile, shortenPath, packed);
        
        if (!error)
            return;
        
        /* c8 ignore start */
        if (error.result === FatFsResult.NO_PATH) {
            createDirectory(dirname(path));
            return writeFileContent(path, content);
        }
        
        if (error.result === FatFsResult.INVALID_NAME)
            throw createInvalidNameError(path, shortenPath);
        
        /* c8 ignore end */
        throw createInvalidNameError(path, shortenPath);
    };
};

const createReadFileContent = (disk) => {
    const readFile = disk.readFile.bind(disk);
    
    return (path) => {
        const shortenPath = longToShort(path);
        const [error, uint8array] = tryCatch(readFile, shortenPath);
        
        if (!error)
            return extractContent(uint8array);
        
        if (error.result === FatFsResult.NO_PATH)
            throw createInvalidNameError(path, shortenPath);
        
        throw Error(`'${path}': ${error.message}`);
    };
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
            
            /* c8 ignore start */
            return; /* c8 ignore end */
        }
        
        if (error.result === FatFsResult.INVALID_NAME)
            throw createInvalidNameError(path, shortenPath);
        
        /* c8 ignore end */
        throw createUnknownError(error, path, shortenPath);
    };
};

const createReadDirectory = (disk) => {
    const openDir = disk.openDir.bind(disk);
    
    return (path) => {
        const list = [];
        const short = longToShort(path);
        const [error, files] = tryCatch(openDir, short);
        
        if (error)
            throw Error(`${path}: ${error.message}`);
        
        for (const {isDirectory, name} of files) {
            list.push({
                name: shortToLong(name),
                isDirectory,
            });
        }
        
        files.close();
        
        return list;
    };
};

const createRemoveFile = (disk) => {
    const unlink = disk.unlink.bind(disk);
    const readDirectory = createReadDirectory(disk);
    
    return function removeFile(path) {
        const short = longToShort(path);
        const [error] = tryCatch(unlink, short);
        
        if (!error)
            return;
        
        if (error.result === FatFsResult.NO_FILE)
            return;
        
        if (error.result === FatFsResult.DENIED) {
            for (const {name} of readDirectory(path)) {
                removeFile(join(path, name));
            }
            
            removeFile(path);
            
            return;
        }
        
        throw Error(`${short}: ${error.message}`);
    };
};

function createInvalidNameError(path, shortenPath) {
    return Error(montag`\n
         ╔══  
         ║    Invalid shortened name: '${shortenPath}'
         ║    Original name: '${path}'
         ║    Try to use '${basename(shortenPath).slice(0, 8)}'
         ║    Instead of '${basename(path)}'
         ╚══  
    `);
}

function createUnknownError(error, path, shortenPath) {
    return Error(montag`\n
         ╔══  
         ║    Shortened name: '${shortenPath}'
         ║    Original name: '${path}'
         ║    message: '${error.message}'
         ╚══  
    `);
}
