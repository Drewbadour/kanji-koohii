import App from "@app/app";
import Dom, { domContentLoaded } from "@lib/dom";
import KoohiiAside from "@/vue/Aside";
import KoohiiNav from "@old/components/KoohiiNav";

export default function() {
  console.log("@root-bundle ...");

  window.App = App;

  window.Koohii = {
    Dom: Dom,
    Refs: {},
    UX: {
      // site-wide mobile navigation
      KoohiiAside,
    },
  };

  domContentLoaded(() => {
    // init the site-wide desktop navigation
    KoohiiNav.init();
    App.init();
  });
}
