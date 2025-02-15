import {parse, print} from 'putout';
import {createDisk} from './fatdisk.js';
import {readAST, writeAST} from './fsast.js';

const {assign} = Object;

export const lint = async (source) => {
    const disk = await createDisk();
    const ast = parse(source);
    const {tokens} = ast;
    
    delete ast.tokens;
    
    writeAST(disk, ast);
    
    const newAst = readAST('/', {disk});
    assign(newAst, {
        tokens,
    });
    
    const result = print(newAst);
    
    return [result];
};
