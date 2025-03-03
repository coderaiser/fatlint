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

const {NumericLiteral} = types;

test('fatlint: traverser: path.get()', async (t) => {
    const disk = await createDisk();
    const filesystem = createFilesystem(disk);
    const source = `const a = 'hello'; const b = 'world';`;
    const ast = parse(source);
    
    writeAST(ast, {
        filesystem,
    });
    
    traverse(filesystem, {
        VariableDeclarator(path) {
            const initPath = path.get('init');
            const {value} = initPath.node;
            
            if (value === 'hello')
                initPath.replaceWith(NumericLiteral(5));
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

test('fatlint: traverser: path.get(): nested', async (t) => {
    const disk = await createDisk();
    const filesystem = createFilesystem(disk);
    const source = `const a = 'hello';`;
    const ast = parse(source);
    
    writeAST(ast, {
        filesystem,
    });
    
    traverse(filesystem, {
        Program(path) {
            const initPath = path.get('body.0.declarations.0.init');
            const {value} = initPath.node;
            
            if (value === 'hello')
                initPath.replaceWith(NumericLiteral(5));
        },
    });
    const newAst = readAST('/', {
        filesystem,
    });
    
    const code = print(newAst);
    
    const expected = montag`
        const a = 5;\n
    `;
    
    t.equal(code, expected);
    t.end();
});

test('fatlint: traverser: path.get(): body', async (t) => {
    const disk = await createDisk();
    const filesystem = createFilesystem(disk);
    const source = `function a() {const a = 'hello'; const b = 'world';}`;
    const ast = parse(source);
    
    writeAST(ast, {
        filesystem,
    });
    
    let type = '';
    
    traverse(filesystem, {
        Function(path) {
            ({type} = path.get('body'));
        },
    });
    
    t.equal(type, 'BlockStatement');
    t.end();
});

test('fatlint: traverser: path.get(): body: first', async (t) => {
    const disk = await createDisk();
    const filesystem = createFilesystem(disk);
    const source = `function a() {const a = 'hello'; const b = 'world';}`;
    const ast = parse(source);
    
    writeAST(ast, {
        filesystem,
    });
    
    let type = '';
    
    traverse(filesystem, {
        Function(path) {
            const [first] = path.get('body.body');
            
            ({type} = first);
        },
    });
    
    t.equal(type, 'VariableDeclaration');
    t.end();
});
