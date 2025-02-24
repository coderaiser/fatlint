import putout from 'putout';
import {createFilesystem} from '#fatlint';
import {writeAST} from '../fsast.js';

export const parse = (source, disk, filesystem = createFilesystem(disk)) => {
    const ast = putout.parse(source);
    
    writeAST(ast, {
        filesystem,
    });
    
    return filesystem;
};
