/*  Author : Ravi Soni
    Date   : 25 May 2022
    Content: Inline Editing In Lwc
 */

import { LightningElement, wire, track } from 'lwc';

/* Fetching Account Records By Apex */
import fetchAccounts from '@salesforce/apex/InlineEditingInLwcCtrl.fetchAccounts';

/* Updating Account Records By Apex */
import updateAccounts from '@salesforce/apex/InlineEditingInLwcCtrl.updateAccounts';

/* Toast Notification */
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

/* Using Refresh Apex For Getting Updated Records */
import { refreshApex } from '@salesforce/apex';

/* ##############  Private Property Start ############ */
let hasValueChange = false;
let oldData = [];
let lstDraftValues = [];
let exisitingData = [];

/* Using this property for display View Mode */
let obj = {
    "Name": false, "AccountNumber": false, "Type": false, "Industry": false, "Active__c": false, "Phone": false,
    "c_Name": "", "c_AccountNumber": "", "c_Type": "", "c_Industry": "", "c_Active__c": "", "c_Phone": ""
};

/* ############################################### */

/* Using this property for hide pencil Icon */
let displayEditButtonObj = {
    "Name": 'c__iconHidden', "AccountNumber": 'c__iconHidden', "Type": 'c__iconHidden', "Industry": 'c__iconHidden',
    "Active__c": 'c__iconHidden', "FTS_Term_End__c": 'c__iconHidden', "Phone": 'c__iconHidden'
};
/* ############################################### */

/* ############  Private Property End ############ */
export default class InlineEditingInLwc extends LightningElement {
    /* ##############  Public Property Starts ############ */

    @track displayFooter = false;
    @track isLoading = true;
    @track allResponse = [];
    @track lstRecords = [];

    /* ##############  Public Property Ends ############ */

    /* ############## Fetching account Records ############ */
    @wire(fetchAccounts) getRecords(response) {
        this.allResponse = response; //Store all the response for refresh data
        let { data, error } = response;
        if (data) {
            hasValueChange = false;
            lstDraftValues = [];
            this.displayFooter = false;
            let result = JSON.parse(JSON.stringify(data));
            exisitingData = JSON.parse(JSON.stringify(data));

            for (let i = 0; i < result.length; i++) {
                result[i].displayEditIcon = displayEditButtonObj;
                result[i].manageEdit = obj;

            }
            this.isLoading = false;
            oldData = JSON.parse(JSON.stringify(result));
            this.lstRecords = result;
        }
        else if (error) {
            console.log('@InlineEditingInLwc error=====> ' + JSON.stringify(error));
        }
    }
    /* ############## ######################## ############ */

    /* ############## Handle Input Change Event  ############ */
    handleInputChange(event) {
        this.helperMethod(event, 'handleInputChange');
    }

    /* ###############  It is the helper method of every event ############### */
    helperMethod(event, eventName) {
        let colname = event.target.dataset.colname;
        let rowNo = Number(event.target.dataset.rowindx);
        let currentRow = JSON.parse(JSON.stringify(this.lstRecords[rowNo]));
        let currentValue = event.target.value;
        let self = this;
        let sTime = 500;



        if (eventName == 'handleMouseover') {
            currentRow.displayEditIcon[colname] = '';
        }

        else if (eventName == 'handleInputChange') {
            let oldValue = currentRow[colname];
            /* if value get change, changing the td background color */
            if (oldValue != currentValue) {
                currentRow.manageEdit['c_' + colname] = 'c__tdBackgroundColor';
                hasValueChange = true;
            }
            currentRow[colname] = currentValue;
        }
        /* displaying the pencil icon */
        else if (eventName == 'handleMouseOut') {
            currentRow.displayEditIcon[colname] = 'c__iconHidden';
        }

        else if (eventName == 'handleBlur') {
            currentRow.manageEdit[colname] = false;
            this.displayFooter = hasValueChange;
        }

        else if (eventName == 'handleFocusout') {
            sTime = 100;
            setTimeout(function () {
                currentRow.manageEdit[colname] = false;
                self.lstRecords[rowNo] = JSON.parse(JSON.stringify(currentRow));
                self.displayFooter = hasValueChange;
            }, sTime);
        }
        /* if event is handleEdit, do focus on input field */
        else if (eventName == 'handleEdit') {
            currentRow.manageEdit[colname] = true;

            if (colname == "Industry" || colname == "Type" || colname == "Active__c") {
                sTime = 1500;
            }
            setTimeout(function () {
                self.template.querySelector('.cls' + colname).focus();
            }, sTime);
        }


        this.lstRecords[rowNo] = JSON.parse(JSON.stringify(currentRow));
    }

    /* ################# It is the focusout and blur helperMethod ################# */
    helperFocusOut(event) {
        let recId = event.target.dataset.recid;
        let colname = event.target.dataset.colname;
        let rowNo = Number(event.target.dataset.rowindx);
        let currentValue = event.target.value;

        let oldRecord = JSON.parse(JSON.stringify(oldData[rowNo]));
        let exisitingRecord = JSON.parse(JSON.stringify(exisitingData[rowNo]));


        if (oldRecord[colname] != currentValue) {
            if (exisitingRecord.Id == recId) {
                exisitingRecord[colname] = currentValue;
            }

            if (lstDraftValues.length == 0) {
                lstDraftValues.push(exisitingRecord);

            }
            else {
                let hasRecMatch = false;

                for (let i = 0; i < lstDraftValues.length; i++) {
                    if (lstDraftValues[i].Id == recId) {
                        lstDraftValues[i][colname] = currentValue;
                        hasRecMatch = true;
                        break;
                    }
                }
                if (!hasRecMatch) {
                    lstDraftValues.push(exisitingRecord);
                }
            }
        }

    }
    /* ################################## */

    /* ############ When User MouseOver On Td, Pencil Icon Will Display ############ */
    handleMouseover(event) {
        this.helperMethod(event, 'handleMouseover');
    }
    /* ############################### */

    /* ############ When User MouseOut From Td, Pencil Icon Will Hide ############ */
    handleMouseOut(event) {
        this.helperMethod(event, 'handleMouseOut');
    }
    /* ############################### */

    /* ############ When User Click On Pencil Icon, It will Display Input Box And Will Do Focus On Input ############### */
    handleEdit(event) {
        this.helperMethod(event, 'handleEdit');
    }
    /* ############################### */

    /* ############ When User Click Out From Input ,It will Hide Input And Display View Mode ############### */
    handleBlur(event) {
        this.helperMethod(event, 'handleBlur');
        this.helperFocusOut(event);

    }
    /* ############################### */

    /* ############ When User Click Out From Picklist ,It will Hide Picklist And Display View Mode  ############### */
    handleFocusout(event) {

        this.helperMethod(event, 'handleFocusout');
        this.helperFocusOut(event);
    }
    /* ############################### */

    /* ################ It Will Cancle All The Changes ################# */
    handleCancel() {
        this.lstRecords = JSON.parse(JSON.stringify(oldData));
        lstDraftValues = [];
        this.displayFooter = false;
        hasValueChange = false;
    }
    /* ############################### */

    /* ################ It Will Save Only Draft Values ################# */
    handleSave() {
        this.isLoading = true;
        let sMessage = '';
        updateAccounts({ updateRecords: lstDraftValues }).then(() => {
            sMessage = 'Record(s) have been updated successfuly';
            this.showToastNotification('Success!', sMessage, 'success');
            refreshApex(this.allResponse);//getting newly updated data
        }).catch(error => {
            this.isLoading = false;
            console.log('@Sfdcfamily error =======> ' + JSON.stringify(error));
            sMessage = error.body.message;
            this.showToastNotification('Error!', sMessage, 'error');
        });



    }
    /* ############################################ */

    /* Fire Toast Notification */
    showToastNotification(sTitle, sMessage, sVariant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: sTitle,
                message: sMessage,
                variant: sVariant
            })
        );
    }
    /* ################################# */



}