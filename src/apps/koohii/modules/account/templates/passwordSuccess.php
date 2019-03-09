<?php use_helper('Form', 'Validation', 'Decorator') ?>

<?php decorate_start('SideTabs', array('active' => 'changepassword')) ?>

  <h2>Change Password</h2>

<?php
    // echo form_errors();

    echo form_tag('account/password', array('class'=>'block'));

    echo _bs_form_group(
      ['validate' => 'oldpassword'],
      _bs_input_password('oldpassword', ['label' => 'Old Password'])
    );

    echo _bs_form_group(
      ['validate' => 'newpassword'],
      _bs_input_password('newpassword', ['label' => 'New Password'])
    );

    echo _bs_form_group(
      ['validate' => 'newpassword2'],
      _bs_input_password('newpassword2', ['label' => 'Confirm New Password'])
    );

    echo _bs_form_group(
      _bs_submit_tag('Update Password')
    );
?>
    </form>


<?php koohii_onload_slot() ?>
App.ready(function() {
  var elFocus = YAHOO.util.Dom.get('oldpassword');
  if (elFocus)
  {
    elFocus.focus();
  }
});
<?php end_slot() ?>

<?php decorate_end() ?>
