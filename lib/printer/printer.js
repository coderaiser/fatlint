import {basename} from 'node:path';
import putout from 'putout';
import {readAST} from '#fsast';

export const print = (filesystem, dir = '/ast') => {
    let {ast} = readAST(dir, {
        filesystem,
    });
    
    const base = basename(dir);
    
    if (base !== 'ast')
        ast = ast[base];
    
    return putout.print(ast);
};
