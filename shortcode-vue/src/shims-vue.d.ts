import { ComponentCustomProperties } from "vue";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    irePluginWp: {
      nonce: string;
      ajax_url: string;
      translations: Array;
    };
  }
}
