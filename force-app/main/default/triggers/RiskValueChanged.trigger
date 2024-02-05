trigger RiskValueChanged on RiskValueChange__e(after insert) {
  RiskTriggerHandler handler = new RiskTriggerHandler();

  if (Trigger.isInsert) {
    if (Trigger.isAfter) {
      handler.handleAfterInsert(Trigger.new);
    }
  }
}
