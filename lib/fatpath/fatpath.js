import {SHORT} from './short.js';

const {entries, fromEntries} = Object;
const swap = ([a, b]) => [b, a];
const reverse = (a) => fromEntries(entries(a).map(swap));

const LONG = reverse(SHORT);

export function longToShort(path) {
    const newParts = [];
    const parts = path
        .split('/')
        .slice(1);
    
    for (const part of parts) {
        let name = LONG[part];
        
        if (!name) {
            name = part.toUpperCase();
            LONG[part] = name;
        }
        
        newParts.push(name);
    }
    
    return `/${newParts.join('/')}`;
}

export function shortToLong(path) {
    const newParts = [];
    const parts = path
        .split('/')
        .slice(1);
    
    for (const part of parts) {
        let name = SHORT[part];
        
        if (!name) {
            name = part.toLowerCase();
            SHORT[part] = name;
        }
        
        newParts.push(name);
    }
    
    return `/${newParts.join('/')}`;
}

