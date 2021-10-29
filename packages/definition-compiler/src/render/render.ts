import { createApp, renderApp } from './vue-code';
import { NamespaceDefinition } from '../definitions';
import App from './App';
import { WithDefPart, AddPartSuffix } from './components/current-def-part';
import { WithCurrentTypeName, TyName } from './components/current-type-name';
import Whitespace from './components/Whitespace';
import { TypeReference, Core } from './components/links';
import TypeExport from './components/TypeExport';
import Fields from './components/Fields';
import UseConfig from './components/UseConfig';
import VoidAlias from './components/VoidAlias';

export interface RenderNamespaceDefinitionParams {
    /**
     * Runtime library with STD codecs + reexports from the core library.
     *
     * @remarks
     * See `@scale-codec/definition-runtime` library - it exists specially for it.
     */
    importLib: string;
    /**
     * Single tuples are always an arrays with a single element. It is possible to make final code cleaner
     * (and a bit performant) if render such tuples just as aliases for the inner element. It is optional feature.
     */
    rollupSingleTuplesIntoAliases?: boolean;
}

/**
 * Renders provided definition into a valid TypeScript code.
 */
export async function renderNamespaceDefinition(
    def: NamespaceDefinition,
    params: RenderNamespaceDefinitionParams,
): Promise<string> {
    const app = createApp(App, {
        defmap: def,
        importLib: params.importLib,
        rollupSingleTuples: params.rollupSingleTuplesIntoAliases ?? false,
    })
        .component('WithDefPart', WithDefPart)
        .component('WithCurrentTypeName', WithCurrentTypeName)
        .component('TyName', TyName)
        .component('Ref', TypeReference)
        .component('Core', Core)
        .component('W', Whitespace)
        .component('Fields', Fields)
        .component('AddPartSuffix', AddPartSuffix)
        .component('UseConfig', UseConfig)
        .component('VoidAlias', VoidAlias)
        .component('Export', TypeExport);

    return renderApp(app);
}
