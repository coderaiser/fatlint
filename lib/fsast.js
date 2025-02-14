import {dirname, join} from 'node:path';
import allObjectKeys from 'all-object-keys';
import jessy from 'jessy';
import nessy from 'nessy';
import {createFilesystem} from './filesystem/filesystem.js';
import {shortToLong} from './fatpath/fatpath.js';

const {isArray} = Array;
const isEmptyArray = (a) => isArray(a) && !a.length;

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
        
        if (isEmptyArray(value)) {
            filesystem.createDirectory(current);
            continue;
        }
        
        writeFileContent(current, value);
    }
};

export const walk = (disk, filesystem = createFilesystem(disk), path = '/', list = []) => {
    const files = disk.openDir(path);
    let isEmpty = true;
    
    for (const {isDirectory, name} of files) {
        isEmpty = false;
        const filePath = join(path, name);
        
        if (isDirectory) {
            walk(disk, filesystem, filePath, list);
            continue;
        }
        
        const content = filesystem.readFileContent(filePath);
        
        list.push([filePath, content]);
    }
    
    if (isEmpty && path !== '/' && !files.length)
        list.push([path, []]);
    
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
