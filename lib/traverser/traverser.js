import {join, dirname} from 'node:path';
import tryCatch from 'try-catch';
import {types} from '@putout/babel';
import allObjectKeys from 'all-object-keys';
import jessy from 'jessy';

const {assign} = Object;
const {isVariableDeclarator} = types;

export const traverse = (filesystem, visitors) => {
    const {readFileContent} = filesystem;
    const paths = filesystem.findFile('/', 'type');
    
    for (const path of paths) {
        const [error, type] = tryCatch(readFileContent, path);
        
        if (error)
            continue;
        
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
            
            const [readDirError, files] = tryCatch(readDirectory, filename);
            
            if (readDirError)
                return null;
            
            if (isNode(files)) {
                const {node} = createPath({
                    dir: filename,
                    type,
                    filesystem,
                });
                
                return node;
            }
            
            return readProperties(filename, files, {
                dir,
                type,
                filesystem,
            });
        },
        set(target, prop, value) {
            const filename = join(dir, prop);
            
            writeFileContent(filename, value);
            
            return true;
        },
    });
    
    const path = {};
    
    assign(path, {
        node,
        remove: createRemove({
            dir,
            type,
            filesystem,
        }),
        replaceWith: createReplaceWith(path, {
            dir,
            
            filesystem,
        }),
    });
    
    return path;
};

const createReplaceWith = (path, {dir, filesystem}) => {
    const {
        readDirectory,
        removeFile,
        writeFileContent,
    } = filesystem;
    
    const SEP = '/';
    
    return (node) => {
        for (const {name} of readDirectory(dir)) {
            removeFile(join(dir, name));
        }
        
        const keys = allObjectKeys(SEP, node);
        
        for (const key of keys) {
            const filename = join(dir, key);
            const data = jessy(key, SEP, node);
            
            writeFileContent(filename, data);
        }
        
        return path;
    };
};

const createRemove = ({dir, type, filesystem}) => () => {
    const {removeFile} = filesystem;
    const node = {
        type,
    };
    
    if (isVariableDeclarator(node))
        dir = dirname(dirname(dir));
    
    removeFile(dir);
};

const isNode = (files) => {
    for (const {name} of files) {
        if (name === 'type')
            return true;
    }
    
    return false;
};

/* c8 ignore start */
function readProperties(filename, files, {dir, type, filesystem}) {
    const {readFileContent} = filesystem;
    
    const isList = files[0].name === '0';
    const result = isList ? [] : {};
    
    for (const {name, isDirectory} of files) {
        const currentName = join(filename, name);
        
        if (isDirectory) {
            const {node} = createPath({
                dir,
                type,
                filesystem,
            });
            
            result[name] = node;
            continue;
        }
        
        result[name] = readFileContent(currentName);
    }
    
    return result;
}/* c8 ignore end */

