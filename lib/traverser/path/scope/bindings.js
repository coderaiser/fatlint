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
    isImportDeclaration,
} = types;

const isBlockOrProgram = (path) => isBlockStatement(path) || isProgram(path);

export const createBindings = (path, {filesystem, isStop}) => {
    while (!isBlockOrProgram(path)) {
        path = path.parentPath;
    }
    
    const [error, bindings] = tryCatch(readBindings, path, {
        isStop,
        filesystem,
    });
    
    if (!error)
        return bindings;
    
    const freshBindings = parseBindings(path, {
        topLevel: true,
    });
    
    writeBindings(path, {
        bindings: freshBindings,
        filesystem,
    });
    
    return freshBindings;
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
    
    if (isImportDeclaration(path)) {
        for (const spec of path.get('specifiers'))
            assign(bindings, parseBindings(spec.get('local')));
        
        return bindings;
    }
    
    return bindings;
}

function writeBindings(path, {bindings, filesystem}) {
    const bindingsDir = join('/bindings', path[Dir]);
    const {writeFileContent} = filesystem;
    
    for (const [index, [name, path]] of entries(entries(bindings))) {
        const currentDir = join(bindingsDir, index);
        const namePath = join(currentDir, 'name');
        const linkPath = join(currentDir, 'link');
        
        writeFileContent(namePath, name);
        writeFileContent(linkPath, path[Dir]);
    }
}

function readBindings(path, {isStop, filesystem}) {
    const {
        readDirectory,
        readFileContent,
    } = filesystem;
    
    const bindingsDir = join('/bindings', path[Dir]);
    const files = readDirectory(bindingsDir);
    
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
