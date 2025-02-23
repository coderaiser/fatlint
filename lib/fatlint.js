import {print} from '#printer';
import {parse} from '#parser';
import {createFilesystem} from '#filesystem';
import {createDisk} from './fatdisk.js';

export {traverse} from '#traverser';
export {
    parse,
    print,
    createFilesystem,
};

export const lint = async (source) => {
    const disk = await createDisk();
    const filesystem = parse(source, disk);
    
    const result = print(filesystem);
    
    return [result];
};
