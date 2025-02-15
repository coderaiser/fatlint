import {test} from 'supertape';
import {createFilesystem} from '#filesystem';
import {traverse} from './traverser.js';
import {createDisk} from '../fatdisk.js';
import {writeAST} from '../fsast.js';

test('flatlint: traverser', async (t) => {
    const disk = await createDisk();
    const filesystem = createFilesystem(disk);
    
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
    
    traverse(filesystem, {
        ExpressionStatement(path) {
            console.log(path);
        },
    });
    
    const expected = [
        '/program/body/0/type',
        '/program/body/0/expression/type',
    ];
    
    t.ok(expected);
    t.end();
});

