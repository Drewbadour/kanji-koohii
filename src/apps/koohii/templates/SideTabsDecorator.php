<div id="manage-cards">
  <div class="row">

    <div class="col-lg-3">
      <?php include_partial('SideNav', ['active' => $active]) ?>
    </div>

    <div class="col-lg-9">
      <div class="views">
        <div id="manage-view" class="manage-view">
  <?php echo $decorator_content; ?>
        </div>
      </div>
    </div>

  </div>
</div>
