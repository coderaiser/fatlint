import {parse, print} from 'putout';
import {createFilesystem} from '#filesystem';
import {createDisk} from './fatdisk.js';

export {traverse} from '#traverser';
export {createFilesystem} from '#filesystem';

export const lint = async (source) => {
    const disk = await createDisk();
    const filesystem = parse(source, disk);
    
    const result = print(filesystem);
    return [result];
};
