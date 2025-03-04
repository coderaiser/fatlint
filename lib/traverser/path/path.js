import {join, dirname} from 'node:path';
import {Dir} from 'node:fs';
import tryCatch from 'try-catch';
import {types} from '@putout/babel';
import {print} from '#printer';
import {CreatePath, ReadNode} from '../symbols.js';
import {createReadNode, readNode} from './node/read.js';
import {createRemove} from './remove.js';
import {createReplaceWith} from './replace-with.js';
import {createReplaceWithMultiple} from './replace-with-multiple.js';
import {createInsertBefore} from './insert-before.js';
import {createInsertAfter} from './insert-after.js';
import {createGetNextSibling} from './get-next-sibling.js';
import {createGetPrevSibling} from './get-prev-sibing.js';
import {createFind} from './find.js';
import {getParentPath} from '../get-parent-path.js';
import {createScope} from './scope.js';
import {createGet} from './get.js';
import {createFindParent} from './find-parent.js';

const isSymbol = (a) => typeof a === 'symbol';

const {assign} = Object;

export const createPath = ({dir, type, filesystem, isStop}) => {
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
            
            return readNode(filename, filesystem);
        },
        set(target, prop, value) {
            const filename = join(dir, prop);
            
            writeFileContent(filename, value);
            
            return true;
        },
    });
    
    const toString = () => print(filesystem, dir);
    const path = {
        [CreatePath]: createPath,
        toString,
        [Symbol.toPrimitive]: toString,
        [Dir]: dir,
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
        get: createGet(path, {
            dir,
            filesystem,
            isStop,
        }),
        insertBefore: createInsertBefore(path),
        insertAfter: createInsertAfter(path),
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
        find: createFind(path, {
            dir,
            type,
            filesystem,
            isStop,
        }),
        findParent: createFindParent(path, {
            dir,
            type,
            filesystem,
            isStop,
        }),
    });
    
    const proxyPath = new Proxy(path, {
        get(target, prop) {
            if (isSymbol(prop))
                return target[prop];
            
            if (prop === 'parentPath') {
                const [currentDir, type] = getParentPath(dirname(dir), filesystem);
                
                return createPath({
                    dir: currentDir,
                    type,
                    filesystem,
                    isStop,
                });
            }
            
            if (prop === 'parent') {
                const [currentDir, type] = getParentPath(dirname(dir), filesystem);
                const {node} = createPath({
                    dir: currentDir,
                    type,
                    filesystem,
                    isStop,
                });
                
                return node;
            }
            
            if (prop.startsWith('is'))
                return types[prop].bind(null, {
                    type,
                });
            
            if (prop === 'scope')
                return createScope(proxyPath, {
                    dir,
                    type,
                    filesystem,
                    isStop,
                });
            
            return target[prop];
        },
    });
    
    return proxyPath;
};

const isNode = (files) => {
    for (const {name} of files) {
        if (name === 'type')
            return true;
    }
    
    return false;
};
