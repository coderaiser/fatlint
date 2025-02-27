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

test('fatlint: source: runPlugins', async (t) => {
    const duplicator = {
        report: () => '',
        fix: (path) => {
            path.remove();
        },
        traverse: ({push}) => ({
            DebuggerStatement(path) {
                push(path);
            },
        }),
    };
    
    const source = 'debugger';
    
    const [, places] = await lint(source, {
        plugins: [
            ['duplicator', duplicator],
        ],
    });
    
    const expected = [{
        message: '',
        position: {
            column: 0,
            line: 1,
        },
        rule: 'duplicator',
    }];
    
    t.deepEqual(places, expected);
    t.end();
});
