public with sharing class SiretDataController {
    @AuraEnabled(cacheable=true)
    public static SiretData getSiretData(Id accountId) {
        Account acc = [SELECT Siret__c FROM Account WHERE Id = :accountId LIMIT 1];
        SiretData data = new SiretData();
        data.siret = acc.Siret__c;
        return data;
    }
    
    // Structure de données pour retourner le SIRET
    public class SiretData {
        @AuraEnabled public String siret;
    }
}
