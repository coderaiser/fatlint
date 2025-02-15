import {test} from 'supertape';
import {createFilesystem} from './filesystem.js';
import {createDisk} from '../fatdisk.js';
import {readAST, writeAST} from '../fsast.js';

test('flatlint: filesystem: findFile', async (t) => {
    const disk = await createDisk();
    writeAST(disk, {
        program: {
            body: [{
                type: 'ExpressionStatement',
                expression: {
                    type: 'StringLiteral',
                    value: 'hello',
                },
            }],
        },
    });
    
    const ast = readAST(disk);
    const {
        findFile,
        readFileContent,
    } = createFilesystem(disk);
    
    console.log(readFileContent('/program/body/0/type'));
    
    const files = findFile('/program/body', 'type');
    
    const expected = [
        '/program/body/0/type',
        '/program/body/0/expression/type',
    ];
    
    t.deepEqual(files, expected);
    t.end();
});

