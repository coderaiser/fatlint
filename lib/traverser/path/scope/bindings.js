import {join} from 'node:path';
import {types} from '@putout/babel';
import tryCatch from 'try-catch';
import {CreatePath, Dir} from '../../symbols.js';

const {assign, entries} = Object;

const {
    isIdentifier,
    isProgram,
    isBlockStatement,
    isFunctionDeclaration,
    isVariableDeclaration,
    isBlock,
} = types;

export const createBindings = (path, {filesystem, isStop}) => {
    const {
        readDirectory,
        readFileContent,
        writeFileContent,
    } = filesystem;
    
    while (!isBlock(path)) {
        path = path.parentPath;
    }
    
    const bindingsDir = join('/bindings', path[Dir]);
    const [error, files] = tryCatch(readDirectory, bindingsDir);
    
    if (!error) {
        const bindings = {};
        
        for (const {name: fileName} of files) {
            const currentDir = join(bindingsDir, fileName);
            const namePath = join(currentDir, 'name');
            
            const name = readFileContent(namePath);
            
            const linkPath = join(currentDir, 'link');
            const link = readFileContent(linkPath);
            const [error, type] = tryCatch(readFileContent, join(link, 'type'));
            
            if (error)
                continue;
            
            bindings[name] = path[CreatePath]({
                dir: link,
                type,
                filesystem,
                isStop,
            });
        }
        
        return bindings;
    }
    
    const bindings = parseBindings(path, {
        topLevel: true,
    });
    
    for (const [index, [name, path]] of entries(entries(bindings))) {
        const currentDir = join(bindingsDir, index);
        const namePath = join(currentDir, 'name');
        const linkPath = join(currentDir, 'link');
        
        writeFileContent(namePath, name);
        writeFileContent(linkPath, path[Dir]);
    }
    
    return bindings;
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

