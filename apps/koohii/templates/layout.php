<!DOCTYPE html>
<html>
<head>
<?php include_http_metas() ?>
  <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1, minimum-scale=1, maximum-scale=1">
<?php include_metas() ?>
<?php if (CORE_ENVIRONMENT === 'staging') { echo '<meta name="robots" content="noindex, nofollow" />'."\n"; } ?>
<?php include_title() ?>
<?php 
  $pageId      = $sf_request->getParameter('module').'-'.$sf_request->getParameter('action');
  $landingPage = $sf_request->getParameter('_landingPage');
  $withFooter  = $sf_request->getParameter('_homeFooter') ? 'with-footer ' : '';

  if ($landingPage) {
    // remove the global  view.yml  styles/scripts
    $sf_response->clearStuffsRefactorMe();
  }

  // note: usd CDNs ?

  if ($landingPage) {
    $sf_response->addStylesheet('/koohii/home.juicy.css', 'first');
    $sf_response->addStylesheet('/build/pack/app-vue.css');
  }
?>
<?php include_stylesheets() ?>
  <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">

  <!-- thx realfavicongenerator.net -->
  <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png?v=20170121b">
  <link rel="icon" type="image/png" href="/favicons/favicon-32x32.png?v=20170121" sizes="32x32">
  <link rel="icon" type="image/png" href="/favicons/favicon-16x16.png?v=20170121" sizes="16x16">
  <link rel="manifest" href="/favicons/manifest.json?v=20170121">
  <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg?v=20170121" color="#deb214">
  <link rel="shortcut icon" href="/favicons/favicon.ico?v=20170121">
  <meta name="apple-mobile-web-app-title" content="Koohii">
  <meta name="application-name" content="Koohii">
  <meta name="msapplication-TileColor" content="#f8c5e3">
  <meta name="msapplication-TileImage" content="/favicons/mstile-144x144.png?v=20170121">
  <meta name="msapplication-config" content="/favicons/browserconfig.xml?v=20170121">
  <meta name="theme-color" content="#f0ddd4">


<?php if(has_slot('inline_styles')): ?>
  <style type="text/css">
<?php include_slot('inline_styles') ?>
  </style>
<?php endif ?>
<?php if (CORE_ENVIRONMENT === 'prod') { use_helper('__Analytics'); /* async */ echo ga_tracking_code(); } ?>
</head>
<body class="<?php echo $withFooter ?>yui-skin-sam <?php $pageId = $sf_request->getParameter('module').'-'.$sf_request->getParameter('action'); echo $pageId; ?>">

<?php /*AjaxDebug (app.js)*/ if (CORE_ENVIRONMENT === 'dev'): ?><div id="AppAjaxFilterDebug" style="display:none"></div><?php endif ?>

<!--[if lt IE 9]><div id="ie"><![endif]--> 

<?php include_partial('global/navbar', array('pageId' => $pageId, 'landingPage' => $landingPage)) ?>

<?php if ($landingPage) {
  echo $sf_content;
} else { ?>
<div id="main">
  <div id="main_container" class="container">
<?php echo $sf_content ?>
  </div>
</div>
<?php if ($sf_request->getParameter('_homeFooter')) { include_partial('home/homeFooter'); } ?>
<?php } ?>

<?php
  if (1 || !$landingPage) {
    $ext = (CORE_ENVIRONMENT === 'dev') ? '.raw' : '.min';
    $sf_response->addJavascript("/build/pack/vue-bundle$ext.js", "first"); //add before legacy code so it kicks in sooner
  }
  include_javascripts();

  if(has_slot('inline_javascript')) {
    echo "<script>\n" . get_slot('inline_javascript') . "</script>\n";
  }
?>

<script type="text/javascript">
var koohii_nav_data = <?php echo json_encode(get_slot('koohii.nav.data'), /*JSON_PRETTY_PRINT |*/ JSON_UNESCAPED_SLASHES) ?>;

$('#k-slide-nav-btn').on("click", function(){
  Koohii.UX.KoohiiAside.open({
    navOptionsMenu: koohii_nav_data
  })
})
</script>

<?php if (CORE_ENVIRONMENT === 'dev'):  ?>
<script>
  // auto-collapse sf debug bar
  window.addEventListener("load", function(ev){
    if (typeof sfWebDebugToggleMenu !== "undefined") {
      sfWebDebugToggleMenu();
    }
  });
</script>
<?php endif ?>


<!--[if IE]></div><![endif]--> 

<div id="__debug_log"></div>
<?php if ($sf_user->getUserName() === 'fuaburisu' || $sf_user->isAdministrator()) {
  $_pc = sfProjectConfiguration::getActive();
  $_db = $_pc->getDatabase();
  if ($_db->getProfiler()) { echo $_db->getProfiler()->getDebugLog(); }
  echo '<div style="background:#fff;font:15px/1em Arial;padding:5px 10px;text-align:right;overflow:hidden;">'.$_pc->getAdminInfoFooter().'</div>';
} ?>

<?php /*
  <div id="footer">
    <p>
    <?php echo link_to('home', '@homepage') ?>&nbsp;|
    <?php echo link_to('about', 'about/index') ?>&nbsp;|
    <?php echo link_to('contact', '@contact') ?>&nbsp;|
    User contributions licensed under <?php echo link_to('CC-BY-SA-NC', 'http://creativecommons.org/licenses/by-nc-sa/3.0/') ?> <?php echo link_to('with attribution', 'about/license') ?>
    |&nbsp;<span id="dbgtime"><?php echo sfProjectConfiguration::getActive()->profileEnd() ?>s</span>
    </p>
  </div>
*/ ?>

</body>
</html>
