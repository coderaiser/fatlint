import {getParentPath} from '../get-parent-path.js';
import {createFind} from './find.js';

export const createFindParent = (path, {dir, filesystem, isStop}) => {
    const [newDir, type] = getParentPath(dir, filesystem);
    
    return createFind(path, {
        dir: newDir,
        type,
        filesystem,
        isStop,
    });
};
