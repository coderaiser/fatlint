# FatLint

FAT-based JavaScript linter. The main idea is using FAT-filesystem for traversing AST,
so each node written to a file.

![FatLint](https://github.com/coderaiser/fatlint/raw/master/logo/fatlint.jpg "FatLint")

## Install

```
npm i fatlint
```

## API

```js
import {traverse, parse, print} from 'fatlint';

const source = `const a = 'hello'; const b = 'world'`;
const filesystem = parse(source);

traverse(filesystem, {
    VariableDeclarator(path) {
        if (isIdentifier(path.node.id, {name: 'world'}))
            path.remove();
    }
});

print(filesystem);
```

## License

MIT
