import {join, dirname} from 'node:path';
import tryCatch from 'try-catch';

export const traverse = (filesystem, visitors) => {
    const paths = filesystem.findFile('/', 'type');
    
    for (const path of paths) {
        const type = filesystem.readFileContent(path);
        const visit = visitors[type];
        
        if (visit) {
            const dir = dirname(path);
            
            visit(createPath({
                dir,
                type,
                filesystem,
            }));
        }
    }
};

const createPath = ({dir, type, filesystem}) => {
    const {
        readFileContent,
        writeFileContent,
        readDirectory,
    } = filesystem;
    
    const node = new Proxy({
        type,
    }, {
        get(target, prop) {
            const filename = join(dir, prop);
            const [error, content] = tryCatch(readFileContent, filename);
            
            if (!error)
                return content;
            
            const files = readDirectory(filename);
            const result = {};
            
            for (const {name} of files) {
                result[name] = readFileContent(join(filename, name));
            }
            
            return result;
        },
        set(target, prop, value) {
            const filename = join(dir, prop);
            
            writeFileContent(filename, value);
            
            return true;
        },
    });
    
    return {
        node,
    };
};
