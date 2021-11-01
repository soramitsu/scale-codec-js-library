<script setup lang="ts">
import { DefaultAvailableBuilders } from '@scale-codec/definition-compiler/src/const';
</script>

<template>
    <ul>
        <li
            v-for="x in DefaultAvailableBuilders"
            :key="x"
        >
            <code>{{ x }}</code>
        </li>
    </ul>
</template>
