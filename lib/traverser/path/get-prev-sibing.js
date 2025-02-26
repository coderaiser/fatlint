import {
    basename,
    dirname,
    join,
} from 'node:path/posix';
import {CreatePath, ReadType} from '../symbols.js';

export const createGetPrevSibling = (path, {dir, filesystem, isStop}) => () => {
    const createPath = path[CreatePath];
    const {readDirectory} = filesystem;
    const currentName = basename(dir);
    const parentDir = dirname(dir);
    const files = readDirectory(parentDir);
    let nextIndex = -1;
    
    for (const {name} of files) {
        if (name === currentName) {
            nextIndex = Number(name) - 1;
            break;
        }
    }
    
    const {name: nextName = 'not-found'} = files[nextIndex] || {};
    
    const nextDir = join(parentDir, nextName);
    
    if (nextName === 'not-found')
        return createPath({
            dir: nextDir,
            filesystem,
            isStop,
        });
    
    const type = path[ReadType](nextDir, filesystem);
    
    return createPath({
        dir: nextDir,
        type,
        filesystem,
        isStop,
    });
};

