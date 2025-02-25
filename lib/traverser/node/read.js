import {join} from 'node:path/posix';

export const createReadNode = ({dir, filesystem}) => () => readAll(dir, filesystem);

function readAll(dir, filesystem, result = {}) {
    const {
        readDirectory,
        readFileContent,
    } = filesystem;
    
    const files = readDirectory(dir);
    
    for (const {name, isDirectory} of files) {
        const full = join(dir, name);
        
        if (isDirectory) {
            result[name] = {};
            readAll(full, filesystem, result[name]);
            continue;
        }
        
        result[name] = readFileContent(full);
    }
    
    return result;
}
