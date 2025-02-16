import putout from 'putout';
import {readAST} from '../fsast.js';

export const print = (filesystem) => {
    const newAst = readAST('/', {
        filesystem,
    });
    
    return putout.print(newAst);
};

