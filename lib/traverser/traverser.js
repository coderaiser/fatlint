import {dirname} from 'node:path/posix';
import {join} from 'node:path';
import tryCatch from 'try-catch';
import fullstore from 'fullstore';
import {types} from 'putout';
import {createPath} from './path/path.js';
import {Dir} from './symbols.js';

const {isFunction, isIdentifier} = types;

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
        
        const dir = dirname(path);
        
        const [error, type] = tryCatch(readFileContent, path);
        
        if (error)
            continue;
        
        if (visitors.ReferencedIdentifier) {
            traverseReferencedIdentifier({
                visit: visitors.ReferencedIdentifier,
                type,
                dir,
                filesystem,
                isStop,
            });
            continue;
        }
        
        let visit = visitors[type];
        
        if (!visit && isFunction({type}))
            visit = visitors.Function;
        
        if (visit)
            for (const currentVisit of parseVisit(visit)) {
                currentVisit(createPath({
                    dir,
                    type,
                    filesystem,
                    isStop,
                }));
            }
    }
};

function parseVisit(visit) {
    if (isFn(visit))
        return [visit];
    
    return maybeArray(visit.enter);
}

function traverseReferencedIdentifier({type, visit, dir, filesystem, isStop}) {
    const {readFileContent} = filesystem;
    
    if (!isIdentifier({type}))
        return;
    
    const name = readFileContent(join(dir, 'name'));
    
    const currentPath = createPath({
        dir,
        type,
        filesystem,
        isStop,
    });
    
    const bindings = currentPath.scope.getAllBindings();
    const currentBinding = bindings[name];
    
    if (currentBinding[Dir] !== currentPath[Dir])
        visit(currentPath);
}
