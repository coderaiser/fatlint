import {createBindings} from './bindings.js';

const {keys} = Object;
const createIncludes = (bindings) => (name) => keys(bindings).includes(name);

export const createHasOwnBinding = (path, {dir, type, filesystem, isStop}) => {
    const bindings = createBindings(path, {
        dir,
        type,
        filesystem,
        isStop,
    });
    
    return createIncludes(bindings);
};
