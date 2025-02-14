const {entries, fromEntries} = Object;
const swap = ([a, b]) => [b, a];
const reverse = (a) => fromEntries(entries(a).map(swap));

const SHORT = {
    BODY____: 'body',
    INTER___: 'interpreter',
    SRC_TYPE: 'sourceType',
    TYPE____: 'type',
    KIND____: 'kind',
    LOC_____: 'loc',
    START___: 'start',
    END_____: 'end',
    LINE____: 'line',
    COLUMN__: 'column',
    DRCTVS__: 'directives',
    DECLS___: 'declarations',
    PROGRAM_: 'program',
    T_AWAIT_: 'topLevelAwait',
    EXTRA___: 'extra',
    ERRORS__: 'errors',
    COMMENTS: 'comments',
    FILENAME: 'filename',
    P_PTR___: '__putout_printer',
    ID_NAME_: 'identifierName',
    //ID______: 'id',
    INDEX___: 'index',
    INIT____: 'init',
    VALUE___: 'value',
    //RAW_____: 'raw',
};
const LONG = reverse(SHORT);

export function longToShort(path) {
    for (const [long, short] of entries(LONG)) {
        path = path.replaceAll(long, short);
    }
    
    return path;
}

export function shortToLong(path) {
    for (const [long, short] of entries(SHORT)) {
        path = path.replaceAll(long, short);
    }
    
    return path;
}
