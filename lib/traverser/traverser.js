import {join, dirname} from 'node:path/posix';
import tryCatch from 'try-catch';
import fullstore from 'fullstore';
import {types} from '@putout/babel';
import {createReplaceWithMultiple} from './path/replace-with-multiple.js';
import {createReadNode, readNode} from './node/read.js';
import {CreatePath, ReadNode} from './symbols.js';
import {createReplaceWith} from './path/replace-with.js';
import {createRemove} from './path/remove.js';
import {createGetNextSibling} from './path/get-next-sibling.js';
import {createGetPrevSibling} from './path/get-prev-sibing.js';
import {readType} from './read-type.js';
import {getParentPath} from './get-parent-path.js';
import {createFind} from './path/find.js';
import {createInsertAfter} from './path/insert-after.js';
import {createInsertBefore} from './path/insert-before.js';
import {createPath} from './path/path.js';

const {isArray} = Array;
const maybeArray = (a) => isArray(a) ? a : [a];
const isFn = (a) => typeof a === 'function';

const {assign} = Object;

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
            
            for (const currentVisit of parseVisit(visit)) {
                currentVisit(createPath({
                    dir,
                    type,
                    filesystem,
                    isStop,
                }));
            }
        }
    }
};

function parseVisit(visit) {
    if (isFn(visit))
        return [visit];
    
    return maybeArray(visit.enter);
}

