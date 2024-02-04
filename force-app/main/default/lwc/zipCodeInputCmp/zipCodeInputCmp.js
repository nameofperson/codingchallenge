import { LightningElement, wire } from "lwc";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { MessageContext, publish } from "lightning/messageService";

import storeAPIResponse from "@salesforce/apex/ZipCodeInputController.storeAPIResponse";
import zipCodeResponseReceivedLMS from "@salesforce/messageChannel/zipCodeResponseReceived__c";

import COUNTRY_CODE_FIELD from "@salesforce/schema/Account.BillingCountryCode";

const API_ENDPOINT = "http://api.zippopotam.us";
const MASTER_RECORDTYPE_ID = "012000000000000AAA";
const PLACES_PROPERTY = "places";
const COUNTRY_PROPERTY = "country";

export default class ZipCodeInputCmp extends LightningElement {
  zipCode;
  countries;
  selectedCountry;
  isLoading = false;
  apiResponse;
  parsedResponse;
  subscription;

  @wire(MessageContext)
  messageContext;

  @wire(getPicklistValues, {
    recordTypeId: MASTER_RECORDTYPE_ID,
    fieldApiName: COUNTRY_CODE_FIELD
  })
  getCountries({ data }) {
    this.countries = data?.values;
  }

  zipCodeChangeHandler(evt) {
    this.zipCode = evt.detail.value;
  }

  countrySelectHandler(evt) {
    this.selectedCountry = evt.detail.value;
  }

  clearHandler(evt) {
    evt.preventDefault();
    this.selectedCountry = "";
    this.zipCode = "";
  }

  async searchHandler(evt) {
    evt.preventDefault();
    this.isLoading = true;
    await this.fetchZipCode();
    if (typeof this.parsedResponse !== "undefined") {
      let event;
      this.publishAPICallResults();
      if (this.parsedResponse["country abbreviation"] === "US") {
        event = new ShowToastEvent({
          variant: "info",
          title: "Search Completed",
          message: "US address, results not saved"
        });
      } else {
        await this.storeAPICallResults();
        event = new ShowToastEvent({
          variant: "success",
          title: "Search completed",
          message: "Non-US address, results stored"
        });
      }
      this.dispatchEvent(event);
    }
  }

  async fetchZipCode() {
    try {
      this.apiResponse = await fetch(
        `${API_ENDPOINT}/${this.selectedCountry}/${this.zipCode}`
      );
      if (!this.apiResponse.ok) {
        throw new Error("Network response was not OK");
      }
      this.parsedResponse = await this.apiResponse.json();
    } catch (err) {
      this.errorHandler(err);
    }
  }

  publishAPICallResults() {
    if (typeof this.parsedResponse !== "undefined") {
      let placesArray =
        Array.isArray(this.parsedResponse[PLACES_PROPERTY]) === false
          ? []
          : this.parsedResponse[PLACES_PROPERTY];
      const payload = {
        countryName: this.parsedResponse[COUNTRY_PROPERTY],
        countryCode: this.parsedResponse["country abbreviation"],
        postCode: this.parsedResponse["post code"],
        placesName: this.checkDataValidity(placesArray, "place name"),
        placesLat: this.checkDataValidity(placesArray, "latitude"),
        placesLong: this.checkDataValidity(placesArray, "longitude"),
        placesState: this.checkDataValidity(placesArray, "state"),
        placesStateAbbrev: this.checkDataValidity(
          placesArray,
          "state abbreviation"
        )
      };

      publish(this.messageContext, zipCodeResponseReceivedLMS, payload);
    }
  }

  async storeAPICallResults() {
    if (typeof this.parsedResponse !== "undefined") {
      try {
        let placesArray =
          Array.isArray(this.parsedResponse[PLACES_PROPERTY]) === false
            ? []
            : this.parsedResponse[PLACES_PROPERTY];
        const payload = {
          country: this.parsedResponse[COUNTRY_PROPERTY],
          countryCode: this.parsedResponse["country abbreviation"],
          postCode: this.parsedResponse["post code"],
          placeName: this.checkDataValidity(placesArray, "place name"),
          latitude: this.checkDataValidity(placesArray, "latitude"),
          longitude: this.checkDataValidity(placesArray, "longitude"),
          state: this.checkDataValidity(placesArray, "state"),
          stateCode: this.checkDataValidity(placesArray, "state abbreviation")
        };
        await storeAPIResponse({ targetData: payload });
      } catch (err) {
        this.errorHandler(err);
      }
    }
  }

  errorHandler(err) {
    console.log("Error ocurred: " + err);
    const event = new ShowToastEvent({
      variant: "error",
      title: "A problem ocurred during search",
      message: "Please verify your information and try again"
    });
    this.dispatchEvent(event);
  }

  checkDataValidity(targetArray, targetField) {
    if (targetArray.length > 0 || targetArray[0][targetField] !== null) {
      return targetArray[0][targetField];
    }
    return null;
  }
}
