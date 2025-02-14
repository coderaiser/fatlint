import {test} from 'supertape';
import {parse, print} from 'putout';
import {createDisk} from './fatdisk.js';
import {read, write} from './fsast.js';

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
    
    write(disk, object);
    const result = read(disk);
    
    console.log(result);
    
    t.deepEqual(result, object);
    t.end();
});

test('fatlint: fsast: parse', async (t) => {
    const source = 'const a = 3';
    const ast = parse(source);
    const disk = await createDisk();
    
    write(disk, ast);
    const newAst = read(disk);
    
    console.log(newAst.program.body[0].declarations);
    const result = print(newAst);
    
    t.equal(result, source);
    t.end();
});
