import {join} from 'node:path';

export const traverse = (filesystem, visitors) => {
    const paths = filesystem.findFile('/', 'type');
    
    for (const path of paths) {
        const type = filesystem.readFileContent(path);
        const visitor = visitors[type];
        
        if (visitor)
            visitor(path);
    }
};

