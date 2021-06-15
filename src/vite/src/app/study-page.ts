// FIXME: legacy study-page.js

import $$, { domGet } from "@lib/dom";
import VueInstance from "@lib/helpers/vue-instance";
import actb from "@old/autocomplete.js";
import AjaxPanel from "@old/ajaxpanel";
import EventDelegator from "@old/eventdelegator";
import EditFlashcardDialog from "@old/components/EditFlashcardDialog";
import KoohiiDictList from "@/vue/KoohiiDictList.vue";
import KoohiiEditStory from "@/vue/KoohiiEditStory.vue";
import SharedStoriesComponent from "@old/components/SharedStoriesComponent";

const CLASS_ACTIVE = "active";

type StudyPageOptions = {
  URL_SEARCH: string;
};

export default {
  options: {} as StudyPageOptions,

  elEditFlashcard: null as Element | null,
  oEditFlashcard: null as EditFlashcardDialog | null,

  elSearch: (null as any) as HTMLInputElement,

  dictVisible: false,
  dictPanel: null as AjaxPanel | null,

  initialize(options: StudyPageOptions) {
    // options & php constants
    this.options = options;

    // references
    this.elSearch = domGet<HTMLInputElement>("txtSearch")!;

    // quick search autocomplete
    const actb1 = new actb(this.elSearch, window.kwlist);
    actb1.onChangeCallback = this.quicksearchOnChangeCallback.bind(this);
    actb1.onPressEnterCallback = this.quicksearchEnterCallback.bind(this);

    actb1.actb_extracolumns = function(iRow) {
      return `<span class="f">${iRow +
        1}</span><span class="k cj-k" lang="ja" xml:lang="ja">&#${window.kklist.charCodeAt(
        iRow
      )};</span>`;
    };

    // clicking in quick search box selects the text
    $$(this.elSearch).on("focus", (evt: Event) => {
      if (this.elSearch.value !== "") {
        this.elSearch.select();
      }
    });

    // auto focus search box
    if (this.elSearch && this.elSearch.value === "") {
      this.elSearch.focus();
    }

    let elEditStory = domGet("JsEditStoryInst")!;
    window.Koohii.Refs.vueEditStory = VueInstance(
      KoohiiEditStory,
      elEditStory,
      window.KK_EDITSTORY_PROPS
    );

    const elDictStudy = domGet("DictStudy");
    elDictStudy && this.initDictionary(elDictStudy);

    const elSharedStories = domGet("SharedStoriesComponent");
    if (elSharedStories) {
      new SharedStoriesComponent(this, elSharedStories);
    }

    const elEditFlashcard = domGet("EditFlashcard");
    if (elEditFlashcard) {
      this.elEditFlashcard = elEditFlashcard;
      var ed = new (EventDelegator as IEventDelegator)(
        elEditFlashcard,
        "click"
      );
      ed.on("JsEditFlashcard", this.onEditFlashcard, this);
    }

    console.log("@entry study ...done");
  },

  initDictionary(el: Element) {
    $$("#DictHead").on("click", this.toggleDictionary.bind(this));
    this.dictVisible = false;
    this.dictPanel = null;
  },

  toggleDictionary(evt: Event) {
    const visible = !this.dictVisible;
    const $elBody = $$<HTMLElement>("#JsDictBody");

    $elBody.toggle(visible);
    this.dictVisible = visible;

    if (!this.dictPanel) {
      // use inner div set in the php template
      let elMount = $elBody.down(".JsMount")[0];
      let inst = VueInstance(KoohiiDictList, elMount) as TVueInstanceOf<
        typeof KoohiiDictList
      >;
      let ucsId = parseInt($elBody[0].dataset.ucs!);
      inst.load(ucsId);

      this.dictPanel = true;
    }
  },

  onEditFlashcard(evt: Event, el: HTMLElement) {
    let data = el.dataset;

    function onMenuResponse(result: "added" | "deleted") {
      // update icon to reflect new flashcard state
      let z = { added: "1", deleted: "0" };
      if (z.hasOwnProperty(result)) {
        let div = el.parentElement!;
        div.className = div.className.replace(
          /\bis-toggle-\d\b/,
          "is-toggle-" + z[result]
        );
      }
    }

    function onMenuHide() {
      // clear icon focus state when dialog closes
      el.classList.remove(CLASS_ACTIVE);
    }

    el.classList.add(CLASS_ACTIVE);

    if (!this.oEditFlashcard) {
      this.oEditFlashcard = new EditFlashcardDialog(
        data.uri!,
        JSON.parse(data.param!),
        [this.elEditFlashcard, "tr", "br"],
        {
          events: {
            onMenuResponse: onMenuResponse,
            onMenuHide: onMenuHide,
            scope: this,
          },
        }
      );
    } else {
      (this.oEditFlashcard as any).show();
    }

    return false;
  },

  /**
   * Auto-complete onchange callback, fires after user selects
   * something from the drop down list.
   *
   * @param  string  text  String typed into the searchbox
   *
   * @see    autocomplete.js
   */
  quicksearchOnChangeCallback(text: string) {
    if (text.length > 0) {
      // Lookup the first kanji if there is any kanji in the search string, ignore other characters
      // Regexp is equivalent of \p{InCJK_Unified_Ideographs}
      if (/([\u4e00-\u9fff])/.test(text)) {
        text = RegExp.$1;
      }

      window.location.href =
        this.options.URL_SEARCH + "/" + this.anesthetizeThisBloodyUri(text);
      return true;
    }
  },

  /**
   * Auto-complete ENTER key callback.
   *
   * @see    autocomplete.js
   */
  quicksearchEnterCallback(text: string) {
    this.quicksearchOnChangeCallback(text);
  },

  /**
   * Replaces problematic characters in the url which cause trouble
   * either with parsing the route (slash) or some kind of filter on the
   * web host's side which returns a 404 for urls with uncommon dot patterns
   * (eg. "/study/kanji/made in...").
   *
   * On the backend side, the dashes become wildcards.
   */
  anesthetizeThisBloodyUri(annoyingUri: string) {
    var s = annoyingUri.replace(/[\/\.]/g, "-");
    return encodeURIComponent(s);
  },
};
