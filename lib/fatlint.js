import {runPlugins} from '@putout/engine-runner';
import {loadPluginsAsync} from '@putout/engine-loader';
import {print} from '#printer';
import {parse} from '#parser';
import {createFilesystem} from '#filesystem';
import {
    createDiskOnce,
    createDisk,
    formatDisk,
} from '#fatdisk';
import {traverse} from '#traverser';

const {assign} = Object;

export {
    parse,
    print,
    traverse,
    createFilesystem,
    createDisk,
};

export const lint = async (source, options = {}) => {
    const {
        fix = true,
        fixCount = 2,
        plugins: pluginNames,
    } = options;
    
    const disk = await createDiskOnce();
    formatDisk(disk);
    
    const filesystem = parse(source, disk);
    
    const plugins = await loadPluginsAsync({
        pluginNames,
    });
    
    const places = runPlugins({
        ast: maybeAst(filesystem),
        traverse,
        fix,
        fixCount,
        plugins,
    });
    
    const code = print(filesystem);
    
    return {
        code,
        places,
    };
};

function maybeAst(ast) {
    return assign(ast, {
        program: {},
    });
}
