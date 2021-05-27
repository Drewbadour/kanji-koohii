/**
 * This bundle is used on all pages, except landing (home) & flashcard review.
 */

// stylesheets
import "@css/main.build.scss";
import "@css/study-base.build.scss";
// import "@css/manage.build.scss";

console.log("@entry study ...");

import * as RootBundle from "@lib/helpers/root-bundle";
RootBundle.init();

// fabd:OBSOLETE ? make the axios based API (vue build) available to legacy js
// import { createApp } from "vue";
// import { getApi } from "@lib/core/api";
// const app = createApp({});
// app.config.globalProperties.$api = getApi();
// window.Koohii.API = window.Vue.prototype.$api =

// components instanced by external code
// import LeitnerChart from "@/components/LeitnerChart.vue";
import LeitnerChartJs from "@/components/LeitnerChart";
window.App.LeitnerChart = LeitnerChartJs;

// import KoohiiDictList from "@/components/KoohiiDictList.vue";
import KoohiiEditStory from "@/components/KoohiiEditStory.vue";

// Vue components instanced from misc. php templates
window.Koohii.UX = {
  ...window.Koohii.UX,
  // LeitnerChart,
  // KoohiiDictList,
  KoohiiEditStory,
};

// @see apps/koohii/modules/study/templates/_SideColumn.php
import StudyPage from "@old/study-page";
window.App.StudyPage = StudyPage;

console.log("@entry study ... OK");
