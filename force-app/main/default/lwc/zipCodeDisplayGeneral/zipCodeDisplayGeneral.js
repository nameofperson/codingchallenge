import { LightningElement, wire, track } from "lwc";
import {
  subscribe,
  unsubscribe,
  APPLICATION_SCOPE,
  MessageContext
} from "lightning/messageService";

import zipCodeResponseReceivedLMS from "@salesforce/messageChannel/zipCodeResponseReceived__c";

const columns = [
  { label: "Zip/Post Code", fieldName: "postCode" },
  { label: "Country Name", fieldName: "countryCode" },
  { label: "Country Code", fieldName: "countryName" },
  { label: "State Name", fieldName: "stateName" },
  { label: "State Code", fieldName: "stateCode" },
  { label: "Place Name", fieldName: "placeName" },
  { label: "Latitude", fieldName: "latitude" },
  { label: "Longitude", fieldName: "longitude" }
];

export default class ZipCodeDisplayGeneral extends LightningElement {
  subscription;
  @track data = [];
  columns = columns;

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
        if (msg.countryCode !== "US") {
          let tableItem = {
            id: Date.now(),
            countryCode: msg.countryCode,
            countryName: msg.countryName,
            postCode: msg.postCode,
            latitude: msg.placesLat,
            longitude: msg.placesLong,
            stateName: msg.placesState,
            stateCode: msg.placesStateAbbrev,
            placeName: msg.placesName
          };
          this.data.push(tableItem);

          this.data = [...this.data];
        }
      } catch (err) {
        this.errorHandler(err);
      }
    }
  }

  errorHandler(err) {
    console.log(err);
  }
}
