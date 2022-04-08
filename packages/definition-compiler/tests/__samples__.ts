import { NamespaceDefinition } from '../src/types'

interface Sample {
    def: NamespaceDefinition
}

function defineSample(def: NamespaceDefinition): Sample {
    return { def }
}

export const aliases = defineSample({
    B: {
        t: 'alias',
        ref: 'Str',
    },
    A: { t: 'alias', ref: 'B' },
    C: { t: 'tuple', items: ['B', 'U8'] },
})

export const externals = defineSample({
    JustExternalInclusion: {
        t: 'import',
        module: '../externals-sample-help',
    },
    WithCustomExternalName: {
        t: 'import',
        module: '../externals-sample-help',
        nameInModule: 'Str',
    },
})

export const complexNamespace = defineSample({
    OptionMsg: {
        t: 'option',
        some: 'Msg',
    },
    VecBool: {
        t: 'vec',
        item: 'Bool',
    },
    Hash: {
        t: 'bytes-array',
        len: 32,
    },
    SetU8: {
        t: 'set',
        entry: 'U8',
    },
    MapStrU8: {
        t: 'map',
        key: 'Str',
        value: 'U8',
    },
    ArraySetU8l2: {
        t: 'array',
        item: 'SetU8',
        len: 2,
    },
    Msg: {
        t: 'enum',
        variants: [
            {
                name: 'Quit',
                discriminant: 0,
            },
            {
                name: 'Greeting',
                discriminant: 1,
                ref: 'Str',
            },
        ],
    },
    TupleMsgMsg: {
        t: 'tuple',
        items: ['Msg', 'Msg'],
    },
    StrAlias: {
        t: 'alias',
        ref: 'Str',
    },
    Character: {
        t: 'struct',
        fields: [
            {
                name: 'name',
                ref: 'Str',
            },
        ],
    },
    AllInOne: {
        t: 'struct',
        fields: [
            {
                name: 'tuple_with_opts',
                ref: 'TupleMsgMsg',
            },
            {
                name: 'map',
                ref: 'MapStrU8',
            },
            {
                name: 'alias',
                ref: 'StrAlias',
            },
            {
                name: 'another_struct',
                ref: 'Character',
            },
            {
                name: 'arr',
                ref: 'ArraySetU8l2',
            },
            {
                name: 'vec',
                ref: 'VecBool',
            },
        ],
    },
})

export const structFieldsOrdering = defineSample({
    Mystery: {
        t: 'struct',
        fields: [
            { name: 'b', ref: 'Str' },
            { name: 'a', ref: 'Compact' },
            { name: 'A', ref: 'VecU8' },
        ],
    },
})

// export const unwrapCheck = defineSample({
//     StructA: {
//         t: 'struct',
//         fields: [
//             { name: 'primitive', ref: 'Bool' },
//             { name: 'alias', ref: 'AliasA' },
//             { name: 'enum', ref: 'EnumA' },
//             { name: 'map', ref: 'MapA' },
//             { name: 'set', ref: 'SetA' },
//             { name: 'array', ref: 'ArrayA' },
//             { name: 'bytesArray', ref: 'BytesArrayA' },
//             { name: 'vec', ref: 'VecEnumA' },
//             { name: 'tuple', ref: 'TupleA' },
//         ],
//     },
//     TupleA: {
//         t: 'tuple',
//         items: ['Str'],
//     },
//     AliasA: {
//         t: 'alias',
//         ref: 'TupleA',
//     },
//     MapA: {
//         t: 'map',
//         key: 'Str',
//         value: 'TupleA',
//     },
//     SetA: {
//         t: 'set',
//         entry: 'TupleA',
//     },
//     ArrayA: {
//         t: 'array',
//         item: 'Bool',
//         len: 3,
//     },
//     BytesArrayA: {
//         t: 'bytes-array',
//         len: 5,
//     },
//     VecEnumA: {
//         t: 'vec',
//         item: 'EnumA',
//     },
//     OptionA: {
//         t: 'option',
//         some: 'TupleA',
//     },
//     ResultA: {
//         t: 'result',
//         ok: 'TupleA',
//         err: 'Str',
//     },
//     EnumA: {
//         t: 'enum',
//         variants: [
//             { name: 'Opt', discriminant: 0, ref: 'OptionA' },
//             { name: 'Res', discriminant: 1, ref: 'ResultA' },
//             { name: 'Empty', discriminant: 2 },
//         ],
//     },
// })

/**
 * Some builder could be extended, e.g. enum builder.
 * Alias should handle it OK (type-only check).
 */
export const aliasToAnExtendedBuilder = defineSample({
    Message: {
        t: 'enum',
        variants: [
            {
                name: 'Empty',
                discriminant: 0,
            },
        ],
    },
    Msg: {
        t: 'alias',
        ref: 'Message',
    },
})

export const circular = defineSample({
    Value: {
        t: 'enum',
        variants: [
            {
                name: 'Vec',
                discriminant: 0,
                ref: 'VecValue',
            },
            {
                name: 'Alias',
                discriminant: 1,
                ref: 'Alias',
            },
        ],
    },
    VecValue: {
        t: 'vec',
        item: 'Value',
    },
    Alias: {
        t: 'alias',
        ref: 'Value',
    },
})

export const reallyDeepTypesTree = defineSample({
    BTreeMapStringEvaluatesToValue: { t: 'map', key: 'Str', value: 'EvaluatesToValue' },
    BTreeMapPublicKeySignatureOfCommittedBlock: { t: 'map', key: 'PublicKey', value: 'SignatureOfCommittedBlock' },
    BTreeMapPublicKeySignatureOfProof: { t: 'map', key: 'PublicKey', value: 'SignatureOfProof' },
    BTreeMapPublicKeySignatureOfTransactionPayload: {
        t: 'map',
        key: 'PublicKey',
        value: 'SignatureOfTransactionPayload',
    },
    BTreeMapNameValue: { t: 'map', key: 'Name', value: 'Value' },
    BTreeMapAccountIdAccount: { t: 'map', key: 'AccountId', value: 'Account' },
    BTreeMapDefinitionIdAssetDefinitionEntry: { t: 'map', key: 'DefinitionId', value: 'AssetDefinitionEntry' },
    BTreeMapAssetIdAsset: { t: 'map', key: 'AssetId', value: 'Asset' },
    BTreeSetSignatureOfValidBlock: { t: 'vec', item: 'SignatureOfValidBlock' },
    BTreeSetSignatureOfTransactionPayload: { t: 'vec', item: 'SignatureOfTransactionPayload' },
    BTreeSetPermissionToken: { t: 'vec', item: 'PermissionToken' },
    // FixedPointI64: { t: 'import', module: './fixed-point', nameInModule: 'FixedPointI64P9' },
    OptionTopology: { t: 'option', some: 'Topology' },
    OptionHash: { t: 'option', some: 'Hash' },
    OptionAccountId: { t: 'option', some: 'AccountId' },
    OptionDefinitionId: { t: 'option', some: 'DefinitionId' },
    OptionAssetId: { t: 'option', some: 'AssetId' },
    OptionId: { t: 'option', some: 'Id' },
    OptionIpfsPath: { t: 'option', some: 'IpfsPath' },
    OptionEntityFilter: { t: 'option', some: 'EntityFilter' },
    OptionStatusFilter: { t: 'option', some: 'StatusFilter' },
    OptionUpdated: { t: 'option', some: 'Updated' },
    OptionEntityType: { t: 'option', some: 'EntityType' },
    OptionInstruction: { t: 'option', some: 'Instruction' },
    OptionPeerId: { t: 'option', some: 'PeerId' },
    OptionU32: { t: 'option', some: 'U32' },
    VecGenesisTransaction: { t: 'vec', item: 'GenesisTransaction' },
    VecProof: { t: 'vec', item: 'Proof' },
    VecPublicKey: { t: 'vec', item: 'PublicKey' },
    VecHashOfVersionedValidBlock: { t: 'vec', item: 'HashOfVersionedValidBlock' },
    VecSignatureOfValidBlock: { t: 'vec', item: 'SignatureOfValidBlock' },
    VecSignatureOfTransactionPayload: { t: 'vec', item: 'SignatureOfTransactionPayload' },
    VecValue: { t: 'vec', item: 'Value' },
    VecInstruction: { t: 'vec', item: 'Instruction' },
    VecPeerId: { t: 'vec', item: 'PeerId' },
    VecPermissionToken: { t: 'vec', item: 'PermissionToken' },
    VecVersionedRejectedTransaction: { t: 'vec', item: 'VersionedRejectedTransaction' },
    VecVersionedValidTransaction: { t: 'vec', item: 'VersionedValidTransaction' },
    VecAction: { t: 'vec', item: 'Action' },
    ArrayU8L32: { t: 'bytes-array', len: 32 },
    BlockHeader: {
        t: 'struct',
        fields: [
            { name: 'timestamp', ref: 'U128' },
            { name: 'height', ref: 'U64' },
            { name: 'previous_block_hash', ref: 'HashOfVersionedCommittedBlock' },
            { name: 'transactions_hash', ref: 'HashOfMerkleTreeVersionedTransaction' },
            { name: 'rejected_transactions_hash', ref: 'HashOfMerkleTreeVersionedTransaction' },
            { name: 'view_change_proofs', ref: 'ProofChain' },
            { name: 'invalidated_blocks_hashes', ref: 'VecHashOfVersionedValidBlock' },
            { name: 'genesis_topology', ref: 'OptionTopology' },
        ],
    },
    CommittedBlock: {
        t: 'struct',
        fields: [
            { name: 'header', ref: 'BlockHeader' },
            { name: 'rejected_transactions', ref: 'VecVersionedRejectedTransaction' },
            { name: 'transactions', ref: 'VecVersionedValidTransaction' },
            { name: 'trigger_recommendations', ref: 'VecAction' },
            { name: 'signatures', ref: 'SignaturesOfCommittedBlock' },
        ],
    },
    ValidBlock: {
        t: 'struct',
        fields: [
            { name: 'header', ref: 'BlockHeader' },
            { name: 'rejected_transactions', ref: 'VecVersionedRejectedTransaction' },
            { name: 'transactions', ref: 'VecVersionedValidTransaction' },
            { name: 'signatures', ref: 'BTreeSetSignatureOfValidBlock' },
            { name: 'trigger_recommendations', ref: 'VecAction' },
        ],
    },
    VersionedCommittedBlock: { t: 'enum', variants: [{ name: 'V1', discriminant: 1, ref: 'CommittedBlock' }] },
    VersionedValidBlock: { t: 'enum', variants: [{ name: 'V1', discriminant: 1, ref: 'ValidBlock' }] },
    BlockPublisherMessage: {
        t: 'enum',
        variants: [
            { name: 'SubscriptionAccepted', discriminant: 0, ref: null },
            { name: 'Block', discriminant: 1, ref: 'VersionedCommittedBlock' },
        ],
    },
    BlockSubscriberMessage: {
        t: 'enum',
        variants: [
            { name: 'SubscriptionRequest', discriminant: 0, ref: 'U64' },
            { name: 'BlockReceived', discriminant: 1, ref: null },
        ],
    },
    VersionedBlockPublisherMessage: {
        t: 'enum',
        variants: [{ name: 'V1', discriminant: 1, ref: 'BlockPublisherMessage' }],
    },
    VersionedBlockSubscriberMessage: {
        t: 'enum',
        variants: [{ name: 'V1', discriminant: 1, ref: 'BlockSubscriberMessage' }],
    },
    GenesisTransaction: { t: 'struct', fields: [{ name: 'isi', ref: 'VecInstruction' }] },
    RawGenesisBlock: { t: 'struct', fields: [{ name: 'transactions', ref: 'VecGenesisTransaction' }] },
    Topology: {
        t: 'struct',
        fields: [
            { name: 'sorted_peers', ref: 'VecPeerId' },
            { name: 'reshuffle_after_n_view_changes', ref: 'U64' },
            { name: 'at_block', ref: 'HashOfVersionedCommittedBlock' },
            { name: 'view_change_proofs', ref: 'ProofChain' },
        ],
    },
    BlockCreationTimeout: { t: 'tuple', items: [] },
    CommitTimeout: { t: 'struct', fields: [{ name: 'hash', ref: 'HashOfVersionedValidBlock' }] },
    NoTransactionReceiptReceived: { t: 'tuple', items: [] },
    Proof: {
        t: 'struct',
        fields: [
            { name: 'payload', ref: 'ProofPayload' },
            { name: 'signatures', ref: 'SignaturesOfProof' },
        ],
    },
    ProofChain: { t: 'struct', fields: [{ name: 'proofs', ref: 'VecProof' }] },
    ProofPayload: {
        t: 'struct',
        fields: [
            { name: 'previous_proof', ref: 'HashOfProof' },
            { name: 'latest_block', ref: 'HashOfVersionedCommittedBlock' },
            { name: 'reason', ref: 'Reason' },
        ],
    },
    Reason: {
        t: 'enum',
        variants: [
            { name: 'CommitTimeout', discriminant: 0, ref: 'CommitTimeout' },
            { name: 'NoTransactionReceiptReceived', discriminant: 1, ref: 'NoTransactionReceiptReceived' },
            { name: 'BlockCreationTimeout', discriminant: 2, ref: 'BlockCreationTimeout' },
        ],
    },
    PublicKey: {
        t: 'struct',
        fields: [
            { name: 'digest_function', ref: 'Str' },
            { name: 'payload', ref: 'VecU8' },
        ],
    },
    Hash: { t: 'tuple', items: ['ArrayU8L32'] },
    HashOfVersionedCommittedBlock: { t: 'tuple', items: ['Hash'] },
    HashOfVersionedValidBlock: { t: 'tuple', items: ['Hash'] },
    HashOfProof: { t: 'tuple', items: ['Hash'] },
    HashOfMerkleTreeVersionedTransaction: { t: 'tuple', items: ['Hash'] },
    HashOfNodeVersionedTransaction: { t: 'tuple', items: ['Hash'] },
    HashOfVersionedTransaction: { t: 'tuple', items: ['Hash'] },
    Signature: {
        t: 'struct',
        fields: [
            { name: 'public_key', ref: 'PublicKey' },
            { name: 'signature', ref: 'VecU8' },
        ],
    },
    SignatureOfCommittedBlock: { t: 'tuple', items: ['Signature'] },
    SignatureOfValidBlock: { t: 'tuple', items: ['Signature'] },
    SignatureOfProof: { t: 'tuple', items: ['Signature'] },
    SignatureOfQueryPayload: { t: 'tuple', items: ['Signature'] },
    SignatureOfTransactionPayload: { t: 'tuple', items: ['Signature'] },
    SignaturesOfCommittedBlock: {
        t: 'struct',
        fields: [{ name: 'signatures', ref: 'BTreeMapPublicKeySignatureOfCommittedBlock' }],
    },
    SignaturesOfProof: { t: 'struct', fields: [{ name: 'signatures', ref: 'BTreeMapPublicKeySignatureOfProof' }] },
    SignaturesOfTransactionPayload: {
        t: 'struct',
        fields: [{ name: 'signatures', ref: 'BTreeMapPublicKeySignatureOfTransactionPayload' }],
    },
    IdBox: {
        t: 'enum',
        variants: [
            { name: 'AccountId', discriminant: 0, ref: 'AccountId' },
            { name: 'AssetId', discriminant: 1, ref: 'AssetId' },
            { name: 'AssetDefinitionId', discriminant: 2, ref: 'DefinitionId' },
            { name: 'DomainId', discriminant: 3, ref: 'Id' },
            { name: 'PeerId', discriminant: 4, ref: 'PeerId' },
            { name: 'TriggerId', discriminant: 5, ref: 'Id' },
            { name: 'WorldId', discriminant: 6, ref: null },
        ],
    },
    IdentifiableBox: {
        t: 'enum',
        variants: [
            { name: 'Account', discriminant: 0, ref: 'Account' },
            { name: 'NewAccount', discriminant: 1, ref: 'NewAccount' },
            { name: 'Asset', discriminant: 2, ref: 'Asset' },
            { name: 'AssetDefinition', discriminant: 3, ref: 'AssetDefinition' },
            { name: 'Domain', discriminant: 4, ref: 'Domain' },
            { name: 'Peer', discriminant: 5, ref: 'Peer' },
            { name: 'Trigger', discriminant: 6, ref: 'Trigger' },
            { name: 'World', discriminant: 7, ref: null },
        ],
    },
    Name: { t: 'tuple', items: ['Str'] },
    Parameter: {
        t: 'enum',
        variants: [
            { name: 'MaximumFaultyPeersAmount', discriminant: 0, ref: 'U32' },
            { name: 'BlockTime', discriminant: 1, ref: 'U128' },
            { name: 'CommitTime', discriminant: 2, ref: 'U128' },
            { name: 'TransactionReceiptTime', discriminant: 3, ref: 'U128' },
        ],
    },
    Value: {
        t: 'enum',
        variants: [
            { name: 'U32', discriminant: 0, ref: 'U32' },
            { name: 'U128', discriminant: 1, ref: 'U128' },
            { name: 'Bool', discriminant: 2, ref: 'Bool' },
            { name: 'String', discriminant: 3, ref: 'Str' },
            { name: 'Name', discriminant: 4, ref: 'Name' },
            { name: 'Fixed', discriminant: 5, ref: 'Fixed' },
            { name: 'Vec', discriminant: 6, ref: 'VecValue' },
            { name: 'LimitedMetadata', discriminant: 7, ref: 'Metadata' },
            { name: 'Id', discriminant: 8, ref: 'IdBox' },
            { name: 'Identifiable', discriminant: 9, ref: 'IdentifiableBox' },
            { name: 'PublicKey', discriminant: 10, ref: 'PublicKey' },
            { name: 'Parameter', discriminant: 11, ref: 'Parameter' },
            { name: 'SignatureCheckCondition', discriminant: 12, ref: 'SignatureCheckCondition' },
            { name: 'TransactionValue', discriminant: 13, ref: 'TransactionValue' },
            { name: 'PermissionToken', discriminant: 14, ref: 'PermissionToken' },
            { name: 'Hash', discriminant: 15, ref: 'Hash' },
        ],
    },
    Account: {
        t: 'struct',
        fields: [
            { name: 'id', ref: 'AccountId' },
            { name: 'assets', ref: 'BTreeMapAssetIdAsset' },
            { name: 'signatories', ref: 'VecPublicKey' },
            { name: 'permission_tokens', ref: 'BTreeSetPermissionToken' },
            { name: 'signature_check_condition', ref: 'SignatureCheckCondition' },
            { name: 'metadata', ref: 'Metadata' },
        ],
    },
    AccountId: {
        t: 'struct',
        fields: [
            { name: 'name', ref: 'Name' },
            { name: 'domain_id', ref: 'Id' },
        ],
    },
    NewAccount: {
        t: 'struct',
        fields: [
            { name: 'id', ref: 'AccountId' },
            { name: 'signatories', ref: 'VecPublicKey' },
            { name: 'metadata', ref: 'Metadata' },
        ],
    },
    SignatureCheckCondition: { t: 'tuple', items: ['EvaluatesToBool'] },
    Asset: {
        t: 'struct',
        fields: [
            { name: 'id', ref: 'AssetId' },
            { name: 'value', ref: 'AssetValue' },
        ],
    },
    AssetDefinition: {
        t: 'struct',
        fields: [
            { name: 'value_type', ref: 'AssetValueType' },
            { name: 'id', ref: 'DefinitionId' },
            { name: 'metadata', ref: 'Metadata' },
            { name: 'mintable', ref: 'Bool' },
        ],
    },
    AssetDefinitionEntry: {
        t: 'struct',
        fields: [
            { name: 'definition', ref: 'AssetDefinition' },
            { name: 'registered_by', ref: 'AccountId' },
        ],
    },
    AssetValue: {
        t: 'enum',
        variants: [
            { name: 'Quantity', discriminant: 0, ref: 'U32' },
            { name: 'BigQuantity', discriminant: 1, ref: 'U128' },
            { name: 'Fixed', discriminant: 2, ref: 'Fixed' },
            { name: 'Store', discriminant: 3, ref: 'Metadata' },
        ],
    },
    AssetValueType: {
        t: 'enum',
        variants: [
            { name: 'Quantity', discriminant: 0, ref: null },
            { name: 'BigQuantity', discriminant: 1, ref: null },
            { name: 'Fixed', discriminant: 2, ref: null },
            { name: 'Store', discriminant: 3, ref: null },
        ],
    },
    DefinitionId: {
        t: 'struct',
        fields: [
            { name: 'name', ref: 'Name' },
            { name: 'domain_id', ref: 'Id' },
        ],
    },
    AssetId: {
        t: 'struct',
        fields: [
            { name: 'definition_id', ref: 'DefinitionId' },
            { name: 'account_id', ref: 'AccountId' },
        ],
    },
    Domain: {
        t: 'struct',
        fields: [
            { name: 'id', ref: 'Id' },
            { name: 'accounts', ref: 'BTreeMapAccountIdAccount' },
            { name: 'asset_definitions', ref: 'BTreeMapDefinitionIdAssetDefinitionEntry' },
            { name: 'metadata', ref: 'Metadata' },
            { name: 'logo', ref: 'OptionIpfsPath' },
        ],
    },
    Id: { t: 'struct', fields: [{ name: 'name', ref: 'Name' }] },
    IpfsPath: { t: 'tuple', items: ['Str'] },
    Event: {
        t: 'enum',
        variants: [
            { name: 'Pipeline', discriminant: 0, ref: 'PipelineEvent' },
            { name: 'Data', discriminant: 1, ref: 'DataEvent' },
        ],
    },
    EventFilter: {
        t: 'enum',
        variants: [
            { name: 'Pipeline', discriminant: 0, ref: 'PipelineEventFilter' },
            { name: 'Data', discriminant: 1, ref: 'DataEventFilter' },
        ],
    },
    EventPublisherMessage: {
        t: 'enum',
        variants: [
            { name: 'SubscriptionAccepted', discriminant: 0, ref: null },
            { name: 'Event', discriminant: 1, ref: 'Event' },
        ],
    },
    EventSubscriberMessage: {
        t: 'enum',
        variants: [
            { name: 'SubscriptionRequest', discriminant: 0, ref: 'EventFilter' },
            { name: 'EventReceived', discriminant: 1, ref: null },
        ],
    },
    VersionedEventPublisherMessage: {
        t: 'enum',
        variants: [{ name: 'V1', discriminant: 1, ref: 'EventPublisherMessage' }],
    },
    VersionedEventSubscriberMessage: {
        t: 'enum',
        variants: [{ name: 'V1', discriminant: 1, ref: 'EventSubscriberMessage' }],
    },
    AssetUpdated: {
        t: 'enum',
        variants: [
            { name: 'Received', discriminant: 0, ref: null },
            { name: 'Sent', discriminant: 1, ref: null },
        ],
    },
    Entity: {
        t: 'enum',
        variants: [
            { name: 'Account', discriminant: 0, ref: 'AccountId' },
            { name: 'AssetDefinition', discriminant: 1, ref: 'DefinitionId' },
            { name: 'Asset', discriminant: 2, ref: 'AssetId' },
            { name: 'Domain', discriminant: 3, ref: 'Id' },
            { name: 'Peer', discriminant: 4, ref: 'PeerId' },
            { name: 'Trigger', discriminant: 5, ref: 'Id' },
        ],
    },
    EntityFilter: {
        t: 'enum',
        variants: [
            { name: 'Account', discriminant: 0, ref: 'OptionAccountId' },
            { name: 'AssetDefinition', discriminant: 1, ref: 'OptionDefinitionId' },
            { name: 'Asset', discriminant: 2, ref: 'OptionAssetId' },
            { name: 'Domain', discriminant: 3, ref: 'OptionId' },
            { name: 'Peer', discriminant: 4, ref: 'OptionPeerId' },
        ],
    },
    DataEvent: {
        t: 'struct',
        fields: [
            { name: 'entity', ref: 'Entity' },
            { name: 'status', ref: 'Status' },
        ],
    },
    DataEventFilter: {
        t: 'struct',
        fields: [
            { name: 'entity', ref: 'OptionEntityFilter' },
            { name: 'status', ref: 'OptionStatusFilter' },
        ],
    },
    MetadataUpdated: {
        t: 'enum',
        variants: [
            { name: 'Inserted', discriminant: 0, ref: null },
            { name: 'Removed', discriminant: 1, ref: null },
        ],
    },
    Status: {
        t: 'enum',
        variants: [
            { name: 'Validating', discriminant: 0, ref: null },
            { name: 'Rejected', discriminant: 1, ref: 'RejectionReason' },
            { name: 'Committed', discriminant: 2, ref: null },
        ],
    },
    StatusFilter: {
        t: 'enum',
        variants: [
            { name: 'Created', discriminant: 0, ref: null },
            { name: 'Updated', discriminant: 1, ref: 'OptionUpdated' },
            { name: 'Deleted', discriminant: 2, ref: null },
        ],
    },
    TriggerUpdated: {
        t: 'enum',
        variants: [
            { name: 'Extended', discriminant: 0, ref: null },
            { name: 'Shortened', discriminant: 1, ref: null },
        ],
    },
    Updated: {
        t: 'enum',
        variants: [
            { name: 'Metadata', discriminant: 0, ref: 'MetadataUpdated' },
            { name: 'Authentication', discriminant: 1, ref: null },
            { name: 'Permission', discriminant: 2, ref: null },
            { name: 'Asset', discriminant: 3, ref: 'AssetUpdated' },
            { name: 'Trigger', discriminant: 4, ref: 'TriggerUpdated' },
        ],
    },
    EntityType: {
        t: 'enum',
        variants: [
            { name: 'Block', discriminant: 0, ref: null },
            { name: 'Transaction', discriminant: 1, ref: null },
        ],
    },
    PipelineEvent: {
        t: 'struct',
        fields: [
            { name: 'entity_type', ref: 'EntityType' },
            { name: 'status', ref: 'Status' },
            { name: 'hash', ref: 'Hash' },
        ],
    },
    PipelineEventFilter: {
        t: 'struct',
        fields: [
            { name: 'entity', ref: 'OptionEntityType' },
            { name: 'hash', ref: 'OptionHash' },
        ],
    },
    Add: {
        t: 'struct',
        fields: [
            { name: 'left', ref: 'EvaluatesToU32' },
            { name: 'right', ref: 'EvaluatesToU32' },
        ],
    },
    And: {
        t: 'struct',
        fields: [
            { name: 'left', ref: 'EvaluatesToBool' },
            { name: 'right', ref: 'EvaluatesToBool' },
        ],
    },
    Contains: {
        t: 'struct',
        fields: [
            { name: 'collection', ref: 'EvaluatesToVecValue' },
            { name: 'element', ref: 'EvaluatesToValue' },
        ],
    },
    ContainsAll: {
        t: 'struct',
        fields: [
            { name: 'collection', ref: 'EvaluatesToVecValue' },
            { name: 'elements', ref: 'EvaluatesToVecValue' },
        ],
    },
    ContainsAny: {
        t: 'struct',
        fields: [
            { name: 'collection', ref: 'EvaluatesToVecValue' },
            { name: 'elements', ref: 'EvaluatesToVecValue' },
        ],
    },
    ContextValue: { t: 'struct', fields: [{ name: 'value_name', ref: 'Str' }] },
    Divide: {
        t: 'struct',
        fields: [
            { name: 'left', ref: 'EvaluatesToU32' },
            { name: 'right', ref: 'EvaluatesToU32' },
        ],
    },
    Equal: {
        t: 'struct',
        fields: [
            { name: 'left', ref: 'EvaluatesToValue' },
            { name: 'right', ref: 'EvaluatesToValue' },
        ],
    },
    EvaluatesToVecValue: { t: 'struct', fields: [{ name: 'expression', ref: 'Expression' }] },
    EvaluatesToBool: { t: 'struct', fields: [{ name: 'expression', ref: 'Expression' }] },
    EvaluatesToHash: { t: 'struct', fields: [{ name: 'expression', ref: 'Expression' }] },
    EvaluatesToIdBox: { t: 'struct', fields: [{ name: 'expression', ref: 'Expression' }] },
    EvaluatesToIdentifiableBox: { t: 'struct', fields: [{ name: 'expression', ref: 'Expression' }] },
    EvaluatesToName: { t: 'struct', fields: [{ name: 'expression', ref: 'Expression' }] },
    EvaluatesToValue: { t: 'struct', fields: [{ name: 'expression', ref: 'Expression' }] },
    EvaluatesToAccountId: { t: 'struct', fields: [{ name: 'expression', ref: 'Expression' }] },
    EvaluatesToDefinitionId: { t: 'struct', fields: [{ name: 'expression', ref: 'Expression' }] },
    EvaluatesToAssetId: { t: 'struct', fields: [{ name: 'expression', ref: 'Expression' }] },
    EvaluatesToId: { t: 'struct', fields: [{ name: 'expression', ref: 'Expression' }] },
    EvaluatesToU32: { t: 'struct', fields: [{ name: 'expression', ref: 'Expression' }] },
    Expression: {
        t: 'enum',
        variants: [
            { name: 'Add', discriminant: 0, ref: 'Add' },
            { name: 'Subtract', discriminant: 1, ref: 'Subtract' },
            { name: 'Multiply', discriminant: 2, ref: 'Multiply' },
            { name: 'Divide', discriminant: 3, ref: 'Divide' },
            { name: 'Mod', discriminant: 4, ref: 'Mod' },
            { name: 'RaiseTo', discriminant: 5, ref: 'RaiseTo' },
            { name: 'Greater', discriminant: 6, ref: 'Greater' },
            { name: 'Less', discriminant: 7, ref: 'Less' },
            { name: 'Equal', discriminant: 8, ref: 'Equal' },
            { name: 'Not', discriminant: 9, ref: 'Not' },
            { name: 'And', discriminant: 10, ref: 'And' },
            { name: 'Or', discriminant: 11, ref: 'Or' },
            { name: 'If', discriminant: 12, ref: 'ExpressionIf' },
            { name: 'Raw', discriminant: 13, ref: 'Value' },
            { name: 'Query', discriminant: 14, ref: 'QueryBox' },
            { name: 'Contains', discriminant: 15, ref: 'Contains' },
            { name: 'ContainsAll', discriminant: 16, ref: 'ContainsAll' },
            { name: 'ContainsAny', discriminant: 17, ref: 'ContainsAny' },
            { name: 'Where', discriminant: 18, ref: 'Where' },
            { name: 'ContextValue', discriminant: 19, ref: 'ContextValue' },
        ],
    },
    Greater: {
        t: 'struct',
        fields: [
            { name: 'left', ref: 'EvaluatesToU32' },
            { name: 'right', ref: 'EvaluatesToU32' },
        ],
    },
    ExpressionIf: {
        t: 'struct',
        fields: [
            { name: 'condition', ref: 'EvaluatesToBool' },
            { name: 'then_expression', ref: 'EvaluatesToValue' },
            { name: 'else_expression', ref: 'EvaluatesToValue' },
        ],
    },
    Less: {
        t: 'struct',
        fields: [
            { name: 'left', ref: 'EvaluatesToU32' },
            { name: 'right', ref: 'EvaluatesToU32' },
        ],
    },
    Mod: {
        t: 'struct',
        fields: [
            { name: 'left', ref: 'EvaluatesToU32' },
            { name: 'right', ref: 'EvaluatesToU32' },
        ],
    },
    Multiply: {
        t: 'struct',
        fields: [
            { name: 'left', ref: 'EvaluatesToU32' },
            { name: 'right', ref: 'EvaluatesToU32' },
        ],
    },
    Not: { t: 'struct', fields: [{ name: 'expression', ref: 'EvaluatesToBool' }] },
    Or: {
        t: 'struct',
        fields: [
            { name: 'left', ref: 'EvaluatesToBool' },
            { name: 'right', ref: 'EvaluatesToBool' },
        ],
    },
    RaiseTo: {
        t: 'struct',
        fields: [
            { name: 'left', ref: 'EvaluatesToU32' },
            { name: 'right', ref: 'EvaluatesToU32' },
        ],
    },
    Subtract: {
        t: 'struct',
        fields: [
            { name: 'left', ref: 'EvaluatesToU32' },
            { name: 'right', ref: 'EvaluatesToU32' },
        ],
    },
    Where: {
        t: 'struct',
        fields: [
            { name: 'expression', ref: 'EvaluatesToValue' },
            { name: 'values', ref: 'BTreeMapStringEvaluatesToValue' },
        ],
    },
    BurnBox: {
        t: 'struct',
        fields: [
            { name: 'object', ref: 'EvaluatesToValue' },
            { name: 'destination_id', ref: 'EvaluatesToIdBox' },
        ],
    },
    FailBox: { t: 'struct', fields: [{ name: 'message', ref: 'Str' }] },
    GrantBox: {
        t: 'struct',
        fields: [
            { name: 'object', ref: 'EvaluatesToValue' },
            { name: 'destination_id', ref: 'EvaluatesToIdBox' },
        ],
    },
    IsiIf: {
        t: 'struct',
        fields: [
            { name: 'condition', ref: 'EvaluatesToBool' },
            { name: 'then', ref: 'Instruction' },
            { name: 'otherwise', ref: 'OptionInstruction' },
        ],
    },
    Instruction: {
        t: 'enum',
        variants: [
            { name: 'Register', discriminant: 0, ref: 'RegisterBox' },
            { name: 'Unregister', discriminant: 1, ref: 'UnregisterBox' },
            { name: 'Mint', discriminant: 2, ref: 'MintBox' },
            { name: 'Burn', discriminant: 3, ref: 'BurnBox' },
            { name: 'Transfer', discriminant: 4, ref: 'TransferBox' },
            { name: 'If', discriminant: 5, ref: 'IsiIf' },
            { name: 'Pair', discriminant: 6, ref: 'Pair' },
            { name: 'Sequence', discriminant: 7, ref: 'SequenceBox' },
            { name: 'Fail', discriminant: 8, ref: 'FailBox' },
            { name: 'SetKeyValue', discriminant: 9, ref: 'SetKeyValueBox' },
            { name: 'RemoveKeyValue', discriminant: 10, ref: 'RemoveKeyValueBox' },
            { name: 'Grant', discriminant: 11, ref: 'GrantBox' },
            { name: 'Revoke', discriminant: 12, ref: 'RevokeBox' },
        ],
    },
    MintBox: {
        t: 'struct',
        fields: [
            { name: 'object', ref: 'EvaluatesToValue' },
            { name: 'destination_id', ref: 'EvaluatesToIdBox' },
        ],
    },
    Pair: {
        t: 'struct',
        fields: [
            { name: 'left_instruction', ref: 'Instruction' },
            { name: 'right_instruction', ref: 'Instruction' },
        ],
    },
    RegisterBox: { t: 'struct', fields: [{ name: 'object', ref: 'EvaluatesToIdentifiableBox' }] },
    RemoveKeyValueBox: {
        t: 'struct',
        fields: [
            { name: 'object_id', ref: 'EvaluatesToIdBox' },
            { name: 'key', ref: 'EvaluatesToName' },
        ],
    },
    RevokeBox: {
        t: 'struct',
        fields: [
            { name: 'object', ref: 'EvaluatesToValue' },
            { name: 'destination_id', ref: 'EvaluatesToIdBox' },
        ],
    },
    SequenceBox: { t: 'struct', fields: [{ name: 'instructions', ref: 'VecInstruction' }] },
    SetKeyValueBox: {
        t: 'struct',
        fields: [
            { name: 'object_id', ref: 'EvaluatesToIdBox' },
            { name: 'key', ref: 'EvaluatesToName' },
            { name: 'value', ref: 'EvaluatesToValue' },
        ],
    },
    TransferBox: {
        t: 'struct',
        fields: [
            { name: 'source_id', ref: 'EvaluatesToIdBox' },
            { name: 'object', ref: 'EvaluatesToValue' },
            { name: 'destination_id', ref: 'EvaluatesToIdBox' },
        ],
    },
    UnregisterBox: { t: 'struct', fields: [{ name: 'object_id', ref: 'EvaluatesToIdBox' }] },
    LeafVersionedTransaction: { t: 'struct', fields: [{ name: 'hash', ref: 'HashOfVersionedTransaction' }] },
    MerkleTreeVersionedTransaction: { t: 'struct', fields: [{ name: 'root_node', ref: 'NodeVersionedTransaction' }] },
    NodeVersionedTransaction: {
        t: 'enum',
        variants: [
            { name: 'Subtree', discriminant: 0, ref: 'SubtreeVersionedTransaction' },
            { name: 'Leaf', discriminant: 1, ref: 'LeafVersionedTransaction' },
            { name: 'Empty', discriminant: 2, ref: null },
        ],
    },
    SubtreeVersionedTransaction: {
        t: 'struct',
        fields: [
            { name: 'left', ref: 'NodeVersionedTransaction' },
            { name: 'right', ref: 'NodeVersionedTransaction' },
            { name: 'hash', ref: 'HashOfNodeVersionedTransaction' },
        ],
    },
    Metadata: { t: 'struct', fields: [{ name: 'map', ref: 'BTreeMapNameValue' }] },
    PeerId: {
        t: 'struct',
        fields: [
            { name: 'address', ref: 'Str' },
            { name: 'public_key', ref: 'PublicKey' },
        ],
    },
    Peer: { t: 'struct', fields: [{ name: 'id', ref: 'PeerId' }] },
    PermissionToken: {
        t: 'struct',
        fields: [
            { name: 'name', ref: 'Name' },
            { name: 'params', ref: 'BTreeMapNameValue' },
        ],
    },
    QueryPayload: {
        t: 'struct',
        fields: [
            { name: 'timestamp_ms', ref: 'Compact' },
            { name: 'query', ref: 'QueryBox' },
            { name: 'account_id', ref: 'AccountId' },
        ],
    },
    QueryBox: {
        t: 'enum',
        variants: [
            { name: 'FindAllAccounts', discriminant: 0, ref: 'FindAllAccounts' },
            { name: 'FindAccountById', discriminant: 1, ref: 'FindAccountById' },
            { name: 'FindAccountKeyValueByIdAndKey', discriminant: 2, ref: 'FindAccountKeyValueByIdAndKey' },
            { name: 'FindAccountsByName', discriminant: 3, ref: 'FindAccountsByName' },
            { name: 'FindAccountsByDomainId', discriminant: 4, ref: 'FindAccountsByDomainId' },
            { name: 'FindAllAssets', discriminant: 5, ref: 'FindAllAssets' },
            { name: 'FindAllAssetsDefinitions', discriminant: 6, ref: 'FindAllAssetsDefinitions' },
            { name: 'FindAssetById', discriminant: 7, ref: 'FindAssetById' },
            { name: 'FindAssetsByName', discriminant: 8, ref: 'FindAssetsByName' },
            { name: 'FindAssetsByAccountId', discriminant: 9, ref: 'FindAssetsByAccountId' },
            { name: 'FindAssetsByAssetDefinitionId', discriminant: 10, ref: 'FindAssetsByAssetDefinitionId' },
            { name: 'FindAssetsByDomainId', discriminant: 11, ref: 'FindAssetsByDomainId' },
            {
                name: 'FindAssetsByDomainIdAndAssetDefinitionId',
                discriminant: 12,
                ref: 'FindAssetsByDomainIdAndAssetDefinitionId',
            },
            { name: 'FindAssetQuantityById', discriminant: 13, ref: 'FindAssetQuantityById' },
            { name: 'FindAssetKeyValueByIdAndKey', discriminant: 14, ref: 'FindAssetKeyValueByIdAndKey' },
            {
                name: 'FindAssetDefinitionKeyValueByIdAndKey',
                discriminant: 15,
                ref: 'FindAssetDefinitionKeyValueByIdAndKey',
            },
            { name: 'FindAllDomains', discriminant: 16, ref: 'FindAllDomains' },
            { name: 'FindDomainById', discriminant: 17, ref: 'FindDomainById' },
            { name: 'FindDomainKeyValueByIdAndKey', discriminant: 18, ref: 'FindDomainKeyValueByIdAndKey' },
            { name: 'FindAllPeers', discriminant: 19, ref: 'FindAllPeers' },
            { name: 'FindTransactionsByAccountId', discriminant: 20, ref: 'FindTransactionsByAccountId' },
            { name: 'FindTransactionByHash', discriminant: 21, ref: 'FindTransactionByHash' },
            { name: 'FindPermissionTokensByAccountId', discriminant: 22, ref: 'FindPermissionTokensByAccountId' },
        ],
    },
    QueryResult: { t: 'tuple', items: ['Value'] },
    SignedQueryRequest: {
        t: 'struct',
        fields: [
            { name: 'payload', ref: 'QueryPayload' },
            { name: 'signature', ref: 'SignatureOfQueryPayload' },
        ],
    },
    VersionedQueryResult: { t: 'enum', variants: [{ name: 'V1', discriminant: 1, ref: 'QueryResult' }] },
    VersionedSignedQueryRequest: { t: 'enum', variants: [{ name: 'V1', discriminant: 1, ref: 'SignedQueryRequest' }] },
    FindAccountById: { t: 'struct', fields: [{ name: 'id', ref: 'EvaluatesToAccountId' }] },
    FindAccountKeyValueByIdAndKey: {
        t: 'struct',
        fields: [
            { name: 'id', ref: 'EvaluatesToAccountId' },
            { name: 'key', ref: 'EvaluatesToName' },
        ],
    },
    FindAccountsByDomainId: { t: 'struct', fields: [{ name: 'domain_id', ref: 'EvaluatesToId' }] },
    FindAccountsByName: { t: 'struct', fields: [{ name: 'name', ref: 'EvaluatesToName' }] },
    FindAllAccounts: { t: 'struct', fields: [] },
    FindAllAssets: { t: 'struct', fields: [] },
    FindAllAssetsDefinitions: { t: 'struct', fields: [] },
    FindAssetById: { t: 'struct', fields: [{ name: 'id', ref: 'EvaluatesToAssetId' }] },
    FindAssetDefinitionKeyValueByIdAndKey: {
        t: 'struct',
        fields: [
            { name: 'id', ref: 'EvaluatesToDefinitionId' },
            { name: 'key', ref: 'EvaluatesToName' },
        ],
    },
    FindAssetKeyValueByIdAndKey: {
        t: 'struct',
        fields: [
            { name: 'id', ref: 'EvaluatesToAssetId' },
            { name: 'key', ref: 'EvaluatesToName' },
        ],
    },
    FindAssetQuantityById: { t: 'struct', fields: [{ name: 'id', ref: 'EvaluatesToAssetId' }] },
    FindAssetsByAccountId: { t: 'struct', fields: [{ name: 'account_id', ref: 'EvaluatesToAccountId' }] },
    FindAssetsByAssetDefinitionId: {
        t: 'struct',
        fields: [{ name: 'asset_definition_id', ref: 'EvaluatesToDefinitionId' }],
    },
    FindAssetsByDomainId: { t: 'struct', fields: [{ name: 'domain_id', ref: 'EvaluatesToId' }] },
    FindAssetsByDomainIdAndAssetDefinitionId: {
        t: 'struct',
        fields: [
            { name: 'domain_id', ref: 'EvaluatesToId' },
            { name: 'asset_definition_id', ref: 'EvaluatesToDefinitionId' },
        ],
    },
    FindAssetsByName: { t: 'struct', fields: [{ name: 'name', ref: 'EvaluatesToName' }] },
    FindAllDomains: { t: 'struct', fields: [] },
    FindDomainById: { t: 'struct', fields: [{ name: 'id', ref: 'EvaluatesToId' }] },
    FindDomainKeyValueByIdAndKey: {
        t: 'struct',
        fields: [
            { name: 'id', ref: 'EvaluatesToId' },
            { name: 'key', ref: 'EvaluatesToName' },
        ],
    },
    FindAllPeers: { t: 'struct', fields: [] },
    FindPermissionTokensByAccountId: { t: 'struct', fields: [{ name: 'id', ref: 'EvaluatesToAccountId' }] },
    FindTransactionByHash: { t: 'struct', fields: [{ name: 'hash', ref: 'EvaluatesToHash' }] },
    FindTransactionsByAccountId: { t: 'struct', fields: [{ name: 'account_id', ref: 'EvaluatesToAccountId' }] },
    BlockRejectionReason: { t: 'enum', variants: [{ name: 'ConsensusBlockRejection', discriminant: 0, ref: null }] },
    Executable: {
        t: 'enum',
        variants: [
            { name: 'Instructions', discriminant: 0, ref: 'VecInstruction' },
            { name: 'Wasm', discriminant: 1, ref: 'WasmSmartContract' },
        ],
    },
    InstructionExecutionFail: {
        t: 'struct',
        fields: [
            { name: 'instruction', ref: 'Instruction' },
            { name: 'reason', ref: 'Str' },
        ],
    },
    NotPermittedFail: { t: 'struct', fields: [{ name: 'reason', ref: 'Str' }] },
    TransactionPayload: {
        t: 'struct',
        fields: [
            { name: 'account_id', ref: 'AccountId' },
            { name: 'instructions', ref: 'Executable' },
            { name: 'creation_time', ref: 'U64' },
            { name: 'time_to_live_ms', ref: 'U64' },
            { name: 'nonce', ref: 'OptionU32' },
            { name: 'metadata', ref: 'BTreeMapNameValue' },
        ],
    },
    RejectedTransaction: {
        t: 'struct',
        fields: [
            { name: 'payload', ref: 'TransactionPayload' },
            { name: 'signatures', ref: 'SignaturesOfTransactionPayload' },
            { name: 'rejection_reason', ref: 'TransactionRejectionReason' },
        ],
    },
    RejectionReason: {
        t: 'enum',
        variants: [
            { name: 'Block', discriminant: 0, ref: 'BlockRejectionReason' },
            { name: 'Transaction', discriminant: 1, ref: 'TransactionRejectionReason' },
        ],
    },
    Transaction: {
        t: 'struct',
        fields: [
            { name: 'payload', ref: 'TransactionPayload' },
            { name: 'signatures', ref: 'BTreeSetSignatureOfTransactionPayload' },
        ],
    },
    TransactionLimitError: { t: 'tuple', items: ['Str'] },
    TransactionRejectionReason: {
        t: 'enum',
        variants: [
            { name: 'NotPermitted', discriminant: 0, ref: 'NotPermittedFail' },
            { name: 'UnsatisfiedSignatureCondition', discriminant: 1, ref: 'UnsatisfiedSignatureConditionFail' },
            { name: 'LimitCheck', discriminant: 2, ref: 'TransactionLimitError' },
            { name: 'InstructionExecution', discriminant: 3, ref: 'InstructionExecutionFail' },
            { name: 'WasmExecution', discriminant: 4, ref: 'WasmExecutionFail' },
            { name: 'UnexpectedGenesisAccountSignature', discriminant: 5, ref: null },
        ],
    },
    TransactionValue: {
        t: 'enum',
        variants: [
            { name: 'Transaction', discriminant: 0, ref: 'VersionedTransaction' },
            { name: 'RejectedTransaction', discriminant: 1, ref: 'VersionedRejectedTransaction' },
        ],
    },
    UnsatisfiedSignatureConditionFail: { t: 'struct', fields: [{ name: 'reason', ref: 'Str' }] },
    ValidTransaction: {
        t: 'struct',
        fields: [
            { name: 'payload', ref: 'TransactionPayload' },
            { name: 'signatures', ref: 'SignaturesOfTransactionPayload' },
        ],
    },
    VersionedRejectedTransaction: {
        t: 'enum',
        variants: [{ name: 'V1', discriminant: 1, ref: 'RejectedTransaction' }],
    },
    VersionedTransaction: { t: 'enum', variants: [{ name: 'V1', discriminant: 1, ref: 'Transaction' }] },
    VersionedValidTransaction: { t: 'enum', variants: [{ name: 'V1', discriminant: 1, ref: 'ValidTransaction' }] },
    WasmExecutionFail: { t: 'struct', fields: [{ name: 'reason', ref: 'Str' }] },
    WasmSmartContract: { t: 'struct', fields: [{ name: 'raw_data', ref: 'VecU8' }] },
    Action: {
        t: 'struct',
        fields: [
            { name: 'executable', ref: 'Executable' },
            { name: 'repeats', ref: 'Repeats' },
            { name: 'technical_account', ref: 'AccountId' },
            { name: 'filter', ref: 'EventFilter' },
        ],
    },
    Repeats: {
        t: 'enum',
        variants: [
            { name: 'Indefinitely', discriminant: 0, ref: null },
            { name: 'Exactly', discriminant: 1, ref: 'U32' },
        ],
    },
    Trigger: {
        t: 'struct',
        fields: [
            { name: 'id', ref: 'Id' },
            { name: 'action', ref: 'Action' },
            { name: 'metadata', ref: 'Metadata' },
        ],
    },
    Fixed: { t: 'tuple', items: ['U64'] },
})
