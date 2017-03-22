<?php
  use_helper('SimpleDate');
  $sf_request->setParameter('_homeFooter', true);

  if ($select === 'recent')
  {
    // show recent news posts as on homepage
    $posts = SitenewsPeer::getMostRecentPosts();
    $title = 'Blog / Archive';
  }
  elseif (is_array($select))
  {
    // show a selection of articles by month on the news archive page
    $year   = $select[0];
    $month  = $select[1];

    $posts = SitenewsPeer::getPostsByDate($year, $month);

    $selection = simple_format_date(mktime(0,0,0,$month,1,$year), "F Y");
    $title = 'Blog / '.$selection;
  }
  
  $sf_response->setTitle($title);
?>

<div class="row">

  <div class="col-md-9">

    <h2><?php echo $title ?></h2>

    <?php include_partial('news/list', array('posts' => $posts)) ?>

    <div id="sitenews_back">
      <?php echo _bs_button('&laquo; Back', '@homepage', array('class' => 'btn btn-success')) ?>
    </div>

  </div>

  <div class="col-md-3">
    <?php include_partial('archiveList') ?>
  </div>

</div>
