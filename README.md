# FatLint [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

[NPMURL]: https://npmjs.org/package/fatlint "npm"
[NPMIMGURL]: https://img.shields.io/npm/v/fatlint.svg?style=flat
[BuildStatusURL]: https://github.com/coderaiser/fatlint/actions?query=workflow%3A%22Node+CI%22 "Build Status"
[BuildStatusIMGURL]: https://github.com/coderaiser/fatlint/workflows/Node%20CI/badge.svg
[LicenseURL]: https://tldrlegal.com/license/mit-license "MIT License"
[LicenseIMGURL]: https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[CoverageURL]: https://coveralls.io/github/coderaiser/fatlint?branch=master
[CoverageIMGURL]: https://coveralls.io/repos/coderaiser/fatlint/badge.svg?branch=master&service=github

FAT-based JavaScript linter. The main idea is using FAT-filesystem for traversing AST,
so each node written to a file.

![FatLint](https://github.com/coderaiser/fatlint/raw/master/logo/fatlint.jpg "FatLint")

## Install

```
npm i fatlint
```

## API

`traverse` willing to support similar API as `@babel/traverse`.

### remove()

[Removing a node](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#removing-a-node).

```js
import {
    traverse,
    parse,
    print,
} from 'fatlint';

const source = `const a = 'hello'; const b = 'world'`;
const filesystem = parse(source);

traverse(filesystem, {
    VariableDeclarator(path) {
        if (isIdentifier(path.node.id, {name: 'world'}))
            path.remove(path);
    },
});

print(filesystem);
// returns
`const a = 'hello'\n`;
```

### replaceWith()

[Replace node](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#replacing-a-parent).

```js
import {types} from 'putout';
import {
    traverse,
    parse,
    print,
} from 'fatlint';

const {NumericLiteral} = types;

const source = `const a = 'hello';`;
const filesystem = parse(source);

traverse(filesystem, {
    StringLiteral(path) {
        path.replaceWith(NumericLiteral(5));
    },
});

print(filesystem);
// returns
`const a = 5;\n`
```

## License

MIT
