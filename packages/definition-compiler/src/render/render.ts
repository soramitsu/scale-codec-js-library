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

export async function renderNamespaceDefinition(
    def: NamespaceDefinition,
    params: {
        importLib: string;
    },
): Promise<string> {
    const app = createApp(App, { defmap: def, importLib: params.importLib })
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
