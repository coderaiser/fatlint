import {test} from 'supertape';
import montag from 'montag';
import {parse} from 'putout';
import {
    createDisk,
    createFilesystem,
    traverse,
} from '#fatlint';
import {writeAST} from '#fsast';

test('fatlint: traverser: scope: hasOwnBinding', async (t) => {
    const disk = await createDisk();
    const filesystem = createFilesystem(disk);
    const source = montag`
        const a = 2;
    `;
    
    const ast = parse(source);
    
    writeAST({ast}, {
        filesystem,
    });
    
    let is = false;
    
    traverse(filesystem, {
        VariableDeclaration(path) {
            is = path.scope.hasOwnBinding('a');
        },
    });
    
    t.ok(is);
    t.end();
});

