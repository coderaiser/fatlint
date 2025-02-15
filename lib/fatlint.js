import {parse, print} from 'putout';
import {createFilesystem} from '#filesystem';
import {createDisk} from './fatdisk.js';
import {readAST, writeAST} from './fsast.js';

const {assign} = Object;

export const lint = async (source) => {
    const disk = await createDisk();
    const ast = parse(source);
    const {tokens} = ast;
    const filesystem = createFilesystem(disk);
    
    delete ast.tokens;
    
    writeAST(ast, {
        filesystem,
    });
    
    const newAst = readAST('/', {
        filesystem,
    });
    
    assign(newAst, {
        tokens,
    });
    
    const result = print(newAst);
    
    return [result];
};
