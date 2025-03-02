import {test} from 'supertape';
import montag from 'montag';
import {parse} from 'putout';
import {
    createDisk,
    createFilesystem,
    traverse,
} from '#fatlint';
import {writeAST} from '#fsast';

test('fatlint: traverser: scope: bindings', async (t) => {
    const disk = await createDisk();
    const filesystem = createFilesystem(disk);
    const source = montag`
        const a = 2;
    `;
    
    const ast = parse(source);
    
    writeAST({ast}, {
        filesystem,
    });
    
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
    const filesystem = createFilesystem(disk);
    const source = montag`
        const a = 2;
        function x() {}
    `;
    
    const ast = parse(source);
    
    writeAST({ast}, {
        filesystem,
    });
    
    let names = [];
    
    traverse(filesystem, {
        VariableDeclaration(path) {
            names = Object.keys(path.scope.bindings);
        },
    });
    
    t.deepEqual(names, ['a', 'x']);
    t.end();
});

