import {dirname} from 'node:path';
import {getParentPath} from '../get-parent-path.js';
import {CreatePath} from '../symbols.js';

export const createFind = (path, {dir, type, filesystem, isStop}) => (condition) => {
    const createPath = path[CreatePath];
    
    do {
        [dir, type] = getParentPath(dir, filesystem);
        
        const path = createPath({
            dir,
            type,
            filesystem,
            isStop,
        });
        
        if (condition(path))
            return path;
    } while ((dir = dirname(dir)) !== '/');
    
    return null;
};
