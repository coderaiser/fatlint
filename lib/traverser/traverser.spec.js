import {test} from 'supertape';
import montag from 'montag';
import {
    parse,
    print,
    operator,
    types,
} from 'putout';
import {createFilesystem} from '#filesystem';
import {traverse} from '#fatlint';
import {createDisk} from '../fatdisk.js';
import {readAST, writeAST} from '../fsast.js';

const {isIdentifier, NumericLiteral} = types;
const {setLiteralValue} = operator;

test('flatlint: traverser', async (t) => {
    const disk = await createDisk();
    const filesystem = createFilesystem(disk);
    const source = `const a = 'hello';`;
    const ast = parse(source);
    
    writeAST(ast, {
        filesystem,
    });
    
    traverse(filesystem, {
        StringLiteral(path) {
            setLiteralValue(path, 'world');
        },
    });
    
    const newAst = readAST('/', {
        filesystem,
    });
    
    const code = print(newAst);
    const expected = `const a = 'world';\n`;
    
    t.equal(code, expected);
    t.end();
});

test('flatlint: traverser: remove', async (t) => {
    const disk = await createDisk();
    const filesystem = createFilesystem(disk);
    const source = `const a = 'hello'; const b = 'world';`;
    const ast = parse(source);
    
    writeAST(ast, {
        filesystem,
    });
    
    traverse(filesystem, {
        VariableDeclarator(path) {
            if (isIdentifier(path.node.id, {name: 'b'}))
                path.remove(path);
        },
    });
    
    const newAst = readAST('/', {
        filesystem,
    });
    
    const code = print(newAst);
    const expected = `const a = 'hello';\n`;
    
    t.equal(code, expected);
    t.end();
});

test('flatlint: traverser: replaceWith', async (t) => {
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
                path.replaceWith(NumericLiteral(5));
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

test('flatlint: traverser: path.node: not found', async (t) => {
    const disk = await createDisk();
    const filesystem = createFilesystem(disk);
    const source = `const a = 'hello'; const b = 'world';`;
    const ast = parse(source);
    
    writeAST(ast, {
        filesystem,
    });
    
    let result = true;
    
    traverse(filesystem, {
        StringLiteral(path) {
            result = path.node.id;
        },
    });
    
    t.notOk(result);
    t.end();
});
