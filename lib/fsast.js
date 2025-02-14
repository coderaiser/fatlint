import {dirname, join} from 'node:path';
import allObjectKeys from 'all-object-keys';
import jessy from 'jessy';
import nessy from 'nessy';
import tryCatch from 'try-catch';
import {FatFsResult} from 'fatfs-wasm';
import {createFilesystem} from './filesystem/filesystem.js';
import {shortToLong} from './fatpath.js';

const SEP = '/';

export const write = (disk, object, filesystem = createFilesystem(disk)) => {
    const {writeFileContent} = filesystem;
    const keys = allObjectKeys(SEP, object);
    
    for (const key of keys) {
        if (key.startsWith('tokens'))
            continue;
        
        const current = `/${key}`;
        const value = jessy(key, SEP, object);
        const dir = dirname(current);
        
        if (dir !== '/')
            filesystem.createDirectory(dir);
        
        writeFileContent(current, value);
    }
};

export const walk = (disk, filesystem = createFilesystem(disk), path = '/', list = []) => {
    const files = disk.openDir(path);
    
    for (const {isDirectory, name} of files) {
        const filePath = join(path, name);
        
        if (isDirectory) {
            walk(disk, filesystem, filePath, list);
            continue;
        }
        
        const content = filesystem.readFileContent(filePath);
        
        list.push([filePath, content]);
    }
    
    files.close();
    
    return list;
};

export const read = (disk, filesystem = createFilesystem(disk)) => {
    const list = walk(disk, filesystem);
    
    return fill(list);
};

export const fill = (list) => {
    const result = {};
    
    for (const [key, value] of list) {
        nessy(shortToLong(key), value, '/', result);
    }
    
    return result[''];
};
