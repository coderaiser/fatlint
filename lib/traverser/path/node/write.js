import {dirname, join} from 'node:path';
import allObjectKeys from 'all-object-keys';
import jessy from 'jessy';

const {isArray} = Array;
const isEmptyArray = (a) => isArray(a) && !a.length;

const SEP = '/';

export const writeNode = (object, {dir, filesystem}) => {
    const {writeFileContent} = filesystem;
    const keys = allObjectKeys(SEP, object);
    
    for (const key of keys) {
        const current = join(dir, key);
        const currentDir = dirname(current);
        
        const value = jessy(key, SEP, object);
        
        filesystem.createDirectory(currentDir);
        
        if (isEmptyArray(value)) {
            filesystem.createDirectory(current);
            continue;
        }
        
        writeFileContent(current, value);
    }
};
