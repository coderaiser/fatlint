import {
    dirname,
    basename,
    join,
} from 'node:path/posix';
import {types} from '@putout/babel';
import tryCatch from 'try-catch';
import {readType} from '../read-type.js';

const {
    isVariableDeclarator,
    isExpressionStatement,
} = types;

export const createRemove = ({dir, type, filesystem}) => () => {
    const {
        removeFile,
        readDirectory,
        renameFile,
    } = filesystem;
    
    const node = {
        type,
    };
    
    const parentDir = dirname(dir);
    
    if (isVariableDeclarator(node)) {
        dir = dirname(parentDir);
    } else {
        const parentType = readType(parentDir, filesystem);
        
        if (isExpressionStatement({type: parentType}))
            dir = parentDir;
    }
    
    const [error] = tryCatch(removeFile, dir);
    
    if (error)
        return;
    
    const name = basename(dir);
    
    /* c8 ignore start */
    if (isNaN(name))
        return;
    
    /* c8 ignore end */
    const dirName = dirname(dir);
    const files = readDirectory(dirName);
    const count = files.length;
    
    if (!count)
        return;
    
    /* c8 ignore start */
    if (count === name)
        return;
    
    /* c8 ignore end */
    for (let i = Number(name); i < count; i++) {
        const fromName = join(dirName, String(i + 1));
        const toName = join(dirName, String(i));
        
        renameFile(fromName, toName);
    }
};
