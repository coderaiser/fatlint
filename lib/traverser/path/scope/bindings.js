import {dirname} from 'node:path';
import {types} from '@putout/babel';
import {getParentPath} from '../../get-parent-path.js';
import {isBlockType} from '../../is-block-type.js';
import {readNode} from '../node/read.js';

const {
    isIdentifier,
    isProgram,
    isBlockStatement,
    isFunctionDeclaration,
    isVariableDeclaration,
    isClassDeclaration,
    isObjectPattern,
    isArrayPattern,
} = types;

const {isArray} = Array;

export const createBindings = (path, {type, dir, filesystem}) => {
    const bindings = {};
    
    while (!isBlockType(type)) {
        dir = dirname(dir);
        [dir, type] = getParentPath(dir, filesystem);
    }
    
    const node = readNode(dir, filesystem);
    const names = parseNames(node);
    
    for (const name of names) {
        bindings[name] = {};
    }
    
    return bindings;
};

/* c8 ignore start */
function parseNames(node, {topLevel = false} = {}) {
    const names = [];
    
    if (isArray(node)) {
        for (const current of node)
            names.push(...parseNames(current));
        
        return names;
    }
    
    if (isProgram(node)) {
        for (const current of node.body)
            names.push(...parseNames(current));
        
        return names;
    }
    
    if (isBlockStatement(node) && topLevel) {
        for (const current of node.body)
            names.push(...parseNames(current));
        
        return names;
    }
    
    if (isVariableDeclaration(node)) {
        for (const {id} of node.declarations) {
            names.push(...parseNames(id));
        }
        
        return names;
    }
    
    if (isFunctionDeclaration(node))
        return [node.id.name];
    
    if (isIdentifier(node))
        return [node.name];
    
    if (isObjectPattern(node)) {
        for (const property of node.properties)
            names.push(...parseNames(property.value));
        
        return names;
    }
    
    if (isArrayPattern(node)) {
        for (const element of node.elements)
            names.push(...parseNames(element));
        
        return names;
    }
    
    if (isClassDeclaration(node))
        return parseNames(node.id);
    
    return names;
}
/* c8 ignore end */
