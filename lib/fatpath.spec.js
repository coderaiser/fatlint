import {test} from 'supertape';
import {longToShort} from './fatpath.js';

test('fatlint: fatpath: longToShort', (t) => {
    const result = longToShort('/program/directives');
    const expected = '/PROGRAM_/DRCTVS__';
    
    t.equal(result, expected);
    t.end();
});

test('fatlint: fatpath: longToShort: topLevelAwait', (t) => {
    const result = longToShort('/program/extra/topLevelAwait');
    const expected = '/PROGRAM_/EXTRA___/T_AWAIT_';
    
    t.equal(result, expected);
    t.end();
});
