import {types} from 'putout';

const {assign} = Object;
const {
    isBlockStatement,
    isProgram,
} = types;

const isBlockOrProgram = (path) => isBlockStatement(path) || isProgram(path);

export const createGetAllBindings = (path) => () => {
    const {bindings} = path.scope;
    
    while (path = path.find(isBlockOrProgram)) {
        assign(bindings, path.scope.bindings);
        path = path.parentPath;
    }
    
    return bindings;
};
