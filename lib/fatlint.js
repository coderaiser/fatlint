import {parse, print} from 'putout';
import {createDisk} from './fatdisk.js';
import {read, write} from './fsast.js';

const {assign} = Object;

export const lint = async (source) => {
    const disk = await createDisk();
    const ast = parse(source);
    const {tokens} = ast;
    
    delete ast.tokens;
    
    write(disk, ast);
    
    const newAst = read(disk);
    assign(newAst, {
        tokens,
    });
    
    const result = print(newAst);
    
    return [result];
};
