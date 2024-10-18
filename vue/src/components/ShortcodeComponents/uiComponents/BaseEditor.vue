<script setup lang="ts">
defineProps<{
  editor: string | undefined;
}>();
</script>

<template>
  <div
    class="[&_p]:text-color-text-subtle[&_ul]:columns-1 text-color-text-primary [&_a]:cursor-pointer [&_a]:text-[#2980b9] [&_a]:underline [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2 [&_ul_li]:relative [&_ul_li]:pl-[20px] [&_ul_li]:after:absolute [&_ul_li]:after:left-2 [&_ul_li]:after:top-[10px] [&_ul_li]:after:h-[4px] [&_ul_li]:after:w-[4px] [&_ul_li]:after:rounded-[50%] [&_ul_li]:after:bg-black"
    v-html="editor"
  ></div>
</template>
