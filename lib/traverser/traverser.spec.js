import {test} from 'supertape';
import montag from 'montag';
import {operator, types} from 'putout';
import {createFilesystem} from '#filesystem';
import {traverse, createDisk} from '#fatlint';
import {readAST, writeAST} from '#fsast';
import {parse} from '#parser';
import {print} from '#printer';

const {isArray} = Array;

const {setLiteralValue} = operator;
const {
    isIdentifier,
    isNumericLiteral,
    isVariableDeclarator,
} = types;

test('fatlint: traverser', async (t) => {
    const disk = await createDisk();
    const source = `const a = 'hello';`;
    const filesystem = parse(source, disk);
    
    traverse(filesystem, {
        StringLiteral(path) {
            setLiteralValue(path, 'world');
        },
    });
    
    const code = print(filesystem);
    const expected = `const a = 'world';\n`;
    
    t.equal(code, expected);
    t.end();
});

test('fatlint: traverser: remove', async (t) => {
    const disk = await createDisk();
    const source = `const a = 'hello'; const b = 'world';`;
    const filesystem = parse(source, disk);
    
    traverse(filesystem, {
        VariableDeclarator(path) {
            if (isIdentifier(path.node.id, {name: 'b'}))
                path.remove(path);
        },
    });
    
    const code = print(filesystem);
    const expected = `const a = 'hello';\n`;
    
    t.equal(code, expected);
    t.end();
});

test('fatlint: traverser: path.node: not found', async (t) => {
    const disk = await createDisk();
    const source = `const a = 'hello'; const b = 'world';`;
    const filesystem = parse(source, disk);
    
    let result = true;
    
    traverse(filesystem, {
        StringLiteral(path) {
            result = path.node.id;
        },
    });
    
    t.notOk(result);
    t.end();
});

test('fatlint: traverser: path.getNextSibling()', async (t) => {
    const disk = await createDisk();
    const source = `const a = 'hello'; const b = 'world'`;
    const filesystem = parse(source, disk);
    
    traverse(filesystem, {
        VariableDeclaration(path) {
            const nextPath = path.getNextSibling();
            nextPath.remove();
        },
    });
    
    const code = print(filesystem);
    
    const expected = montag`
        const a = 'hello';\n
    `;
    
    t.equal(code, expected);
    t.end();
});

test('fatlint: traverser: path.getNextSibling(): not-found', async (t) => {
    const disk = await createDisk();
    const source = `const a = 'hello';`;
    const filesystem = parse(source, disk);
    
    traverse(filesystem, {
        VariableDeclaration(path) {
            const nextPath = path.getNextSibling();
            nextPath.remove();
        },
    });
    
    const code = print(filesystem);
    
    const expected = montag`
        const a = 'hello';\n
    `;
    
    t.equal(code, expected);
    t.end();
});

test('fatlint: traverser: path.getPrevSibling()', async (t) => {
    const disk = await createDisk();
    const source = `const a = 'hello'; const b = 'world';`;
    const filesystem = parse(source, disk);
    
    traverse(filesystem, {
        VariableDeclaration(path) {
            const nextPath = path.getPrevSibling();
            nextPath.remove();
        },
    });
    const code = print(filesystem);
    
    const expected = montag`
        const b = 'world';\n
    `;
    
    t.equal(code, expected);
    t.end();
});

test('fatlint: traverser: path.find()', async (t) => {
    const disk = await createDisk();
    const source = `function x() {const a = 'hello';}`;
    const filesystem = parse(source, disk);
    
    traverse(filesystem, {
        StringLiteral(path) {
            const nextPath = path.find(isVariableDeclarator);
            nextPath.remove();
        },
    });
    const code = print(filesystem);
    
    const expected = montag`
        function x() {}\n
    `;
    
    t.equal(code, expected);
    t.end();
});

test('fatlint: traverser: path.find(): not found', async (t) => {
    const disk = await createDisk();
    const source = `function x() {const a = 'hello';}`;
    const filesystem = parse(source, disk);
    
    let result = true;
    
    traverse(filesystem, {
        StringLiteral(path) {
            result = path.find(isNumericLiteral);
        },
    });
    
    t.notOk(result);
    t.end();
});

test('fatlint: traverser: parentPath', async (t) => {
    const disk = await createDisk();
    const source = `function x() {const a = 'hello';}`;
    const filesystem = parse(source, disk);
    
    traverse(filesystem, {
        StringLiteral(path) {
            path.parentPath.remove();
        },
    });
    
    const code = print(filesystem);
    
    const expected = montag`
        function x() {}\n
    `;
    
    t.equal(code, expected);
    t.end();
});

test('fatlint: traverser: path.stop()', async (t) => {
    const disk = await createDisk();
    const source = `const a = 3; const b = 4;`;
    const filesystem = parse(source, disk);
    
    let result = 0;
    
    traverse(filesystem, {
        VariableDeclaration(path) {
            ++result;
            path.stop();
        },
    });
    
    t.equal(result, 1);
    t.end();
});

test('fatlint: traverser: type', async (t) => {
    const disk = await createDisk();
    const source = `function x() {const a = 3;}`;
    const filesystem = parse(source, disk);
    
    let type = '';
    
    traverse(filesystem, {
        VariableDeclaration(path) {
            ({type} = path.parentPath);
        },
    });
    
    t.equal(type, 'BlockStatement');
    t.end();
});

test('fatlint: traverser: enter', async (t) => {
    const disk = await createDisk();
    const source = `function x() {const a = 3;}`;
    const filesystem = parse(source, disk);
    
    let type = '';
    
    traverse(filesystem, {
        VariableDeclaration: {
            enter: (path) => ({type} = path.parentPath),
        },
    });
    
    t.equal(type, 'BlockStatement');
    t.end();
});

test('fatlint: traverser: enter: array', async (t) => {
    const disk = await createDisk();
    const source = `function x() {const a = 3;}`;
    const filesystem = parse(source, disk);
    
    let type = '';
    
    traverse(filesystem, {
        VariableDeclaration: {
            enter: [
                (path) => ({type} = path.parentPath),
            ],
        },
    });
    
    t.equal(type, 'BlockStatement');
    t.end();
});

test('fatlint: traverser: is-methods', async (t) => {
    const disk = await createDisk();
    const source = `function x() {const a = 3;}`;
    const filesystem = parse(source, disk);
    
    let is = false;
    
    traverse(filesystem, {
        VariableDeclaration: {
            enter: (path) => {
                is = path.isVariableDeclaration();
            },
        },
    });
    
    t.ok(is);
    t.end();
});

test('fatlint: traverser: parent', async (t) => {
    const disk = await createDisk();
    const source = `function x() {const a = 3;}`;
    const filesystem = parse(source, disk);
    let parent = false;
    
    traverse(filesystem, {
        VariableDeclaration(path) {
            ({parent} = path);
        },
    });
    
    t.equal(parent.type, 'BlockStatement');
    t.end();
});

test('fatlint: traverser: var: declarations', async (t) => {
    const disk = await createDisk();
    const source = `const a = 3;`;
    const filesystem = parse(source, disk);
    
    let is = false;
    
    traverse(filesystem, {
        VariableDeclaration(path) {
            const {declarations} = path.node;
            is = isArray(declarations);
        },
    });
    
    t.ok(is);
    t.end();
});

test('fatlint: traverser: path: string', async (t) => {
    const disk = await createDisk();
    const filesystem = createFilesystem(disk);
    const source = `const a = 3;\n`;
    
    parse(source, disk, filesystem);
    
    let result = '';
    
    traverse(filesystem, {
        Program(path) {
            result = String(path);
        },
    });
    
    t.equal(result, source);
    t.end();
});

