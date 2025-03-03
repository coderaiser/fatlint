import {test} from 'supertape';
import {
    parse,
    print,
    types,
} from 'putout';
import montag from 'montag';
import {
    createDisk,
    createFilesystem,
    traverse,
} from '#fatlint';
import {readAST, writeAST} from '#fsast';

const {isVariableDeclarator} = types;

test('fatlint: traverser: path.findParent()', async (t) => {
    const disk = await createDisk();
    const filesystem = createFilesystem(disk);
    const source = `function x() {const a = 'hello';}`;
    const ast = parse(source);
    
    writeAST(ast, {
        filesystem,
    });
    
    traverse(filesystem, {
        StringLiteral(path) {
            const nextPath = path.findParent(isVariableDeclarator);
            nextPath.remove();
        },
    });
    const newAst = readAST('/', {
        filesystem,
    });
    
    const code = print(newAst);
    
    const expected = montag`
        function x() {}\n
    `;
    
    t.equal(code, expected);
    t.end();
});
