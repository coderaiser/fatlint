import {join, basename} from 'node:path/posix';
import {dirname} from 'node:path';
import allObjectKeys from 'all-object-keys';
import jessy from 'jessy';
import {ReadNode} from '../symbols.js';

export const createReplaceWithMultiple = (path, {dir, filesystem}) => {
    const {
        removeFile,
        writeFileContent,
    } = filesystem;
    
    const SEP = '/';
    
    return (nodes) => {
        const parentDir = dirname(dir);
        const base = basename(dir);
        
        const isFirstSameNode = path.node === nodes[0];
        const newNodes = [];
        
        for (const [index, node] of nodes.entries()) {
            if (!index && isFirstSameNode) {
                newNodes.push(node);
                continue;
            }
            
            const newNode = node?.[ReadNode]?.() || node;
            
            newNodes.push(newNode);
        }
        
        for (const [index, node] of newNodes.entries()) {
            const currentDir = join(parentDir, String(Number(base) + index));
            
            if (!index && !isFirstSameNode)
                removeFile(dir);
            
            const keys = allObjectKeys(SEP, node);
            const values = [];
            
            for (const key of keys) {
                const filename = join(currentDir, key);
                const data = jessy(key, SEP, node);
                
                values.push([filename, data]);
            }
            
            for (const [filename, data] of values) {
                writeFileContent(filename, data);
            }
        }
        
        return path;
    };
};
