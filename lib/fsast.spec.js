import {test} from 'supertape';
import {parse, print} from 'putout';
import {createDisk} from './fatdisk.js';
import {readAST, writeAST} from './fsast.js';

test('fatlint: fsast', async (t) => {
    const object = {
        loc: {
            start: {
                line: 1,
                column: 0,
            },
            end: {
                line: 1,
                column: 0,
            },
        },
        type: 'File',
    };
    
    const disk = await createDisk();
    
    writeAST(disk, object);
    const result = readAST('/', {disk});
    
    t.deepEqual(result, object);
    t.end();
});

test('fatlint: fsast: parse', async (t) => {
    const source = 'const a = 3';
    const ast = parse(source);
    const disk = await createDisk();
    
    writeAST(disk, ast);
    
    const newAst = readAST('/', {disk});
    const result = print(newAst);
    const expected = 'const a = 3;\n';
    
    t.equal(result, expected);
    t.end();
});
