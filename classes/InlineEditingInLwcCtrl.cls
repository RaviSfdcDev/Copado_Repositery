public with sharing class InlineEditingInLwcCtrl {

    /* ############# Fatch Accounts ################ */
    @AuraEnabled(cacheable=true)
    public static list<Account> fetchAccounts(){
        try {
            return [SELECT Id,Name,AccountNumber,Industry,Type,Active__c,Phone FROM Account Limit 10];
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    } 
    /* ############# Update Accounts ################ */
    @AuraEnabled
    public static void updateAccounts(list<Account> updateRecords){
        try {
            update updateRecords;
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }


}