import {test} from 'supertape';

test('fatlint: exports: traverse', async (t) => {
    const {traverse} = await import('fatlint');
    const {traverse: expected} = await import('../lib/traverser/traverser.js');
    
    t.equal(traverse, expected);
    t.end();
});

test('fatlint: exports: createFilesystem', async (t) => {
    const {createFilesystem} = await import('fatlint');
    const {createFilesystem: expected} = await import('../lib/filesystem/filesystem.js');
    
    t.equal(createFilesystem, expected);
    t.end();
});
