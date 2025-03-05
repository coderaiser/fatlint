import {test} from 'supertape';
import montag from 'montag';
import * as removeUnusedVariables from '@putout/plugin-remove-unused-variables';
import {lint} from '#fatlint';

test('fatlint: source', async (t) => {
    const source = 'const a = 3';
    const {code} = await lint(source);
    const expected = 'const a = 3;\n';
    
    t.equal(code, expected);
    t.end();
});

test('fatlint: source: arrow function', async (t) => {
    const source = 'const a = () => 5';
    const {code} = await lint(source);
    const expected = 'const a = () => 5;\n';
    
    t.equal(code, expected);
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
    
    const {code} = await lint(source);
    
    t.equal(code, source);
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
    
    const {places} = await lint(source, {
        fix: false,
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

test('fatlint: source: runPlugins: fix', async (t) => {
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
    
    const {code} = await lint(source, {
        plugins: [
            ['duplicator', duplicator],
        ],
    });
    
    const expected = '\n';
    
    t.equal(code, expected);
    t.end();
});

test('fatlint: source: runPlugins: remove-unused-variables', async (t) => {
    const source = 'const a = 5;';
    
    const {code} = await lint(source, {
        plugins: [
            ['remove-unused-variables', removeUnusedVariables],
        ],
    });
    
    const expected = '\n';
    
    t.equal(code, expected);
    t.end();
});

test('fatlint: source: runPlugins: declare', async (t) => {
    const source = 'noop';
    
    const {code} = await lint(source, {
        plugins: ['declare'],
    });
    
    const expected = montag`
        const noop = () => {};
        noop;\n
    `;
    
    t.equal(code, expected);
    t.end();
});

test('fatlint: source: runPlugins: putout-config', async (t) => {
    const source = montag`
        __putout_processor_json({
            "rules": {
                "putout-config": true
            }
       });
    `;
    
    const {code} = await lint(source, {
        plugins: ['putout-config'],
    });
    
    const expected = montag`
       __putout_processor_json({
           "rules": {
               "putout-config": "on"
           }
      });
    
    `;
    
    t.equal(code, expected);
    t.end();
});
