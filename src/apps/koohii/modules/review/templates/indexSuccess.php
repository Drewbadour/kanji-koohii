<?php
  $todayCount = ReviewsPeer::getTodayCount($sf_user->getUserId());
?>
<h2>Spaced Repetition</h2>

<div id="srs-summary" class="text-lg mb-2">
  <span class="total"><strong><?= $flashcard_count; ?></strong> flashcards</span>
  <span class="today"><strong><?= $todayCount; ?></strong> reviews today</span>
</div>

<div class="mb-8">
  <div id="view-pane-all" class="rtk-filter-pane">
    <?php include_component('review', 'LeitnerChart'); ?>
  </div>
</div>

<h3>Due cards next week</h3>
<p>The following bar chart represents how many cards are scheduled for review over the next week.</p>
<?php include_component('review', 'DueCardsGraph'); ?>
