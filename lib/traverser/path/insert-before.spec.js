import {test} from 'supertape';
import montag from 'montag';
import {
    parse,
    print,
    template,
} from 'putout';
import {
    createFilesystem,
    traverse,
} from '#fatlint';
import {createDisk} from '../../fatdisk.js';
import {readAST, writeAST} from '../../fsast.js';

test('fatlint: traverser: insertBefore', async (t) => {
    const disk = await createDisk();
    const filesystem = createFilesystem(disk);
    const source = montag`
        function m() {}
        const a = 'hello';
    `;
    
    const ast = parse(source);
    
    writeAST(ast, {
        filesystem,
    });
    
    traverse(filesystem, {
        FunctionDeclaration(path) {
            path.insertBefore(template.ast('const b = 3'));
            path.stop();
        },
    });
    
    const newAst = readAST('/', {
        filesystem,
    });
    
    const code = print(newAst);
    
    const expected = montag`
        const b = 3;
        function m() {}
        
        const a = 'hello';\n
    `;
    
    t.equal(code, expected);
    t.end();
});
