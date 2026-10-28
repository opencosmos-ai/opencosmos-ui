import { createRoot as domCreateRoot, hydrateRoot as domHydrateRoot } from 'react-dom/client';
import { createSheet } from '../StyleSheet/dom';

export function hydrate(element, root) {
    createSheet(root);
    return domHydrateRoot(root, element);
}

export function render(element, root) {
    createSheet(root);
    var reactRoot = domCreateRoot(root);
    reactRoot.render(element);
    return reactRoot;
}
