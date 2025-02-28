import putout from 'putout';
import {readAST} from '../fsast.js';

export const print = (filesystem) => {
    const {ast} = readAST('/ast', {
        filesystem,
    });
    
    return putout.print(ast);
};
