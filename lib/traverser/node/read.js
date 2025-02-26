import {join} from 'node:path/posix';

export const createReadNode = ({dir, filesystem}) => () => readAll(dir, filesystem);

function readAll(dir, filesystem, result = {}, files = filesystem.readDirectory(dir)) {
    const {
        readDirectory,
        readFileContent,
    } = filesystem;
    
    for (const {name, isDirectory} of files) {
        const full = join(dir, name);
        
        if (isDirectory) {
            const files = readDirectory(full);
            
            if (!files.length)
                result[name] = [];
            else if (files[0].name === '0')
                result[name] = [];
            else
                result[name] = {};
            
            readAll(full, filesystem, result[name], files);
            continue;
        }
        
        result[name] = readFileContent(full);
    }
    
    return result;
}
