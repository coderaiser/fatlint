import {join} from 'node:path/posix';
import allObjectKeys from 'all-object-keys';
import jessy from 'jessy';

export const createReplaceWith = (path, {dir, filesystem}) => {
    const {
        removeFile,
        writeFileContent,
    } = filesystem;
    
    const SEP = '/';
    
    return (node) => {
        removeFile(dir);
        
        const keys = allObjectKeys(SEP, node);
        
        for (const key of keys) {
            const filename = join(dir, key);
            const data = jessy(key, SEP, node);
            
            writeFileContent(filename, data);
        }
        
        return path;
    };
};
