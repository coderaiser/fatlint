import {test} from 'supertape';
import montag from 'montag';
import {
    createDisk,
    parse,
    traverse,
} from '#fatlint';

test('fatlint: traverser: path: scope: getAllBindings()', async (t) => {
    const disk = await createDisk();
    const source = montag`
        const a = 3;
        {
            const b = 4;
        }
    `;
    
    const filesystem = parse(source, disk);
    
    const result = [];
    
    traverse(filesystem, {
        VariableDeclarator(path) {
            if (path.node.id.name !== 'b')
                return;
            
            const keys = Object.keys(path.scope.getAllBindings());
            
            result.push(...keys);
        },
    });
    
    const expected = [
        'b',
        'a',
    ];
    
    t.deepEqual(result, expected);
    t.end();
});
