import {test} from 'supertape';
import {
    parse,
    print,
    types,
} from 'putout';
import montag from 'montag';
import {
    createFilesystem,
    traverse,
} from '#fatlint';
import {createDisk} from '#fatdisk';
import {readAST, writeAST} from '../../fsast.js';

const {numericLiteral} = types;

test('fatlint: traverser: replaceWith', async (t) => {
    const disk = await createDisk();
    const filesystem = createFilesystem(disk);
    const source = `const a = 'hello'; const b = 'world';`;
    const ast = parse(source);
    
    writeAST(ast, {
        filesystem,
    });
    
    traverse(filesystem, {
        StringLiteral(path) {
            const {value} = path.node;
            
            if (value === 'hello')
                path.replaceWith(numericLiteral(5));
        },
    });
    const newAst = readAST('/', {
        filesystem,
    });
    
    const code = print(newAst);
    
    const expected = montag`
        const a = 5;
        const b = 'world';\n
    `;
    
    t.equal(code, expected);
    t.end();
});
