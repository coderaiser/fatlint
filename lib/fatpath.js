const {entries} = Object;
const ALIASES = {
    interpreter: 'INTER',
    sourceType: 'SRC_TYPE',
    type: 'TYPE',
    loc: 'LOC',
    start: 'START',
    end: 'END',
    lint: 'LINE',
    column: 'COLUMN',
};

export function longToShort(path) {
    for (const [long, short] of entries(ALIASES)) {
        path = path.replaceAll(long, short);
    }
    
    return path;
}

export function shortToLong(path) {
    for (const [long, short] of entries(ALIASES)) {
        path = path.replaceAll(short, long);
    }
    
    return path;
}

function reverse(object) {
    const result = {};
    
    for (const [key, value] of entries(object)) {
        result[value] = key;
    }
    
    return result;
}
