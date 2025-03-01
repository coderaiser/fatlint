import {test} from 'supertape';
import montag from 'montag';
import {parse} from 'putout';
import {
    createFilesystem,
    traverse,
} from '#fatlint';
import {createDisk} from '#fatdisk';
import {writeAST} from '#fsast';

test('fatlint: traverser: scope', async (t) => {
    const disk = await createDisk();
    const filesystem = createFilesystem(disk);
    const source = montag`
        function m() {
            const a = 3;
        }
    `;
    
    const ast = parse(source);
    
    writeAST({ast}, {
        filesystem,
    });
    
    let uid = 0;
    
    traverse(filesystem, {
        VariableDeclaration(path) {
            ({uid} = path.scope);
        },
    });
    
    t.ok(uid > 0);
    t.end();
});

test('fatlint: traverser: scope: uid', async (t) => {
    const disk = await createDisk();
    const filesystem = createFilesystem(disk);
    const source = montag`
        const a = 2;
        function m() {
            const a = 3;
            
            return () => {
                const x = 5;
            }
        }
    `;
    
    const ast = parse(source);
    
    writeAST({ast}, {
        filesystem,
    });
    
    const uids = [];
    
    traverse(filesystem, {
        VariableDeclaration(path) {
            uids.push(path.scope.uid);
        },
    });
    
    const result = uids.filter(Number);
    
    t.ok(result, uids);
    t.end();
});

test('fatlint: traverser: scope: uid: again', async (t) => {
    const disk = await createDisk();
    const filesystem = createFilesystem(disk);
    const source = montag`
        const a = 2;
    `;
    
    const ast = parse(source);
    
    writeAST({ast}, {
        filesystem,
    });
    
    const uids = [];
    
    traverse(filesystem, {
        VariableDeclaration: {
            enter: [
                (path) => {
                    uids.push(path.scope.uid);
                },
                (path) => {
                    uids.push(path.scope.uid);
                },
            ],
        },
    });
    
    t.equal(uids.length, 2);
    t.end();
});

test('fatlint: traverser: scope: uid: again: block', async (t) => {
    const disk = await createDisk();
    const filesystem = createFilesystem(disk);
    const source = montag`
        const a = 2;
        const b = 3;
    `;
    
    const ast = parse(source);
    
    writeAST({ast}, {
        filesystem,
    });
    
    const uids = [];
    
    traverse(filesystem, {
        VariableDeclaration: {
            enter: [
                (path) => {
                    uids.push(path.scope.uid);
                },
            ],
        },
    });
    
    t.equal(uids.length, 2);
    t.end();
});
