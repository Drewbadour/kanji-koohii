<template>
  <div class="p-8">
    <h1>
      <a href="/index_dev.php">Koohii</a> / UX Docs
    </h1>

    <h2>PctBar</h2>

    <section class="ux-docSection ux-docDemoblock">
      <div class="mb-4 ux-flexButtonRow">
        <span class="self-center font-bold min-w-[120px]">0 %</span>
        <ko-pct-bar :value="0" :max-value="200" class="w-[100px]" />
      </div>
      <div class="mb-4 ux-flexButtonRow">
        <span class="self-center font-bold min-w-[120px]">0.x %</span>
        <ko-pct-bar :value="1" :max-value="200" class="w-[428px]" />
      </div>
      <div class="mb-4 ux-flexButtonRow">
        <span class="self-center font-bold min-w-[120px]">xx %</span>
        <ko-pct-bar :value="75" :max-value="200" class="w-[428px]" />
      </div>
      <div class="mb-4 ux-flexButtonRow">
        <span class="self-center font-bold min-w-[120px]">99.x %</span>
        <ko-pct-bar :value="199" :max-value="200" class="w-[428px]" />
      </div>
      <div class="mb-4 ux-flexButtonRow">
        <span class="self-center font-bold min-w-[120px]">100 %</span>
        <ko-pct-bar :value="200" :max-value="200" class="w-[428px]" />
      </div>
    </section>

    <h2>PaddedBox</h2>

    <section class="ux-docSection ux-docDemoblock">
      <div class="flex mb-4">
        <span class="self-center font-bold min-w-[100px]">plain</span>
        <div class="min-w-[200px] ml-4 ko-Box">
          <h3 class="text-md font-bold text-body">Card Title</h3>
          <p class="mb-0">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
        <div class="min-w-[200px] ml-4 ko-Box ko-Box--danger">
          <h3 class="text-md font-bold text-danger-darker">Card Title</h3>
          <p class="mb-0 text-danger-dark">Lorem ipsum dolor sit amet, consectetur adipiscing elit!</p>
        </div>
        <div class="min-w-[200px] ml-4 ko-Box ko-Box--success">
          <h3 class="text-md font-bold text-success-darker">Card Title</h3>
          <p class="mb-0 text-success-dark">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
      </div>
      <div class="flex mb-0">
        <span class="self-center font-bold min-w-[100px]">stroke</span>
        <div class="min-w-[200px] ml-4 ko-Box ko-Box--stroke">
          <h3 class="text-md font-bold">Card Title</h3>
          <p class="mb-0">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
        <div class="min-w-[200px] ml-4 ko-Box ko-Box--stroke ko-Box--danger">
          <h3 class="text-md font-bold text-danger-dark">Card Title</h3>
          <p class="mb-0 text-danger">Lorem ipsum dolor sit amet, consectetur adipiscing elit!</p>
        </div>
        <div class="min-w-[200px] ml-4 ko-Box ko-Box--stroke ko-Box--success">
          <h3 class="text-md font-bold text-success-dark">Card Title</h3>
          <p
            class="mb-0 text-success-darker"
          >Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
      </div>
    </section>

    <h2>Buttons</h2>

    <p>
      element-ui buttons using
      <code>type="primary"</code> (etc).
    </p>

    <section class="ux-docSection ux-docDemoblock">
      <div class="mb-2">
        <el-button>Default</el-button>
        <el-button type="primary">Primary</el-button>
        <el-button type="success">Success</el-button>
        <el-button type="info">Info</el-button>
        <el-button type="warning">Warning</el-button>
        <el-button type="danger">Danger</el-button>
      </div>

      <div class="mb-2">
        <el-button round>Round</el-button>
        <el-button type="primary" round>Primary</el-button>
        <el-button type="success" round>Success</el-button>
        <el-button type="info" round>Info</el-button>
        <el-button type="warning" round>Warning</el-button>
        <el-button type="danger" round>Danger</el-button>
      </div>
    </section>

    <p>Vanilla html buttons (eg. used in php templates)</p>

    <section class="ux-docSection ux-docDemoblock">
      <div class="mb-4 ux-flexButtonRow">
        <span class="self-center font-bold min-w-[120px]">Size: small</span>
        <button class="ko-Btn ko-Btn--small">Default</button>
        <button class="ko-Btn ko-Btn--small ko-Btn--primary">Primary</button>
        <button class="ko-Btn ko-Btn--small ko-Btn--success">Success</button>
        <button class="ko-Btn ko-Btn--small ko-Btn--danger">Danger</button>
      </div>

      <div class="mb-4 ux-flexButtonRow">
        <span class="self-center font-bold min-w-[120px]">Size: default</span>
        <button class="ko-Btn">Default</button>
        <button class="ko-Btn ko-Btn--primary">Primary</button>
        <button class="ko-Btn ko-Btn--success">Success</button>
        <button class="ko-Btn ko-Btn--danger">Danger</button>
      </div>

      <div class="mb-4 ux-flexButtonRow">
        <span class="self-center font-bold min-w-[120px]">Size: large</span>
        <button class="ko-Btn ko-Btn--large">Default</button>
        <button class="ko-Btn ko-Btn--large ko-Btn--primary">Primary</button>
        <button class="ko-Btn ko-Btn--large ko-Btn--success">Success</button>
        <button class="ko-Btn ko-Btn--large ko-Btn--danger">Danger</button>
      </div>

      <div class="mb-4 ux-flexButtonRow">
        <span class="self-center font-bold min-w-[120px]">is-ghost</span>
        <button class="ko-Btn is-ghost ko-Btn--large">Default</button>
        <button class="ko-Btn is-ghost ko-Btn--large ko-Btn--primary">Primary</button>
        <button class="ko-Btn is-ghost ko-Btn--large ko-Btn--success">Success</button>
        <button class="ko-Btn is-ghost ko-Btn--large ko-Btn--danger">Danger</button>
      </div>

      <div class="mb-4 ux-flexButtonRow">
        <span class="self-center font-bold min-w-[120px]">is-disabled</span>
        <button class="ko-Btn is-disabled ko-Btn--large" disabled>Default</button>
        <button class="ko-Btn is-disabled ko-Btn--large ko-Btn--primary" disabled>Primary</button>
        <button class="ko-Btn is-disabled ko-Btn--large ko-Btn--success" disabled>Success</button>
        <button class="ko-Btn is-disabled ko-Btn--large ko-Btn--danger" disabled>Danger</button>
      </div>
    </section>

    <p>Example buttons with icons</p>

    <section class="ux-docSection ux-docDemoblock">
      <div class="mb-4 ux-flexButtonRow">
        <span class="self-center font-bold min-w-[120px]">&lt;button&gt;</span>

        <button type="button" class="ko-Btn ko-Btn--danger ko-Btn--large" disabled="disabled">
          Begin Restudy
          <i class="fa fa-book-open ml-2"></i>
        </button>

        <button class="ko-Btn ko-Btn--large ko-Btn--primary">
          Spaced Repetition
          <i class="fa fa-arrow-right ml-2"></i>
        </button>
        <button class="ko-Btn ko-Btn--large ko-Btn--success is-disabled" disabled>
          Start Review
          <i class="fa fa-arrow-right ml-2"></i>
        </button>
        <button class="ko-Btn is-ghost ko-Btn--large ko-Btn--primary">
          Show Kanji
          <i class="fa fa-chevron-down ml-2"></i>
        </button>
      </div>

      <div class="mb-4 ux-flexButtonRow">
        <span class="self-center font-bold min-w-[120px]">&lt;a&gt;</span>
        <a href="#" class="ko-Btn is-ghost rounded">
          <i class="fa fa-edit mr-2"></i>Edit Card
        </a>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { ElButton } from "@lib/vendor/element";
import KoPctBar from "@/vue/KoPctBar.vue";

export default defineComponent({
  name: "StyleguideIndex",
  components: {
    ElButton,
    KoPctBar,
  },
});
</script>

<style lang="scss"></style>
