import {test} from 'supertape';
import {
    parse,
    print,
    template,
} from 'putout';
import montag from 'montag';
import {
    createFilesystem,
    traverse,
} from '#fatlint';
import {createDisk} from '#fatdisk';
import {readAST, writeAST} from '../../fsast.js';

test('fatlint: traverser: replaceWithMultiple', async (t) => {
    const disk = await createDisk();
    const filesystem = createFilesystem(disk);
    const source = `const a = 'hello';`;
    const ast = parse(source);
    
    writeAST(ast, {
        filesystem,
    });
    
    traverse(filesystem, {
        VariableDeclaration(path) {
            path.replaceWithMultiple([
                template.ast('a = 3'),
                template.ast('const b = 3'),
            ]);
        },
    });
    const newAst = readAST('/', {
        filesystem,
    });
    
    const code = print(newAst);
    
    const expected = montag`
        a = 3;
        const b = 3;\n
    `;
    
    t.equal(code, expected);
    t.end();
});

test('fatlint: traverser: replaceWithMultiple: next', async (t) => {
    const disk = await createDisk();
    const filesystem = createFilesystem(disk);
    const source = `const a = 'hello';`;
    const ast = parse(source);
    
    writeAST(ast, {
        filesystem,
    });
    
    traverse(filesystem, {
        VariableDeclaration(path) {
            path.replaceWithMultiple([
                template.ast('a = 3'),
                path.node,
            ]);
            path.stop();
        },
    });
    const newAst = readAST('/', {
        filesystem,
    });
    
    const code = print(newAst);
    
    const expected = montag`
        a = 3;
        const a = 'hello';\n
    `;
    
    t.equal(code, expected);
    t.end();
});

test('fatlint: traverser: replaceWithMultiple: first same', async (t) => {
    const disk = await createDisk();
    const filesystem = createFilesystem(disk);
    const source = `const a = 'hello';`;
    const ast = parse(source);
    
    writeAST(ast, {
        filesystem,
    });
    
    traverse(filesystem, {
        VariableDeclaration(path) {
            const {node} = path;
            path.replaceWithMultiple([node, template.ast('const b = 3')]);
        },
    });
    const newAst = readAST('/', {
        filesystem,
    });
    
    const code = print(newAst);
    
    const expected = montag`
        const a = 'hello';
        const b = 3;\n
    `;
    
    t.equal(code, expected);
    t.end();
});
