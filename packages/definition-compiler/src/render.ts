import { createApp, renderApp } from './vue-code';
import { NamespaceDefinition } from './definitions';
import App from './render/App';
import { WithDefPart, AddPartSuffix } from './render/components/current-def-part';
import { WithCurrentTypeName, TyName } from './render/components/current-type-name';
import Whitespace from './render/components/Whitespace';
import { TypeReference, Core } from './render/components/links';
import TypeExport from './render/components/TypeExport';
import Fields from './render/components/Fields';

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
        .component('Export', TypeExport);

    return renderApp(app);
}
