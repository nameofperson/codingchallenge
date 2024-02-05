/**
 * Helper class for handler of Account trigger
 */
public with sharing class AccountTriggerHelper {
  /**
   * @description publishPlatformEventOnRiskChange publishes a platform event on 'High' Risk value
   * @param  newRecordsMap newRecordsMap incoming changed Account records
   * @param  oldRecordsMap oldRecordsMap previous changed Account records
   */
  public void publishPlatformEventOnRiskChange(Map<Id, Account> newRecordsMap, Map<Id, Account> oldRecordsMap) {
    List<RiskValueChange__e> publishedEvents = new List<RiskValueChange__e>();
    Account prevAccount;
    Account currentAccount;

    for (Id recordId : newRecordsMap.keySet()) {
      try {
        prevAccount = oldRecordsMap.get(recordId);
        currentAccount = newRecordsMap.get(recordId);

        if (prevAccount.Risk__c != currentAccount.Risk__c && currentAccount.Risk__c == 'High') {
          RiskValueChange__e targetEvent = (RiskValueChange__e) RiskValueChange__e.sObjectType.newSObject(null, true);
          targetEvent.AccountId__c = currentAccount.Id;
          targetEvent.RiskValue__c = currentAccount.Risk__c;
          publishedEvents.add(targetEvent);
        }
      } catch (Exception ex) {
        currentAccount.addError('There was a problem saving your data, please try again');
      }
    }

    if (publishedEvents.size() > 0) {
      List<Database.SaveResult> results = EventBus.publish(publishedEvents);

      for (Database.SaveResult sr : results) {
        if (sr.isSuccess()) {
          System.debug('Successfully published event.');
        } else {
          for (Database.Error err : sr.getErrors()) {
            System.debug('Error returned: ' + err.getStatusCode() + ' - ' + err.getMessage());
          }
        }
      }
    }
  }
}
