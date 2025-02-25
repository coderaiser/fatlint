import {join, dirname} from 'node:path/posix';
import {basename} from 'node:path';
import tryCatch from 'try-catch';
import {types} from '@putout/babel';
import allObjectKeys from 'all-object-keys';
import jessy from 'jessy';
import fullstore from 'fullstore';
import {createReplaceWithMultiple} from './path/replace-with-multiple.js';
import {createReadNode} from './node/read.js';
import {readNode} from './symbols.js';

const {assign} = Object;
const {isVariableDeclarator} = types;

const readType = (dir, {readFileContent}) => {
    const typePath = join(dir, 'type');
    const [, type] = tryCatch(readFileContent, typePath);
    
    return type;
};

export const traverse = (filesystem, visitors) => {
    const isStop = fullstore(false);
    const {readFileContent} = filesystem;
    const paths = filesystem.findFile('/', 'type');
    
    for (const path of paths) {
        if (isStop())
            return;
        
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
                isStop,
            }));
        }
    }
};

const createPath = ({dir, type, filesystem, isStop}) => {
    const stop = isStop.bind(null, true);
    const {
        readFileContent,
        writeFileContent,
        readDirectory,
    } = filesystem;
    
    const rawNode = {
        type,
        [readNode]: createReadNode({
            filesystem,
            dir,
        }),
    };
    
    const node = new Proxy(rawNode, {
        get(target, prop) {
            if (prop === readNode)
                return target[prop];
            
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
                    isStop,
                });
                
                return node;
            }
            
            return readProperties(filename, files, {
                dir,
                type,
                filesystem,
                isStop,
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
        replaceWithMultiple: createReplaceWithMultiple(path, {
            dir,
            filesystem,
        }),
        get: createGet({
            dir,
            filesystem,
            isStop,
        }),
        getNextSibling: createGetNextSibling({
            dir,
            filesystem,
            isStop,
        }),
        getPrevSibling: createGetPrevSibling({
            dir,
            filesystem,
            isStop,
        }),
        find: createFind({
            dir,
            filesystem,
            isStop,
        }),
        stop,
    });
    
    return new Proxy(path, {
        get(target, prop) {
            if (prop === 'parentPath') {
                const currentDir = dirname(dir);
                const type = readType(currentDir, filesystem);
                
                return createPath({
                    dir: currentDir,
                    type,
                    filesystem,
                    isStop,
                });
            }
            
            return target[prop];
        },
    });
};

const createFind = ({dir, filesystem, isStop}) => (condition) => {
    do {
        const type = readType(dir, filesystem);
        
        if (!type)
            continue;
        
        const node = {
            type,
        };
        
        if (condition(node))
            return createPath({
                dir,
                type,
                filesystem,
                isStop,
            });
    } while ((dir = dirname(dir)) !== '/');
    return null;
};

const createGetPrevSibling = ({dir, filesystem, isStop}) => () => {
    const {readDirectory} = filesystem;
    const currentName = basename(dir);
    const parentDir = dirname(dir);
    const files = readDirectory(parentDir);
    let nextIndex = -1;
    
    for (const {name} of files) {
        if (name === currentName) {
            nextIndex = Number(name) - 1;
            break;
        }
    }
    
    const {name: nextName = 'not-found'} = files[nextIndex] || {};
    
    const nextDir = join(parentDir, nextName);
    
    if (nextName === 'not-found')
        return createPath({
            dir: nextDir,
            filesystem,
            isStop,
        });
    
    const type = readType(nextDir, filesystem);
    
    return createPath({
        dir: nextDir,
        type,
        filesystem,
        isStop,
    });
};

const createGetNextSibling = ({dir, filesystem, isStop}) => () => {
    const {readDirectory} = filesystem;
    const currentName = basename(dir);
    const parentDir = dirname(dir);
    const files = readDirectory(parentDir);
    let nextIndex = -1;
    
    for (const {name} of files) {
        if (name === currentName) {
            nextIndex = Number(name) + 1;
            break;
        }
    }
    
    const {name: nextName = 'not-found'} = files[nextIndex] || {};
    
    const nextDir = join(parentDir, nextName);
    
    if (nextName === 'not-found')
        return createPath({
            dir: nextDir,
            filesystem,
            isStop,
        });
    
    const type = readType(nextDir, filesystem);
    
    return createPath({
        dir: nextDir,
        type,
        filesystem,
        isStop,
    });
};

const SEP = '/';

const createGet = ({dir, filesystem, isStop}) => (query) => {
    const newQuery = query
        .split('.')
        .join(SEP);
    
    const newDir = join(dir, newQuery);
    const type = readType(newDir, filesystem);
    
    return createPath({
        dir: newDir,
        type,
        filesystem,
        isStop,
    });
};

const createReplaceWith = (path, {dir, filesystem}) => {
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

const createRemove = ({dir, type, filesystem}) => () => {
    const {
        removeFile,
        readDirectory,
        renameFile,
    } = filesystem;
    
    const node = {
        type,
    };
    
    if (isVariableDeclarator(node))
        dir = dirname(dirname(dir));
    
    const [error] = tryCatch(removeFile, dir);
    
    if (error)
        return;
    
    const name = basename(dir);
    
    /* c8 ignore start */
    if (isNaN(name))
        return;
    
    /* c8 ignore end */
    const dirName = dirname(dir);
    const files = readDirectory(dirName);
    const count = files.length;
    
    /* c8 ignore start */
    if (!count)
        return;
    
    /* c8 ignore end */
    /* c8 ignore start */
    if (count === name)
        return;
    
    /* c8 ignore end */
    for (let i = Number(name); i < count; i++) {
        const fromName = join(dirName, String(i + 1));
        const toName = join(dirName, String(i));
        
        renameFile(fromName, toName);
    }
};

const isNode = (files) => {
    for (const {name} of files) {
        if (name === 'type')
            return true;
    }
    
    return false;
};

/* c8 ignore start */
function readProperties(filename, files, {dir, type, filesystem, isStop}) {
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
                isStop,
            });
            
            result[name] = node;
            continue;
        }
        
        result[name] = readFileContent(currentName);
    }
    
    return result;
} /* c8 ignore end */
/* c8 ignore end */
