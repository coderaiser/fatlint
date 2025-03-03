import {join} from 'node:path';
import {readType} from '../read-type.js';
import {CreatePath} from '../symbols.js';

const SEP = '/';

const isMultiple = (a) => {
    if (/\d\/body$/.test(a))
        return true;
    
    if (a.endsWith('/body/body'))
        return true;
    
    if (a.endsWith('/declarations'))
        return true;
    
    return a.endsWith('/program/body');
};

export const createGet = (path, {dir, filesystem, isStop}) => (query) => {
    const {readDirectory} = filesystem;
    const newQuery = query
        .split('.')
        .join(SEP);
    
    const newDir = join(dir, newQuery);
    const type = readType(newDir, filesystem);
    
    if (!type && isMultiple(newDir)) {
        const result = [];
        
        for (const {name} of readDirectory(newDir)) {
            const dir = join(newDir, name);
            const type = readType(dir, filesystem);
            
            result.push(path[CreatePath]({
                dir,
                type,
                filesystem,
                isStop,
            }));
        }
        
        return result;
    }
    
    return path[CreatePath]({
        dir: newDir,
        type,
        filesystem,
        isStop,
    });
};
