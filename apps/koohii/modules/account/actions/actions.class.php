<?php

class accountActions extends sfActions
{
  // Answer for the registration question (must be lowercase)
  // - accents for spanish style languages :  Tóquio
  // - misspellings : toyko
  // - hiragana : とうきょう
  // 
  //
  const VALID_ANSWERS = '^\s*(t[oō]+u?[ky][kiy][oō]+u?|東京|とうきょう|とき[ょお]|t[óÓ][kq]u?io)\s*$';

  // period to enforce max. registrations (hours)
  const BETWEEN_REGS_TIME = 24;

  // max registrations within period
  const MAX_REGS_BETWEEN_TIME = 2;

  // returns false if max registrations within period has been reached by unique IP
  private function checkMaxRegsWithinPeriod($regip)
  {
    $time = time();
    $ts_since = $time - (60 * 60 * self::BETWEEN_REGS_TIME);

    $regcount = UsersPeer::getRegistrationCount($regip, self::BETWEEN_REGS_TIME);

    return ($regcount < self::MAX_REGS_BETWEEN_TIME);
  }

  public function executeIndex($request)
  {
    $userId = $this->getUser()->getUserId();
//    $this->redirect('account/edit');
    $user = $this->getUser()->getUserDetails();
    $this->forward404If(false === $user);

    $this->user = $user;
    $this->flashcard_count  = ReviewsPeer::getFlashcardCount($userId);
    $this->reviewed_count   = ReviewsPeer::getReviewedFlashcardCount($userId);
    $this->total_reviews    = ReviewsPeer::getTotalReviews($userId);
  }

  /**
   * Create a new account.
   * 
   * @return 
   */
  public function executeCreate($request)
  {
    //$throttler = new RequestThrottler($this->getUser(), 'badbot');
    //$throttler->setInterval(2);
    /*
    if (!$throttler->isValid()) {
      $throttler->setTimeout();
      $response->setContentType('html');
      return $this->renderPartial('misc/requestThrottleError');
    }*/
    
    $sfs = new StopForumSpam();

    // log IPs to investigate bots/spam wasting database space
    $regip = StopForumSpam::getRemoteAddress();

    // limit number of registrations per IP within a period of time
    if (!$this->checkMaxRegsWithinPeriod($regip))
    {
      // save database queries on next requests (needs testing)
      //$throttler->setInterval(60*60): // 1 hour
      //$throttler->setTimeout();

      $sfs->logActivity($regip, 'Too many registrations');

      $this->setLayout(false);
      $this->getResponse()->setStatusCode(403);
      return $this->renderText('Too many registrations within '.self::BETWEEN_REGS_TIME.'h period.');
    }  


    if ($request->getMethod() != sfRequest::POST)
    {
      // setup form

      // development
      /*
      if (CORE_ENVIRONMENT==='dev')
      {
        $request->getParameterHolder()->add(array(
          'username' => '...' . rand(1,1000),
          'email' => '...',
          'password'=>'xxxxx',
          'password2'=>'xxxxx',
          'location'=>'Foo Bar')
        );
      }*/
    }
    else
    {
      $validator = new coreValidator($this->getActionName());
      
      if ($validator->validate($request->getParameterHolder()->getAll()))
      {
        $this->username = trim($request->getParameter('username'));
        $email          = trim($request->getParameter('email'));
        $raw_password   = trim($request->getParameter('password'));
        
        if (UsersPeer::usernameExists($this->username))
        {
          $request->setError('username', 'Sorry, that username is taken, please use another one.');
          return sfView::SUCCESS;
        }

        $answer = trim($request->getParameter('question'));
        

        // log activity of spam bots se we know if there is abuse
        mb_regex_encoding('UTF-8');
        if (true !== mb_ereg_match(self::VALID_ANSWERS, strtolower($answer)))
        {
          if (empty($answer))
          {
            $sfs->logActivity($regip, 'NO answer to the anti-spam question');
            // on va tester un 403 au lieu du 404 (qui semble inciter le bot à doubler la requête)
            $this->getResponse()->setStatusCode(403);

            $request->setError('question', 'Woops, did you forget to answer the question?');
            return sfView::SUCCESS;
          }
          else
          {
            $request->setError('question', 'The answer is not correct, or misspelled.');
            $sfs->logActivity($regip, 'WRONG answer to the anti-spam question ("'.$answer.'")');
            return sfView::SUCCESS;
          }
        }

        // if the user answers correctly it is very unlikely to be a bot, however it could be a human spammer
        $sfs_result = $sfs->checkRegistration($this->username, $email, $answer);
        if (StopForumSpam::SFS_CR_FAILED === $sfs_result)
        {
          // $s = 'Woops, if you are seeing this message and you are not a spam bot '.
          //      'don\'t worry, just click the link below "Request an account" and '.
          //      'Fabrice (admin) will create an account for you as soon as possible. Please make '.
          //      'sure to include in the message the exact username you would like.';
          // $request->setError('error', $s);
          // return sfView::SUCCESS;
          
          $this->getResponse()->setStatusCode(403);

          return $this->renderText('Invalid request');
        }
        else if (StopForumSpam::SFS_CR_TIMEOUT === $sfs_result)
        {
          /* faB (2013/09/03): lots of SFS timeouts recently, let user through
          $s = 'Connection timeout. We have to check IP addresses to block spambots. '.
               'This process can sometimes be unresponsive. Please try again in a minute. '.
               'If you are still experiencing problems please use the link below "Request an account" '.
               'and Fabrice (admin) will create an account for you as soon as possible!';
          $request->setError('error', $s);
          return sfView::SUCCESS;
          */
        }

        $userinfo = array(
          'username'     => trim($request->getParameter('username')),
          'raw_password' => $raw_password,
          'email'        => $email,
          'location'     => trim($request->getParameter('location', '')),
          'regip'        => $regip
        );

        // username is available, create user
        UsersPeer::createUser($userinfo);

        // send email confirmation
        if (CORE_ENVIRONMENT !== 'dev')
        {
          $mailer = new rtkMail();
          $mailer->sendNewAccountConfirmation($userinfo['email'], $userinfo['username'], $raw_password);
        }
        
        return 'Done';
      }

      // temporary, log validation errors to get a better idea of what user is trying to enter and improve validation
      if ($request->hasError('location')) {
        $sfs->logActivity($regip, 'Location error: "'.$request->getParameter('location').'"');
      }

    }
  }

  /**
   * Edit Account
   *
   */
  public function executeEdit($request)
  {
    if ($request->getMethod() != sfRequest::POST)
    {
      // fill in form with current account details
      $userdata = $this->getUser()->getUserDetails();
      $formdata = array(
        'username' => $userdata['username'],
        'location' => $userdata['location'],
        'email'    => $userdata['email'],
        'timezone' => $userdata['timezone']
      );
      $request->getParameterHolder()->add($formdata);
    }
    else
    {
      $validator = new coreValidator($this->getActionName());
      
      if ($validator->validate($request->getParameterHolder()->getAll()))
      {
        $userdata = array(
          'email'    => trim($request->getParameter('email')),
          'location' => trim($request->getParameter('location', '')),
          'timezone' => (float) trim($request->getParameter('timezone'))
        );
        
        if (UsersPeer::updateUser($this->getUser()->getUserId(), $userdata))
        {
          $this->redirect('account/index');
        }
      }
    }

  }

  /**
   * Forgot Password page.
   * 
   * Request the email address, because the form is less easily abused this way
   * (restting another person's password, or spamming another person's emails)
   * 
   * Still too simplistic, ideally should add another step so that the password
   * is not automatically reset.
   * 
   */
  public function executeForgotPassword($request)
  {
    if ($request->getMethod() != sfRequest::POST)
    {
      return sfView::SUCCESS;
    }
    
    // handle the form submission
    $validator = new coreValidator($this->getActionName());
    
    if ($validator->validate($request->getParameterHolder()->getAll()))
    {
      $email_address = trim($request->getParameter('email_address'));
      $user = UsersPeer::getUserByEmail($email_address);

      if ($user)
      {
        // set new random password
        $raw_password = strtoupper(substr(md5(rand(100000, 999999)), 0, 8));

        // update the password on main site and forum
        $this->getUser()->changePassword($user['username'], $raw_password);
        
        // send email with new password, user username from db here to email user with the
        // username in the exact CaSe they registered with
        $mailer = new rtkMail();
        $mailer->sendForgotPasswordConfirmation($user['email'], $user['username'], $raw_password);

        return 'MailSent';
      }
      else
      {
        $request->setError('email', 'Sorry, no user found with that email address.');
        return sfView::SUCCESS;
      }
    }
  }

  /**
   * Change Password.
   *
   * Update the user's password on the RevTK site AND the corresponding PunBB forum account.
   *   
   */
  public function executePassword($request)
  {
    if ($request->getMethod() != sfRequest::POST)
    {
      return sfView::SUCCESS;
    }
    
    // handle the form submission
    $validator = new coreValidator($this->getActionName());
    
    if ($validator->validate($request->getParameterHolder()->getAll()))
    {
      // verify old password
      $oldpassword = trim($request->getParameter('oldpassword'));
      
      $user = $this->getUser()->getUserDetails();
      if ($user && ($this->getUser()->getSaltyHashedPassword($oldpassword) == $user['password']) )
      {
        // proceed with password update
        
        $new_raw_password = trim($request->getParameter('newpassword'));
        
        $user = $this->getUser()->getUserDetails();

        // update the password on main site and forum
        $this->getUser()->changePassword($user['username'], $new_raw_password);

        // save username before signing out
        $this->username = $this->getUser()->getUserName();
  
        // log out user (sign out, clear cookie)
        $this->getUser()->signOut();
        $this->getUser()->clearRememberMeCookie();
        
        try
        {
          if (CORE_ENVIRONMENT !== 'dev')
          {
            // send email confirmation
            $mailer = new rtkMail();
            $mailer->sendUpdatePasswordConfirmation($user['email'], $user['username'], $new_raw_password);
          }
        }
        catch (sfException $e)
        {
          $request->setError('mail_error', 'Oops, we tried sending you a confirmation email but the mail server didn\'t respond. Your password has been updated though!');
        }

        return 'Done';
      }
      else
      {
        $request->setError('password', "Old password doesn't match.");
      }
    }

    // clear the password fields (avoid input mistakes)
    $request->setParameter('oldpassword', '');
    $request->setParameter('newpassword', '');
    $request->setParameter('newpassword2', '');
  }

  public function executeFlashcards($request)
  {
    $user = $this->getUser();

    if ($request->getMethod() != sfRequest::POST)
    {
      $form_data = array(
        'opt_no_shuffle' => $user->getUserSetting('OPT_NO_SHUFFLE'),
        'opt_readings'   => $user->getUserSetting('OPT_READINGS')
      );
      $request->getParameterHolder()->add($form_data);
    }
    else
    {
      $settings = array(
        'OPT_NO_SHUFFLE' => $request->getParameter('opt_no_shuffle', 0),
        'OPT_READINGS'   => $request->getParameter('opt_readings', 0)
      );

      UsersSettingsPeer::saveUserSettings($user->getUserId(), $settings);
      $user->cacheUserSettings($settings);
    }
  }

  public function executeSpacedrepetition($request)
  {
    $user = $this->getUser();

    if ($request->getMethod() != sfRequest::POST)
    {
      //
    }
    else
    {
      // validate
      $opt_srs_max_box  = intval($request->getParameter('opt_srs_max_box'));
      $opt_srs_mult     = intval($request->getParameter('opt_srs_mult'));
      $opt_srs_hard_box = intval($request->getParameter('opt_srs_hard_box'));

      // needs to match the Vue form validation
      if ($opt_srs_max_box < 5 || $opt_srs_max_box > 10 ||
          $opt_srs_mult < 130 || $opt_srs_mult > 400 ||
          $opt_srs_hard_box >= $opt_srs_max_box) {
        $request->setError('x', 'Invalid form submission');
      }
      else
      {
        $settings = [
          'OPT_SRS_MAX_BOX'  => $opt_srs_max_box,
          'OPT_SRS_MULT'     => $opt_srs_mult,
          'OPT_SRS_HARD_BOX' => $opt_srs_hard_box
        ];

        UsersSettingsPeer::saveUserSettings($user->getUserId(), $settings);
        $user->cacheUserSettings($settings);
      }
    }

    $this->srs_settings = [
      $user->getUserSetting('OPT_SRS_MAX_BOX'),
      $user->getUserSetting('OPT_SRS_MULT'),
      $user->getUserSetting('OPT_SRS_HARD_BOX')
    ];
  }

  public function executeSequence($request)
  {
    if ($request->getMethod() != sfRequest::POST)
    {
      $curSeq = rtkIndex::getSequenceInfo();
      $formdata = array('optSeq' => array($curSeq['classId']));
      $request->getParameterHolder()->add($formdata);
    }
    else
    {
      $optSeq = $request->getParameter('optSeq', array())[0];

      foreach (rtkIndex::getSequences() as $seq)
      {
        // only update if the parameter matches a known sequence
        if ($seq['classId'] === $optSeq)
        {
          $userdata = array('opt_sequence' => $seq['sqlId']);
          
          if (UsersPeer::updateUser($this->getUser()->getUserId(), $userdata))
          {
            $this->getUser()->setAttributes(array('usersequence' => $seq['sqlId']));
            return;
          }
        }
      }

      $this->forward404();
    }
  }

  /**
   * Patreon login redirect (OAuth)
   *
   *  http://kanji.koohii.com/account/patreon ? code=<single use code> & state=<string>
   *  
   */
  public function executePatreon($request)
  {
    require_once(sfConfig::get('sf_lib_dir').'/vendor/Patreon/__patreon.php');

    $single_use_code = $request->getParameter('code', null);
    $this->forward404If(empty($single_use_code), 'Invalid request (#1).');

    $oauth_client = new Patreon\OAuth(PATREON_CLIENT_ID, PATREON_CLIENT_SECRET);

    // Step 3
    $tokens = $oauth_client->get_tokens($single_use_code, PATREON_REDIRECT_URI);
    $patron_access_token = $tokens['access_token'];

    // sanity checks
    $this->forward404If(empty($tokens) || isset($tokens['error']), 'Invalid request (#2).');
    $this->forward404If(strlen($patron_access_token) !== 30, 'Invalid access token (#3).');

// DBG::printr($tokens);exit;

    // don't use the creator token here
    $paInst = kkPatreon::getInstance(array('access_token' => $patron_access_token));
    
    if ($paInst->fetch_user_and_link_account($this->getUser()->getUserId()))
    {
      $this->redirect('account/index');
    }

    echo "Hmm. Patron authorization didn't work. Please let me know! (#4)";exit;
  }
}
