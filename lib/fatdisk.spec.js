import {test} from 'supertape';
import {createDisk} from './fatdisk.js';

test('fatlint: fatdisk: custom size', async (t) => {
    const disk = await createDisk(100_000);
    disk.mkfs();
    disk.mount();
    
    t.ok(disk);
    t.end();
});
