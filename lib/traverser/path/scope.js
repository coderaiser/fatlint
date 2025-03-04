import {getUID} from './scope/uid.js';
import {createCrawl} from './scope/crawl.js';
import {createGetProgramParent} from './scope/get-program-parent.js';
import {createBindings} from './scope/bindings.js';
import {createHasOwnBinding} from './scope/has-own-binding.js';
import {createGetAllBindings} from './scope/get-all-bindings.js';

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
        hasOwnBinding: createHasOwnBinding(path, {
            dir,
            type,
            filesystem,
            isStop,
        }),
        getAllBindings: createGetAllBindings(path, {
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
                    isStop,
                });
            
            return target[prop];
        },
    });
};
