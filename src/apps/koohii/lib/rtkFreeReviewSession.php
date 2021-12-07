<?php
/**
 * rtkFreeReviewSession maintains the state of flashcard answers during a non
 * SRS review session. The answers can then be passed to the Review Summary.
 *
 * Usage:
 *
 *   Instancing the class to create, or re-create (from session):
 *     $oFRS = new rtkFreeReviewSession(true);
 *
 *   Restore from the session:
 *     $oFRS = new rtkFreeReviewSession();
 *
 * Methods:
 *
 *   getOptions()
 *   updateFlashcard($ucsId, $answer)
 *   getReviewedCards()
 */
class rtkFreeReviewSession
{
  protected $user;
  protected $cardstatus;
  protected $options;

  /**
   * Session variable which stores flashcard data and answers.
   */
  const SESS_CARD_ANSWERS = 'freemode_session';

  /**
   * Instance the flashcard review session, to start it or get access to the
   * stored data.
   *
   * @param bool $start True to intialize the session
   *
   * @constructor
   */
  public function __construct($start = false)
  {
    $this->user = sfContext::getInstance()->getUser();

    if ($start)
    {
      $this->cardstatus = [];

      $this->user->setAttribute(self::SESS_CARD_ANSWERS, []);
    }
    else
    {
      // restore flashcard update status from the session
      $this->cardstatus = $this->user->getAttribute(self::SESS_CARD_ANSWERS, []);
    }
  }

  /**
   * Sets flashcard answer in session.
   *
   * @param int    $ucsId  UCS-2 code point
   * @param string $answer
   */
  public function updateFlashcard($ucsId, $answer)
  {
    $this->cardstatus[$ucsId] = $answer;

    $this->user->setAttribute(self::SESS_CARD_ANSWERS, $this->cardstatus);
  }

  /**
   * Returns the flashcard selection or flashcard data.
   *
   * @Return array
   */
  public function getReviewedCards()
  {
    return $this->cardstatus;
  }
}
