import {join, dirname} from 'node:path/posix';
import {basename} from 'node:path';
import tryCatch from 'try-catch';
import fullstore from 'fullstore';
import {createReplaceWithMultiple} from './path/replace-with-multiple.js';
import {createReadNode} from './node/read.js';
import {
    CreatePath,
    ReadNode,
    ReadType,
} from './symbols.js';
import {createReplaceWith} from './path/replace-with.js';
import {createRemove} from './path/remove.js';
import {createGetNextSibling} from './path/get-next-sibling.js';
import {createGetPrevSibling} from './path/get-prev-sibing.js';

const {assign} = Object;

const readType = (dir, filesystem) => {
    const {readFileContent} = filesystem;
    
    const typePath = join(dir, 'type');
    const [, type] = tryCatch(readFileContent, typePath);
    
    return type;
};

const getParentPath = (dir, filesystem) => {
    const {readFileContent} = filesystem;
    
    const typePath = join(dir, 'type');
    const [, type] = tryCatch(readFileContent, typePath);
    
    if (!type)
        return getParentPath(dirname(dir), filesystem);
    
    return [dir, type];
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
        [ReadNode]: createReadNode({
            filesystem,
            dir,
        }),
    };
    
    const node = new Proxy(rawNode, {
        get(target, prop) {
            if (prop === ReadNode)
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
    
    const path = {
        [ReadType]: readType,
        [CreatePath]: createPath,
        type,
        node,
        stop,
    };
    
    assign(path, {
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
        getNextSibling: createGetNextSibling(path, {
            dir,
            filesystem,
            isStop,
        }),
        getPrevSibling: createGetPrevSibling(path, {
            dir,
            filesystem,
            isStop,
        }),
        find: createFind({
            dir,
            filesystem,
            isStop,
        }),
    });
    
    return new Proxy(path, {
        get(target, prop) {
            if (prop === 'parentPath') {
                const [currentDir, type] = getParentPath(dirname(dir), filesystem);
                
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
        
        //if (!type)
        //    continue;
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
