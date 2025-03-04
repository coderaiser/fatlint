import {test} from 'supertape';
import {lint} from '#fatlint';

test('fatlint: fatpath: call', async (t) => {
    const source = 'maybeFn(x);';
    
    const [code] = await lint(source, {
        plugins: [
            ['declare', {
                report: () => '',
                include: () => ['CallExpression'],
                fix: (path) => path.remove(),
            }],
        ],
    });
    
    const expected = '\n';
    
    t.equal(code, expected);
    t.end();
});
