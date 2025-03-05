import {test} from 'supertape';
import montag from 'montag';
import {createDiskOnce, formatDisk} from '#fatdisk';
import {
    createDisk,
    traverse,
    parse,
} from '#fatlint';

test('fatlint: traverser: scope: bindings', async (t) => {
    const disk = await createDisk();
    const source = montag`
        const a = 2;
    `;
    
    const filesystem = parse(source, disk);
    
    let name = '';
    
    traverse(filesystem, {
        VariableDeclaration(path) {
            [name] = Object.keys(path.scope.bindings);
        },
    });
    
    t.equal(name, 'a');
    t.end();
});

test('fatlint: traverser: scope: bindings: couple', async (t) => {
    const disk = await createDisk();
    const source = montag`
        const a = 2;
        function x() {}
    `;
    
    const filesystem = parse(source, disk);
    
    let names = [];
    
    traverse(filesystem, {
        VariableDeclaration(path) {
            names = Object.keys(path.scope.bindings);
        },
    });
    
    t.deepEqual(names, ['a', 'x']);
    t.end();
});

test('fatlint: traverser: scope: bindings: path', async (t) => {
    const disk = await createDisk();
    const source = montag`
        const a = 2;
    `;
    
    const filesystem = parse(source, disk);
    
    let is;
    
    traverse(filesystem, {
        VariableDeclaration(path) {
            is = path.scope.path === path;
        },
    });
    
    t.ok(is);
    t.end();
});

test('fatlint: traverser: scope: bindings: block: couple', async (t) => {
    const disk = await createDisk();
    const source = montag`
        {
            const a = 2;
            function x() {}
        }
    `;
    
    const filesystem = parse(source, disk);
    
    let names = [];
    
    traverse(filesystem, {
        BlockStatement(path) {
            names = Object.keys(path.scope.bindings);
            path.stop();
        },
    });
    
    t.deepEqual(names, ['a', 'x']);
    t.end();
});

test('fatlint: traverser: scope: bindings: assign', async (t) => {
    const disk = await createDiskOnce();
    formatDisk(disk);
    const source = montag`
        {
            let a = 2;
            function x() {}
            a = 3;
        }
    `;
    
    const filesystem = parse(source, disk);
    
    let names = [];
    
    traverse(filesystem, {
        BlockStatement(path) {
            names = Object.keys(path.scope.bindings);
            path.stop();
        },
    });
    
    t.deepEqual(names, ['a', 'x']);
    t.end();
});

test('fatlint: traverser: scope: bindings: ImportDeclaration', async (t) => {
    const disk = await createDiskOnce();
    formatDisk(disk);
    const source = montag`
        import {safeAlign} from 'eslint-plugin-putout';
        export default safeAlign;
    `;
    
    const filesystem = parse(source, disk);
    
    let names = [];
    
    traverse(filesystem, {
        Program(path) {
            names = Object.keys(path.scope.bindings);
            path.stop();
        },
    });
    
    t.deepEqual(names, ['safeAlign']);
    t.end();
});
