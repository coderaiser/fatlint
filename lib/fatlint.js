import {FatFsDisk} from 'fatfs-wasm';
import {createFilesystem} from './filesystem/filesystem.js';
import {write} from './fsast.js';

const data = new Uint8Array(1 << 500);
const disk = await FatFsDisk.create(data);

disk.mkfs();
disk.mount();

const {
    createDirectory,
    writeFileContent,
} = createFilesystem(disk);

createDirectory('/program');
createDirectory('/interpreter');

createDirectory('/loc');
createDirectory('/loc/start');
createDirectory('/loc/end');

writeFileContent('/loc/start/line', '1');
writeFileContent('/loc/start/column', '0');

writeFileContent('/loc/end/line', '1');
writeFileContent('/loc/end/column', '0');

writeFileContent('/type', 'File');
//const content = readFileContent('/type', 'File');
/*
const dir = disk.openDir('/');

for (const file of dir) {
    file.isDirectory;
}
 
 */
write(disk, {
    hello: {
        abc: 'world',
    },
});

//dir.close();//dir.close();
