<script setup lang="ts">
import { encodeStruct, JSBI, encodeStrCompact, encodeBigInt } from '@scale-codec/core';
import { hexifyBytes } from '@scale-codec/util';

interface Message {
    author: string;
    timestamp: JSBI;
}

const msg: Message = {
    author: 'Clara',
    timestamp: JSBI.BigInt('16488182899412'),
};

const msgEncoded = encodeStruct(
    msg,
    {
        author: encodeStrCompact,
        timestamp: (v) =>
            encodeBigInt(v, {
                bits: 128,
                signed: false,
                endianness: 'le',
            }),
    },
    ['author', 'timestamp'],
);
</script>

<template>
    {{ hexifyBytes(msgEncoded) }}
</template>
