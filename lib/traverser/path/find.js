import {dirname} from 'node:path';
import {getParentPath} from '../get-parent-path.js';
import {CreatePath} from '../symbols.js';

export const createFind = (path, {dir, type, filesystem, isStop}) => (condition) => {
    const createPath = path[CreatePath];
    
    do {
        [dir, type] = getParentPath(dir, filesystem);
        
        const node = {
            type,
        };
        
        if (condition(node))
            return createPath({
                dir,
                type,
                filesystem,
                isStop,
            });
    } while ((dir = dirname(dir)) !== '/');
    
    return null;
};
