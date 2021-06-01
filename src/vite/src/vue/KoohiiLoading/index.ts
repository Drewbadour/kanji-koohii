/**
 * Create an absolutely positioned div that covers an area of the page
 * with a solid color and a level of transparency. Typical use is to show an
 * area as "disabled" while a dialog is on, or while content is loading with ajax.
 *
 * OPTIONS
 *
 *   target      {HTMLElement}  Element which is covered by the mask
 *
 */

import { nextTick } from "vue";
import VueInstance, {
  ComponentPublicInstance,
} from "@lib/helpers/vue-instance";
import KoohiiLoading from "./KoohiiLoading.vue";
import { getStyle } from "@lib/dom";
import Lang from "@lib/lang";

type VueInstanceOf<T> = T extends new () => infer I ? I : never;

const setMaskStyle = (
  parent: HTMLElement,
  instance: VueInstanceOf<typeof KoohiiLoading>
) => {
  instance.originalPosition = getStyle(parent, "position")!;
};

let instance: VueInstanceOf<typeof KoohiiLoading> | null;

export type KoohiiLoadingOptions = { target: HTMLElement; background?: string };

export default {
  /**
   *
   *   target     {HTMLElement}     target to cover with mask
   *   background {String}          background color of the mask
   *
   * @param {} options
   */
  show(options: KoohiiLoadingOptions) {
    console.log("koohiiloading::show()");
    let target = options.target;

    console.assert(Lang.isNode(target), "KoohiiLoading() : target is invalid");

    instance = <VueInstanceOf<typeof KoohiiLoading>>(
      VueInstance(KoohiiLoading, document.createElement("div"), options)
    );

    setMaskStyle(target, instance);

    if (
      instance.originalPosition !== "absolute" &&
      instance.originalPosition !== "fixed"
    ) {
      target.classList.add("kk-loading-target--relative");
    }

    target.appendChild(instance.$el);
    nextTick(() => {
      instance!.setVisible(true);
    });
  },

  hide() {
    console.log("koohiiloading::hide()");
    instance!.close();
    instance = null;
  },
};
