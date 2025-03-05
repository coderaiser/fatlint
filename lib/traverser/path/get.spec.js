import {test} from 'supertape';
import {types} from 'putout';
import montag from 'montag';
import {createDisk, traverse} from '#fatlint';
import {parse} from '#parser';
import {print} from '#printer';

const {NumericLiteral} = types;

test('fatlint: traverser: path.get()', async (t) => {
    const disk = await createDisk();
    const source = `const a = 'hello'; const b = 'world';`;
    const filesystem = parse(source, disk);
    
    traverse(filesystem, {
        VariableDeclarator(path) {
            const initPath = path.get('init');
            const {value} = initPath.node;
            
            if (value === 'hello')
                initPath.replaceWith(NumericLiteral(5));
        },
    });
    const code = print(filesystem);
    
    const expected = montag`
        const a = 5;
        const b = 'world';\n
    `;
    
    t.equal(code, expected);
    t.end();
});

test('fatlint: traverser: path.get(): nested', async (t) => {
    const disk = await createDisk();
    const source = `const a = 'hello';`;
    const filesystem = parse(source, disk);
    
    traverse(filesystem, {
        Program(path) {
            const initPath = path.get('body.0.declarations.0.init');
            const {value} = initPath.node;
            
            if (value === 'hello')
                initPath.replaceWith(NumericLiteral(5));
        },
    });
    
    const code = print(filesystem);
    
    const expected = montag`
        const a = 5;\n
    `;
    
    t.equal(code, expected);
    t.end();
});

test('fatlint: traverser: path.get(): body', async (t) => {
    const disk = await createDisk();
    const source = `function a() {const a = 'hello'; const b = 'world';}`;
    const filesystem = parse(source, disk);
    
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
    const source = `function a() {const a = 'hello'; const b = 'world';}`;
    const filesystem = parse(source, disk);
    
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

test('fatlint: traverser: path.get(): params', async (t) => {
    const disk = await createDisk();
    const source = montag`
        function a(b, c) {}
    `;
    
    const filesystem = parse(source, disk);
    
    traverse(filesystem, {
        Function(path) {
            const [first] = path.get('params');
            
            first.node.name = 'y';
        },
    });
    
    const result = print(filesystem);
    
    const expected = montag`
          function a(y, c) {}\n
    `;
    
    t.equal(result, expected);
    t.end();
});

test('fatlint: traverser: path: get: ImportDeclaration: specifiers', async (t) => {
    const disk = await createDisk();
    const source = montag`
        import {test} from 'supertape';
    `;
    
    const filesystem = parse(source, disk);
    
    traverse(filesystem, {
        ImportDeclaration(path) {
            const specifiersPath = path.get('specifiers');
            
            for (const specifier of specifiersPath) {
                specifier.node.local.name = 'x';
                specifier.node.imported.name = 'x';
            }
        },
    });
    const result = print(filesystem);
    
    const expected = montag`
         import {x} from 'supertape';\n
    `;
    
    t.equal(result, expected);
    t.end();
});
