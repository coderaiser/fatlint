import {FatFsDisk} from 'fatfs-wasm';
import once from 'once';

const KB = 1024;
const MB = 1024 * KB;
const SIZE = 15 * MB;

export const createDisk = async (size = SIZE) => {
    const data = new Uint8Array(size);
    const disk = await FatFsDisk.create(data);
    
    disk.mkfs();
    disk.mount();
    
    return disk;
};

export const createDiskOnce = once(createDisk);

export const formatDisk = (disk) => {
    disk.unmount();
    disk.mkfs();
    disk.mount();
    
    return disk;
};
