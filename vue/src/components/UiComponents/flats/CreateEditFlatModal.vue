<script setup lang="ts">
import { reactive } from "vue";
import Button from "../form/Button.vue";
import Input from "../form/Input.vue";
import Select from "../form/Select.vue";

const obj = reactive({
  flat_number: "",
  conf: { title: "choose  ", value: "" },
  floor_number: "",
  area_m2: "",
  price: "",
  offer_price: "",
  rooms_count: ""
});

const submitForm = () => {};
</script>

<template>
  <form class="h-fu' w-full rounded-md border border-gray-100 shadow-sm" @submit.prevent="submitForm">
    <div class="flex w-full items-center justify-center bg-gray-50 p-3">
      <h2 class="text-lg">add flat</h2>
    </div>

    <div class="flex flex-col items-center gap-3 p-3">
      <Input v-model="obj.flat_number" placeholder="23 - flat" label="Flat number/name" />
      <Input v-model="obj.floor_number" placeholder="10" label="Floor number" type="number" />

      <Select v-model="obj.conf" :data="[{ title: 'type 1', value: 'type 1' }]" label="Type" clearable />

      <Select
        v-model="obj.conf"
        :data="[
          { title: 'Reserved', value: 'reserved' },
          { title: 'Sold', value: 'sold' }
        ]"
        label="select conf"
        clearable
      />

      <Input v-model="obj.area_m2" placeholder="60" label="area m²" type="number" />
      <Input v-model="obj.price" placeholder="60000" label="Price" type="number" />
      <Input v-model="obj.offer_price" placeholder="58000" label="Offer price" type="number" />
      <Input v-model="obj.rooms_count" placeholder="3" label="Rooms count" type="number" />

      <Select v-model="obj.conf" :data="[{ title: 'block 1', value: 'block 1' }]" label="Block" clearable />

      <Button type="submit" title="add flat" />
    </div>
  </form>
</template>
