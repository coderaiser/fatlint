import {dirname} from 'node:path/posix';
import {readType} from '../../read-type.js';
import {CreatePath} from '../../symbols.js';

export const createGetProgramParent = (path, {type, filesystem, dir, isStop}) => () => {
    while (type !== 'Program') {
        dir = dirname(dir);
        type = readType(dir, filesystem);
    }
    
    const programPath = path[CreatePath]({
        type,
        dir,
        filesystem,
        isStop,
    });
    
    return programPath.scope;
};
