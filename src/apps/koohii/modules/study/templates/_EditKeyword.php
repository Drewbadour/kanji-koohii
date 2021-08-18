<?php use_helper('CJK', 'Form', 'Validation'); ?>

<div id="edit-keyword" class="body">

  <?php echo form_errors(); ?>

  <?php echo form_tag('study/editkeyword?id='.$ucs_id); ?>

    <p>Press <kbd>Enter</kbd> to save and close the dialog.</p>
    
<?php if ($sf_request->hasParameter('manage')) { ?>    
    <p> Tip: press <kbd>TAB</kbd> to save and edit the next keyword.</p>
<?php } ?>

    <!--?php echo rtkImportKeywords::MAX_KEYWORD ?> characters maximum. -->
    
    <?php echo input_tag('keyword', $keyword, ['class' => 'txt-ckw JSDialogFocus', 'autocomplete' => 'off']); ?>

    <div class="mt-4 flex items-center justify-end">
      <a href="#" class="JsReset inline-block text-[#f37200] hover:text-[#f37200] mr-4" data-reset="<?php echo $orig_keyword; ?>">Reset</a>
      <?php echo submit_tag('Save', ['class' => 'btn btn-success btn-sm']); ?>
    </div>

  </form>
</div>
