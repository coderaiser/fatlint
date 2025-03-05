import {test} from 'supertape';
import tryCatch from 'try-catch';
import {
    createFilesystem,
    createDisk,
} from '#fatlint';
import {print} from '#printer';
import {parse} from '#parser';
import {writeAST} from '#fsast';

test('flatlint: filesystem: findFile', async (t) => {
    const disk = await createDisk();
    const ast = {
        program: {
            body: [{
                type: 'ExpressionStatement',
                expression: {
                    type: 'StringLiteral',
                    value: 'hello',
                },
            }],
        },
    };
    
    writeAST(ast, {
        disk,
    });
    
    const {findFile} = createFilesystem(disk);
    const files = findFile('/program/body', 'type');
    
    const expected = [
        '/program/body/0/type',
        '/program/body/0/expression/type',
    ];
    
    t.deepEqual(files, expected);
    t.end();
});

test('flatlint: filesystem: rename', async (t) => {
    const disk = await createDisk();
    const source = `const a = 'hello'; const b =  'world'`;
    
    const filesystem = parse(source, disk);
    const {renameFile, removeFile} = filesystem;
    
    removeFile('/ast/program/body/0');
    renameFile('/ast/program/body/1', '/ast/program/body/0');
    
    const code = print(filesystem);
    const expected = `const b = 'world';\n`;
    
    t.equal(code, expected);
    t.end();
});

test('flatlint: filesystem: rename: error', async (t) => {
    const disk = await createDisk();
    const source = `const a = 'hello'; const b =  'world'`;
    
    const {renameFile, removeFile} = parse(source, disk);
    
    removeFile('/ast/program/body/0');
    const [error] = tryCatch(renameFile, '/ast/program/body/2', '/ast/program/body/3');
    const expected = '/ast/program/body/2 -> /ast/program/body/3: Error renaming file or directory: NO_FILE (4)';
    
    t.equal(error.message, expected);
    t.end();
});

test('flatlint: filesystem: createDirectory: error', async (t) => {
    const disk = await createDisk(1024 * 100);
    const source = `const a = 'hello'; const b =  'world'`;
    const [error] = tryCatch(parse, source, disk);
    const expected = `Error creating directory: DENIED (7)`;
    
    t.match(error.message, expected);
    t.end();
});
