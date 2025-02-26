import {join} from 'node:path/posix';
import tryCatch from 'try-catch';

export const readType = (dir, filesystem) => {
    const {readFileContent} = filesystem;
    
    const typePath = join(dir, 'type');
    const [, type] = tryCatch(readFileContent, typePath);
    
    return type;
};
