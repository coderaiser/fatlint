import {test} from 'supertape';
import {longToShort} from './fatpath.js';
import {SHORT} from './short.js';

const {keys} = Object;

test('fatlint: fatpath: longToShort', (t) => {
    const result = longToShort('/program/directives');
    const expected = '/PROGRAM/DRCTVS';
    
    t.equal(result, expected);
    t.end();
});

test('fatlint: fatpath: longToShort: topLevelAwait', (t) => {
    const result = longToShort('/program/extra/topLevelAwait');
    const expected = '/PROGRAM/EXTRA/T_AWAIT';
    
    t.equal(result, expected);
    t.end();
});

test('fatlint: fatpath: check SHORT sizes', (t) => {
    for (const key of keys(SHORT)) {
        if (key.length > 8)
            return t.fail(`'${key}' is longer then 8 symbols, try '${key.slice(0, 8)}'`);
    }
    
    t.pass('all paths satisfy length < 8');
    t.end();
});

test('fatlint: fatpath: check SHORT sizes: is capitalized', (t) => {
    for (const key of keys(SHORT)) {
        const upper = key.toUpperCase();
        
        if (key !== upper)
            return t.fail(`'${key}' should be capitalized, use '${upper}'`);
    }
    
    t.pass('all paths satisfy length < 8');
    t.end();
});

