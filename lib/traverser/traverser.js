import {dirname} from 'node:path/posix';
import tryCatch from 'try-catch';
import fullstore from 'fullstore';
import {types} from 'putout';
import {createPath} from './path/path.js';

const {isFunction} = types;

const {isArray} = Array;
const maybeArray = (a) => isArray(a) ? a : [a];
const isFn = (a) => typeof a === 'function';

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
        
        let visit = visitors[type];
        
        if (!visit && isFunction({type}))
            visit = visitors.Function;
        
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
