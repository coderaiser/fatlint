export const createInsertAfter = (path) => (node) => {
    return path.replaceWithMultiple([
        path.node,
        node,
    ]);
};
