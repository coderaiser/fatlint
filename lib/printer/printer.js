import putout from 'putout';
import jessy from 'jessy';
import {readAST} from '#fsast';

export const print = (filesystem, dir = '/ast') => {
    const result = readAST(dir, {
        filesystem,
    });
    
    const ast = jessy(dir, '/', result);
    
    return putout.print(ast);
};
