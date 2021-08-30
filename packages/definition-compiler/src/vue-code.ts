/* eslint-disable max-params */

import { App, createRenderer } from 'vue';
import prettier from 'prettier';

type CodeNode = CodeElement;

class CodeElement {
    public parent: null | CodeNode = null;
    public name: string | null = null;
    public props: any = {};
    public text?: string;
    public comment?: string;
    public children: CodeNode[] = [];

    public constructor(params: Partial<CodeElement>) {
        Object.assign(this, params);
    }

    public render(): string {
        if (this.name === 'text' && this.text) {
            return this.text;
        }
        return this.children.map((x) => x.render()).join('');
    }
}

export const { createApp } = createRenderer<CodeNode, CodeElement>({
    // create
    createElement(type, isSVG, isCustomized, props) {
        return new CodeElement({
            name: type,
            props,
        });
    },
    createComment(comment) {
        return new CodeElement({
            name: 'comment',
            comment,
        });
    },
    createText(text) {
        return new CodeElement({
            name: 'text',
            text,
        });
    },
    setElementText(elem, txt) {
        elem.text = txt;
    },
    insert(el, parent, anchor) {
        if (anchor) {
            const index = parent.children.indexOf(anchor);
            if (index >= 0) {
                parent.children.splice(index, 0, el);
                return;
            }
        }
        el.parent = parent;
        parent.children.push(el);
    },
    patchProp(el, key, prev, next, isSVG, prevChildren, parentComponent, parentSuspense, unmountChildren) {
        el.props[key] = next;
    },
    remove(el) {
        if (el.parent) {
            el.parent.children.splice(el.parent.children.indexOf(el), 1);
        }
    },
    nextSibling(node) {
        if (node.parent) {
            const index = node.parent.children.indexOf(node);
            return node.parent.children[index + 1] ?? null;
        }
        return null;
    },
    setText(node, text) {
        node.text = text;
    },
    parentNode(node) {
        return node.parent;
    },
});

function renderNode(node: CodeNode): string {
    const rendered = node.render();

    const prettified = prettier.format(rendered, {
        semi: false,
        tabWidth: 2,
        parser: 'typescript',
    });

    return prettified;
}

export function renderApp(app: App<CodeElement>): string {
    const root: CodeNode = new CodeElement({ name: 'root', children: [] });
    app.config.compilerOptions.whitespace = 'preserve';
    app.mount(root);
    return renderNode(root);
}
