import {
    dirname,
    basename,
    join,
} from 'node:path/posix';
import {types} from '@putout/babel';
import tryCatch from 'try-catch';

const {isVariableDeclarator} = types;

export const createRemove = ({dir, type, filesystem}) => () => {
    const {
        removeFile,
        readDirectory,
        renameFile,
    } = filesystem;
    
    const node = {
        type,
    };
    
    if (isVariableDeclarator(node))
        dir = dirname(dirname(dir));
    
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
    
    /* c8 ignore start */
    if (!count)
        return;
    
    /* c8 ignore end */
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
