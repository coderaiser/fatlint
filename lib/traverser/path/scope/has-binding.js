const {keys} = Object;

export const createHasBinding = (path) => (name) => {
    const bindings = path.scope.getAllBindings();
    
    return keys(bindings).includes(name);
};
