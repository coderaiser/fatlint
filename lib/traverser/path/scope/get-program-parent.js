import {dirname} from 'node:path/posix';
import {CreatePath} from '../../symbols.js';
import {getParentPath} from '../../get-parent-path.js';

export const createGetProgramParent = (path, {type, filesystem, dir, isStop}) => () => {
    while (type !== 'Program') {
        dir = dirname(dir);
        [dir, type] = getParentPath(dir, filesystem);
    }
    
    const programPath = path[CreatePath]({
        type,
        dir,
        filesystem,
        isStop,
    });
    
    return programPath.scope;
};
