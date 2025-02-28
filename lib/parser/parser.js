import putout from 'putout';
import {createFilesystem} from '#fatlint';
import {writeAST} from '../fsast.js';

export const parse = (source, disk, filesystem = createFilesystem(disk)) => {
    const ast = putout.parse(source);
    const root = {
        ast,
    };
    
    writeAST(root, {
        filesystem,
    });
    
    return filesystem;
};
