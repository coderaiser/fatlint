import {FatFsDisk} from 'fatfs-wasm';

const KB = 1024;
const SIZE = 1000 * KB;

export const createDisk = async (size = SIZE) => {
    const data = new Uint8Array(size);
    const disk = await FatFsDisk.create(data);
    
    disk.mkfs();
    disk.mount();
    
    return disk;
};
