import {types} from 'putout';

const {
    isProgram,
    isBlockStatement,
} = types;

export const isBlockType = (type) => {
    const node = {
        type,
    };
    
    if (isBlockStatement(node))
        return true;
    
    return isProgram(node);
};
