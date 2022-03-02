/**
 * LANDING PAGE BUNDLE
 *
 *   Includes:
 *   - root-bundle: Vue, mobile navigation, globals
 *   - the landing page stylesheet
 *
 */

// stylesheets
import "./assets/sass/home.build.scss";

import rootBundleInit from "@app/root-bundle";
rootBundleInit();

console.log("@entry-landing");
