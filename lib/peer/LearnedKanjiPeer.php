<?php
/**
 * LearnedKanji Peer.
 * 
 * 
 * @author  Fabrice Denis
 */

class LearnedKanjiPeer extends coreDatabaseTable
{
  protected
    $tableName = 'learnedkanji',
    $columns   = array();  // timestamp columns must be declared for insert/update/replace

  /**
   * This function must be copied in each peer class.
   */
  public static function getInstance()
  {
    return coreDatabaseTable::_getInstance(__CLASS__);
  }

  /**
   * Returns count of relearned kanji for given user.
   * 
   * @return mixed  Count, or FALSE on failure
   */
  public static function getCount($userId)
  {
    return (int) self::getInstance()->count('userid = ?', $userId);
  }

  /**
   * 
   * @return boolean
   */
  public static function addKanji($userId, $ucsId)
  {
    assert('(int)$ucsId > 0x3000');

    return self::$db->query('REPLACE INTO '.self::getInstance()->getName().' (userid, ucs_id) VALUES (?, ?)',
      array($userId, $ucsId));
  }
    
  public static function addKanjis($userId, $ucsIds)
  {
    $placeholders = join(',', array_fill(0, count($ucsIds), '(?, ?)'));
    $values = array();
    foreach ($ucsIds as $ucsId)
    {
      assert('(int)$ucsId > 0x3000');
      array_push($values, $userId);
      array_push($values, $ucsId);
    }
     
    return self::$db->query('REPLACE INTO '.self::getInstance()->getName().' (userid, ucs_id) VALUES '.$placeholders,
                              $values);
  }

  /**
   * 
   * @return
   */
  public static function hasKanji($userId, $ucsId)
  {
    assert('(int)$ucsId > 0x3000');

    return self::getInstance()->count('userid = ? AND ucs_id = ?', array($userId, $ucsId)) > 0;
  }

  /**
   * Remove a relearned kanji from the selection.
   * 
   * @return boolean
   */
  public static function clearKanji($userId, $ucsId)
  {
    assert('(int)$ucsId > 0x3000');

    return self::getInstance()->delete('userid = ? AND ucs_id = ?', array($userId, $ucsId));
  }
  
  /**
  * Remove relearned kanjis from the selection.
  *
  * @return boolean
  */
  public static function clearKanjis($userId, $ucsIds)
  {
    foreach ($ucsIds as $ucsId)
    {
      assert('(int)$ucsId > 0x3000');
    }
      
    $values = array($userId);
    array_push($values, $ucsIds);
      
    return self::getInstance()->delete('userid = ? AND ucs_id in (?)', $values);
  }

  /**
   * Clear the relearned kanji list for this user.
   * 
   * @return boolean
   */
  public static function clearAll($userId)
  {
    $user = sfContext::getInstance()->getUser();
    $user->getAttributeHolder()->remove(rtkUser::IS_RESTUDY_SESSION);

    return self::getInstance()->delete('userid = ?', $userId);
  }

  /**
   * Return array of relearned kanji for given user
   *
   * @return array  kanji ids
   */
  public static function getKanji($userId)
  {
    $select = self::getInstance()->select('ucs_id');
    $select->where('userid = ?', $userId);
    $ids = self::$db->fetchCol($select);
    return array_map('intval', $ids);
  }
}
