import putout from 'putout';
import {createFilesystem} from '#fatlint';
import {writeAST} from '../fsast.js';
import {createDisk} from '../fatdisk.js';

export const parse = (source, disk = createDisk()) => {
    const ast = putout.parse(source);
    const filesystem = createFilesystem(disk);
    
    writeAST(ast, {
        filesystem,
    });
    
    return filesystem;
};
