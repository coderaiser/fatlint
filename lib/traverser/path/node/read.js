import {join} from 'node:path/posix';

const {keys} = Object;

export const createReadNode = ({dir, filesystem}) => () => readNode(dir, filesystem);

export function readNode(dir, filesystem, result = {}, files = filesystem.readDirectory(dir), {first = true} = {}) {
    const {
        readDirectory,
        readFileContent,
    } = filesystem;
    
    for (const {name, isDirectory} of files) {
        if (first && name === '0' && !keys(result).length)
            result = [];
        
        const full = join(dir, name);
        
        if (isDirectory) {
            const files = readDirectory(full);
            
            if (!files.length)
                result[name] = [];
            else if (files[0].name === '0')
                result[name] = [];
            else
                result[name] = {};
            
            readNode(full, filesystem, result[name], files, {
                first: false,
            });
            continue;
        }
        
        result[name] = readFileContent(full);
    }
    
    return result;
}
