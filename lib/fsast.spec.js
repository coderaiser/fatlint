import {test} from 'supertape';
import {createDisk} from './fatdisk.js';
import {read, write} from './fsast.js';

test('fatlint: fsast', async (t) => {
    const object = {
        loc: {
            start: {
                lint: 1,
                column: 0,
            },
            end: {
                lint: 1,
                column: 0,
            },
        },
        type: 'File',
    };
    
    const disk = await createDisk();
    
    write(disk, object);
    const result = read(disk);
    
    t.deepEqual(result, object);
    t.end();
});

