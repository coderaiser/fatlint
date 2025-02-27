import {runPlugins} from '@putout/engine-runner';
import {loadPlugins} from '@putout/engine-loader';
import {print} from '#printer';
import {parse} from '#parser';
import {createFilesystem} from '#filesystem';
import {createDisk} from '#fatdisk';
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
    
    const disk = await createDisk();
    const filesystem = parse(source, disk);
    
    const plugins = loadPlugins({
        pluginNames,
    });
    
    const places = runPlugins({
        ast: maybeAst(filesystem),
        traverse,
        fix,
        fixCount,
        plugins,
    });
    
    const result = print(filesystem);
    
    return [result, places];
};

function maybeAst(ast) {
    return assign(ast, {
        program: {},
    });
}
