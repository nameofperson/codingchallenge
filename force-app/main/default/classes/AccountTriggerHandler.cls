/**
 * Trigger Handler for the Account object
 */
public with sharing class AccountTriggerHandler {
  private Boolean isHandlerActive = false;
  private AccountTriggerHelper accHelper = new AccountTriggerHelper();

  /**
   * @description handleAfterUpdate Processes records in the AfterUpdate scenario
   * @param  newRecordsMap newRecordsMap new account records
   * @param  oldRecordsMap oldRecordsMap previous account records
   */
  public void handleAfterUpdate(Map<Id, Account> newRecordsMap, Map<Id, Account> oldRecordsMap) {
    if (this.isHandlerActive == true) {
      accHelper.publishPlatformEventOnRiskChange(newRecordsMap, oldRecordsMap);
    }
  }
}
