import {test} from 'supertape';
import montag from 'montag';
import {
    createDisk,
    parse,
    traverse,
} from '#fatlint';

test('fatlint: traverser: path: find(): argument', async (t) => {
    const disk = await createDisk();
    const source = montag`
        const a = 3;
        {
            const b = 4;
        }
    `;
    
    const filesystem = parse(source, disk);
    
    let is = false;
    
    traverse(filesystem, {
        VariableDeclarator(path) {
            const isProgramPath = (path) => path.isProgram();
            is = path.find(isProgramPath);
            path.stop();
        },
    });
    
    t.ok(is);
    t.end();
});

