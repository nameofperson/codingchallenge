/**
 * Trigger Handler for the RiskValueChange__e Platform Event
 */
public with sharing class RiskTriggerHandler {
  private Boolean isHandlerActive = false;
  private RiskTriggerHelper rtHelper = new RiskTriggerHelper();

  /**
   * @description handleAfterInsert Processes records in the AfterInsert scenario
   * @param  newRecords newRecords incoming platform event records
   */
  public void handleAfterInsert(List<RiskValueChange__e> newRecords) {
    if (this.isHandlerActive == true) {
      rtHelper.createCaseOnHighRisk(newRecords);
    }
  }
}
