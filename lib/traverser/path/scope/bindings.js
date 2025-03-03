import {types} from '@putout/babel';

const {assign} = Object;

const {
    isIdentifier,
    isProgram,
    isBlockStatement,
    isFunctionDeclaration,
    isVariableDeclaration,
    isBlock,
} = types;

export const createBindings = (path) => {
    while (!isBlock(path)) {
        path = path.parentPath;
    }
    
    return parseBindings(path, {
        topLevel: true,
    });
};

function parseBindings(path, {topLevel = false} = {}) {
    const bindings = {};
    
    if (isProgram(path)) {
        for (const current of path.get('body')) {
            assign(bindings, parseBindings(current));
        }
        
        return bindings;
    }
    
    if (isBlockStatement(path) && topLevel) {
        for (const current of path.get('body'))
            assign(bindings, parseBindings(current));
        
        return bindings;
    }
    
    if (isVariableDeclaration(path)) {
        for (const declaration of path.get('declarations'))
            assign(bindings, parseBindings(declaration.get('id')));
        
        return bindings;
    }
    
    if (isFunctionDeclaration(path))
        return {
            [path.node.id.name]: path,
        };
    
    if (isIdentifier(path))
        return {
            [path.node.name]: path,
        };
    
    return bindings;
}
