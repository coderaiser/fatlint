import {getUID} from './scope/uid.js';
import {createCrawl} from './scope/crawl.js';
import {createGetProgramParent} from './scope/get-program-parent.js';
import {createBindings} from './scope/bindings.js';

export const createScope = (path, {dir, type, filesystem, isStop}) => {
    const scope = {
        path,
        crawl: createCrawl(),
        getProgramParent: createGetProgramParent(path, {
            dir,
            type,
            filesystem,
            isStop,
        }),
    };
    
    return new Proxy(scope, {
        get(target, prop) {
            if (prop === 'uid')
                return getUID({
                    dir,
                    type,
                    filesystem,
                });
            
            if (prop === 'bindings')
                return createBindings(path, {
                    dir,
                    type,
                    filesystem,
                });
            
            return target[prop];
        },
    });
};
