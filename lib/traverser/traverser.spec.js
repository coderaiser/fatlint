import {createFilesystem} from '#filesystem';
import {test} from 'supertape';
import {
    parse,
    print,
    operator,
    types,
} from 'putout';
import {traverse} from './traverser.js';
import {createDisk} from '../fatdisk.js';
import {readAST, writeAST} from '../fsast.js';

const {isIdentifier} = types;

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
