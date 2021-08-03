<?php
class labsActions extends sfActions
{
  public function executeIndex($request)
  {
  }
  
  /**
   * Start iVocabShuffle flashcard review using Heisig #.
   *
   */
  public function executeShuffle1($request)
  {
    $this->setLayout('fullscreenLayout');

    $max_framenum = $request->getParameter('max_framenum', 0);
      
    if ($request->hasParameter('max_framenum'))
    {
      $this->forward404If($max_framenum < 1 || $max_framenum > rtkIndex::inst()->getNumCharacters(), 'Invalid card range');
    }

    $reviewOptions['items']    = rtkLabs::getVocabShuffleMode1Items($max_framenum);
    $reviewOptions['ajax_url'] = $this->getController()->genUrl('labs/ajax');
    $reviewOptions['exit_url'] = 'review/vocab';
    
    // these will be variables in the review template partial
    $this->reviewOptions = $reviewOptions;

    $uiFR = new uiFlashcardReview([], true);
  }

  /**
   * Start iVocabShuffle flashcard review using learned kanji in the SRS!
   *
   */
  public function executeShuffle2($request)
  {
    $this->setLayout('fullscreenLayout');

    $reviewOptions['items']    = rtkLabs::getVocabShuffleMode2Items();
    $reviewOptions['ajax_url'] = $this->getController()->genUrl('labs/ajax');
    $reviewOptions['exit_url'] = 'review/vocab';

    // these will be variables in the review template partial
    $this->reviewOptions = $reviewOptions;

    $uiFR = new uiFlashcardReview([], true);
  }

  /**
   * iVocabShuffle ajax handler.
   * 
   * @see  uiFlashcardReview.php for POST request parameters.
   *
   */
  public function executeAjax($request)
  {
    $oJson = coreJson::decode($request->getParameter('json', '{}'));

    if (!empty($oJson))
    {
      $flashcardReview = new uiFlashcardReview(
        [
          'fn_get_flashcard' => ['rtkLabs', 'getVocabShuffleCardData']
        ]
      );

      $this->getResponse()->setContentType('application/json');
      return $this->renderText( $flashcardReview->handleJsonRequest($oJson) );
    }

    throw new rtkAjaxException('Empty JSON Request.');
  }
}
