import {join} from 'node:path/posix';
import {dirname} from 'node:path';
import tryCatch from 'try-catch';
import fullstore from 'fullstore';
import {types} from '@putout/babel';
import {getParentPath} from '../../get-parent-path.js';

const {
    isProgram,
    isBlockStatement,
} = types;

const UID = fullstore(0);

export const getUID = ({dir, type, filesystem}) => {
    const {
        readFileContent,
        writeFileContent,
    } = filesystem;
    
    const scopeDir = join('/scope', dir);
    const uidPath = join(scopeDir, 'uid');
    const [error, uid] = tryCatch(readFileContent, uidPath);
    
    if (!error)
        return uid;
    
    const newUid = readUID({
        type,
        dir,
        filesystem,
    });
    
    writeFileContent(uidPath, newUid);
    
    return newUid;
};

function readUID({dir, type, filesystem}) {
    const {
        readFileContent,
        writeFileContent,
    } = filesystem;
    
    let result = 0;
    
    while (type !== 'File') {
        if (isBlock(type)) {
            const scopeDir = join('/scope', dir);
            const uidPath = join(scopeDir, 'uid');
            const [error, uid] = tryCatch(readFileContent, uidPath);
            
            if (!error) {
                result = uid;
                break;
            }
            
            result = UID(UID() + 1);
            
            writeFileContent(uidPath, result);
            break;
        }
        
        dir = dirname(dir);
        
        [dir, type] = getParentPath(dir, filesystem);
    }
    
    return result;
}

const isBlock = (type) => {
    const node = {
        type,
    };
    
    if (isBlockStatement(node))
        return true;
    
    return isProgram(node);
};
