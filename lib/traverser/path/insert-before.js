export const createInsertBefore = (path) => (node) => {
    return path.replaceWithMultiple([
        node,
        path.node,
    ]);
};
