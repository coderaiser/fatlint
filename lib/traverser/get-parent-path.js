import {join, dirname} from 'node:path/posix';
import tryCatch from 'try-catch';

export const getParentPath = (dir, filesystem) => {
    const {readFileContent} = filesystem;
    
    const typePath = join(dir, 'type');
    const [, type] = tryCatch(readFileContent, typePath);
    
    if (!type)
        return getParentPath(dirname(dir), filesystem);
    
    return [dir, type];
};
