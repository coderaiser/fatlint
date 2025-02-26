import {test} from 'supertape';

test('fatlint: exports: traverse', async (t) => {
    const {traverse} = await import('fatlint');
    const {traverse: expected} = await import('#traverser');
    
    t.equal(traverse, expected);
    t.end();
});

test('fatlint: exports: createFilesystem', async (t) => {
    const {createFilesystem} = await import('fatlint');
    const {createFilesystem: expected} = await import('../lib/filesystem/filesystem.js');
    
    t.equal(createFilesystem, expected);
    t.end();
});

test('fatlint: exports: parse', async (t) => {
    const {parse} = await import('fatlint');
    const {parse: expected} = await import('#parser');
    
    t.equal(parse, expected);
    t.end();
});

test('fatlint: exports: print', async (t) => {
    const {print} = await import('fatlint');
    const {print: expected} = await import('#printer');
    
    t.equal(print, expected);
    t.end();
});

test('fatlint: exports: createDisk', async (t) => {
    const {createDisk} = await import('fatlint');
    const {createDisk: expected} = await import('#fatdisk');
    
    t.equal(createDisk, expected);
    t.end();
});
