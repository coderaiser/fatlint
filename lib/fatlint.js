import process from 'node:process';
import {FatFsDisk, FatFsFormat} from 'fatfs-wasm';
import {createFilesystem} from './filesystem/filesystem.js';
import {
    read,
    walk,
    write,
} from './fsast.js';

const data = new Uint8Array(1 << 500);
const disk = await FatFsDisk.create(data);

disk.mkfs();
disk.mount();

const {
    createDirectory,
    writeFileContent,
    readFileContent,
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

const list = walk(disk);
console.log('xxx', list);

console.log(read(disk));
//dir.close();

//dir.close();
