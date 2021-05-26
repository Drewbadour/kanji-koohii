/**
 * Declare global interface between legacy js & Vue/Ts build.
 *
 *   Vue               ... exposed as window.Vue
 *   VueInstance       ... exposed as window.VueInstance
 *   Koohii            ... exposed as window.Koohii
 *
 *   Koohii
 *   . API             ... expose axios based API for review & study bundles
 *   . Dom             ... expose DOM utilities
 *   . Util
 *   . . Lang
 *
 */

import Vue, {
  DefineComponent,
  ComponentPublicInstance,
  VueConstructor,
} from "vue";
import { KoohiiAPI } from "@lib/core/api";
import Lang from "@lib/core/lang";
import Dom from "@lib/koohii/dom";
import { Inst as TronFactory } from "@lib/koohii/tron";
import VueInstance, { VueInstanceFn } from "@lib/helpers/vue-instance";

/**
 * Vue misc.
 */
declare global {
  // generic component definition (as from an .vue import)
  export type TVueDefine = DefineComponent<{}, {}, any>;

  // typing of props passed to createApps(root, props)
  export type TVuePropsData = Record<string, unknown>;

  // a generic Vue component instance
  export type TVueInstance = ComponentPublicInstance;

  // extract component instance (component T's custom properties, methods, etc)
  export type TVueInstanceOf<T> = T extends new () => infer I ? I : never;
}

declare global {
  export interface KoohiiGlobals {
    API?: KoohiiAPI;

    // DomJS provides simple DOM utilities to the old frontend code
    Dom: typeof Dom;

    // JSON wrapper
    TRON: typeof TronFactory;

    // *instances* of components, shared between misc. legacy Javascripts
    Refs: {
      [componentName: string]: any;
    };

    //
    Util: {
      Lang: typeof Lang;
    };

    // references to Vue components that can be instanced later
    UX: { [componentName: string]: any };
  }

  interface Window {
    // base URL for API requests (cf. layout.php & koohii_base_url() helper)
    KK_BASE_URL: string;

    Koohii: KoohiiGlobals;
    // Vue: VueConstructor<Vue>;
    VueInstance: VueInstanceFn;

    // set from php & legacy javascript
    App: any;

    /* OBSOLETE
      Ui?: {
        // these are set by legacy js components in `web/revtk/components/`
        // when included in the legacy bundles `web/revtk/*.juicy.js`
        DictLookupDialog: any;
        EditFlashcardDialog: any;
        EditStoryDialog: any;
        EditKeywordComponent: any;
      };
      KanjiReview?: AppKanjiReview; // flashcard review page
    };

    // FIXME (use props?) apps/koohii/modules/review/templates/_LeitnerChart.php
    leitner_chart_data: any;
    */
  }

  /**
   * @see web/revtk/kanji-flashcardreview.juicy.js
   */
  export interface AppKanjiReview {
    oReview: any;
    toggleDictDialog: () => void;
  }

  /**
   * Instance of legacy component:
   *   App.Ui.EditKeywordComponent
   * @see web/revtk/components/EditKeywordDialog.js
   */
  export interface EditKeywordDialogInstance {
    show(): void;
    destroy(): void;
  }
}
