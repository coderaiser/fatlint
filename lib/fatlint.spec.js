import {test} from 'supertape';
import montag from 'montag';
import {lint} from '#fatlint';

test('fatlint: source', async (t) => {
    const source = 'const a = 3';
    const [result] = await lint(source);
    const expected = 'const a = 3;\n';
    
    t.equal(result, expected);
    t.end();
});

test('fatlint: source: arrow function', async (t) => {
    const source = 'const a = () => 5';
    const [result] = await lint(source);
    const expected = 'const a = () => 5;\n';
    
    t.equal(result, expected);
    t.end();
});

test('fatlint: source: function', async (t) => {
    const source = montag`
        function hello() {
            return class X {
                #world = 's';
            };
        }\n
    `;
    
    const [result] = await lint(source);
    
    t.equal(result, source);
    t.end();
});
