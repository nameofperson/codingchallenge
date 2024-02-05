trigger AccountTrigger on Account(after update) {
  AccountTriggerHandler handler = new AccountTriggerHandler();

  if (Trigger.isUpdate) {
    if (Trigger.isAfter) {
      handler.handleAfterUpdate(Trigger.newMap, Trigger.oldMap);
    }
  }
}
