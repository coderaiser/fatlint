import {
    parse,
    print,
    operator,
} from 'putout';
import {test} from 'supertape';
import {createFilesystem} from '#filesystem';
import {traverse} from './traverser.js';
import {createDisk} from '../fatdisk.js';
import {readAST, writeAST} from '../fsast.js';

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
