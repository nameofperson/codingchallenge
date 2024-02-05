/**
 * Helper class for handler of RiskValueChange__e trigger
 */
public with sharing class RiskTriggerHelper {
  /**
   * @description createCaseOnHighRisk Created a Case assigned to the related account on Risk Value change
   * @param  newRecords newRecords target platform event records
   */
  public void createCaseOnHighRisk(List<RiskValueChange__e> newRecords) {
    List<Case> targetCases = new List<Case>();
    Set<Id> accountIdSet = new Set<Id>();
    List<RiskValueChange__e> validEventRecords = new List<RiskValueChange__e>();

    //check incoming records for validity
    for (RiskValueChange__e currentEvent : newRecords) {
      if (currentEvent.AccountId__c != null && currentEvent.RiskValue__c != null) {
        if (currentEvent.RiskValue__c == 'High') {
          accountIdSet.add(currentEvent.AccountId__c);
          validEventRecords.add(currentEvent);
        }
      }
    }

    User adminUser = [
      SELECT Id
      FROM User
      WHERE ProfileId IN (SELECT Id FROM Profile WHERE Name = 'System Administrator')
      LIMIT 1
    ];

    if (validEventRecords.size() == 0) {
      return;
    }

    Map<Id, Account> targetAccounts = new Map<Id, Account>([SELECT Id, OwnerId FROM Account WHERE Id IN :accountIdSet]);

    for (RiskValueChange__e targetEvent : validEventRecords) {
      Case newCase = new Case();
      newCase.Priority = 'Medium';
      newCase.Subject = 'High Risk Status';

      Account currentAccount = targetAccounts.get(targetEvent.AccountId__c);
      newCase.AccountId = currentAccount.Id;

      if (currentAccount.OwnerId == targetEvent.CreatedById) {
        newCase.OwnerId = adminUser.Id;
      } else {
        newCase.OwnerId = targetEvent.CreatedById;
      }

      targetCases.add(newCase);
    }

    // Insert all cases in the list.
    if (targetCases.size() > 0) {
      insert targetCases;

      //set checkpoint in case of error in next batch
      Integer lastItemIndex = validEventRecords.size() - 1;
      EventBus.TriggerContext.currentContext().setResumeCheckpoint(validEventRecords[lastItemIndex].replayId);
    }
  }
}
