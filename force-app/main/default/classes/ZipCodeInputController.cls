/**
 * Controller for ZipCodeInputCmp LWC
 */
public with sharing class ZipCodeInputController {
  /**
   * @description storeAPIResponse Stores retrieved results from API into object
   * @param  targetData targetData Target data to store
   * @return            return boolean to express result of save
   */
  @AuraEnabled(cacheable=false)
  public static boolean storeAPIResponse(ZipCodeStoreRequest targetData) {
    try {
      if (targetData.countryCode != 'US') {
        ZipCodeResult__c newData = new ZipCodeResult__c(
          Country__c = targetData?.country,
          CountryCode__c = targetData?.countryCode,
          Latitude__c = targetData?.latitude,
          Longitude__c = targetData?.longitude,
          State__c = targetData?.state,
          StateCode__c = targetData?.stateCode,
          PostCode__c = targetData?.postCode,
          PlaceName__c = targetData?.placeName
        );
        insert newData;
        return true;
      } else {
        return false;
      }
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  /**
   * Transformation class for frontend data
   */
  public class ZipCodeStoreRequest {
    @AuraEnabled
    public String countryCode { get; set; }

    @AuraEnabled
    public String country { get; set; }

    @AuraEnabled
    public Decimal latitude { get; set; }

    @AuraEnabled
    public Decimal longitude { get; set; }

    @AuraEnabled
    public String postCode { get; set; }

    @AuraEnabled
    public String stateCode { get; set; }

    @AuraEnabled
    public String state { get; set; }

    @AuraEnabled
    public String placeName { get; set; }
  }
}
