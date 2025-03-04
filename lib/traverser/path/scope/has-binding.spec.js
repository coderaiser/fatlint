import {test} from 'supertape';
import montag from 'montag';
import {parse} from '#parser';
import {createDisk, traverse} from '#fatlint';

test('fatlint: traverser: scope: hasBinding', async (t) => {
    const disk = await createDisk();
    const source = montag`
        const a = 2;
    `;
    
    const filesystem = parse(source, disk);
    
    let is = false;
    
    traverse(filesystem, {
        VariableDeclaration(path) {
            is = path.scope.hasBinding('a');
        },
    });
    
    t.ok(is);
    t.end();
});
