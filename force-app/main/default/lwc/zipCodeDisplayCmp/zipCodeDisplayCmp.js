import { LightningElement, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import {
  subscribe,
  unsubscribe,
  APPLICATION_SCOPE,
  MessageContext
} from "lightning/messageService";

import zipCodeResponseReceivedLMS from "@salesforce/messageChannel/zipCodeResponseReceived__c";

export default class ZipCodeDisplayCmp extends LightningElement {
  countryName;
  countryCode;
  postCode;
  latitude;
  longitude;
  stateName;
  stateCode;
  placeName;

  @wire(MessageContext)
  messageContext;

  connectedCallback() {
    if (!this.subscription) {
      try {
        this.subscription = subscribe(
          this.messageContext,
          zipCodeResponseReceivedLMS,
          (message) => this.handleLMSMessage(message),
          { scope: APPLICATION_SCOPE }
        );
      } catch (err) {
        this.errorHandler(err);
      }
    }
  }

  disconnectedCallback() {
    unsubscribe(this.subscription);
    this.subscription = null;
  }

  handleLMSMessage(msg) {
    if (typeof msg !== "undefined") {
      try {
        this.countryCode = msg.countryCode;
        this.countryName = msg.countryName;
        this.postCode = msg.postCode;
        this.latitude = msg.placesLat;
        this.longitude = msg.placesLong;
        this.stateName = msg.placesState;
        this.stateCode = msg.placesStateAbbrev;
        this.placeName = msg.placesName;
      } catch (err) {
        this.errorHandler(err);
      }
    }
  }

  errorHandler(err) {
    console.log(err);
    const event = new ShowToastEvent({
      variant: "error",
      title: "A problem ocurred receiving search results",
      message: "Please contact your Salesforce Admin for assistance"
    });
    this.dispatchEvent(event);
  }
}
