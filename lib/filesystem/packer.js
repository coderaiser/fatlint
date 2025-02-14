import {TextEncoder, TextDecoder} from 'node:util';

const {entries, fromEntries} = Object;
const isNull = (a) => !a && typeof a === 'object';
const swap = ([a, b]) => [b, a];
const reverse = (a) => fromEntries(entries(a).map(swap));

const PACK = {
    string: 's',
    number: 'n',
    boolean: 'b',
    null: '-',
    undefined: 'u',
};

const EXTRACT = reverse(PACK);

export const packContent = (content) => {
    const type = PACK[getType(content)];
    return new TextEncoder().encode(`${type}|${content}`);
};

export const extractContent = (uint8array) => {
    const data = new TextDecoder().decode(uint8array);
    const content = data.slice(2);
    const type = EXTRACT[data.slice(0, 1)];
    
    if (type === 'string')
        return content;
    
    if (type === 'boolean')
        return content === 'true';
    
    if (type === 'number')
        return Number(content);
    
    if (type === 'null')
        return null;
    
    if (type === 'undefined')
        return undefined;
};

function getType(a) {
    if (isNull(a))
        return 'null';
    
    return typeof a;
}/*
function reverse(a) {
    const result = {};
    
    for (const [key, value] of entries(a)) {
        result[value] = key;
    }
    
    return result;
}
 */

