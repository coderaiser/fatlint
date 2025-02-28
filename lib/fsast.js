import {dirname, join} from 'node:path';
import allObjectKeys from 'all-object-keys';
import jessy from 'jessy';
import nessy from 'nessy';
import {createFilesystem} from '#filesystem';

const {isArray} = Array;
const isEmptyArray = (a) => isArray(a) && !a.length;

const SEP = '/';

export const writeAST = (object, {disk, filesystem = createFilesystem(disk)}) => {
    const {writeFileContent} = filesystem;
    const keys = allObjectKeys(SEP, object);
    
    for (const key of keys) {
        if (key.includes('tokens'))
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

export const walk = (path, {disk, filesystem = createFilesystem(disk), list = []}) => {
    const files = filesystem.readDirectory(path);
    
    if (path !== '/' && !files.length)
        list.push([path, []]);
    
    for (const {isDirectory, name} of files) {
        const filePath = join(path, name);
        
        if (isDirectory) {
            walk(filePath, {
                filesystem,
                list,
            });
            continue;
        }
        
        const content = filesystem.readFileContent(filePath);
        
        list.push([filePath, content]);
    }
    
    return list;
};

export const readAST = (path, {disk, filesystem = createFilesystem(disk)}) => {
    const list = walk(path, {
        filesystem,
    });
    
    return fill(list);
};

export const fill = (list) => {
    const result = {};
    
    for (const [key, value] of list) {
        nessy(key, value, '/', result);
    }
    
    return result[''];
};
