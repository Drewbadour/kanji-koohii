// "styleguide" is for now a developer only page to test element-plus

import { domGetById, domContentLoaded } from "@lib/dom";
import VueInstance from "@lib/helpers/vue-instance";

import "@/assets/sass/styleguide/docs.scss";

import StyleguideApp from "@/vue/styleguide/index.vue";

domContentLoaded(() => {
  console.log("@entry-styleguide");
  let elMount = domGetById("JsStyleguideApp")!;
  elMount && VueInstance(StyleguideApp, elMount);
});
