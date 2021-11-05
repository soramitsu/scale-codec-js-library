<script setup lang="ts">
import { encodeStruct, encodeStr, encodeBigInt } from '@scale-codec/core';
import { hexifyBytes } from '@scale-codec/util';

interface Message {
    author: string;
    timestamp: bigint;
}

const msg: Message = {
    author: 'Clara',
    timestamp: BigInt('16488182899412'),
};

const msgEncoded = encodeStruct(
    msg,
    {
        author: encodeStr,
        timestamp: (v) => encodeBigInt(v, 'u128'),
    },
    ['author', 'timestamp'],
);
</script>

<template>
    {{ hexifyBytes(msgEncoded) }}
</template>
