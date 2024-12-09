public class AccManager {

    @AuraEnabled
    public static Map<String, Object> checkIfRecordExists(String siret) {
        Map<String, Object> response = new Map<String, Object>();

        List<Account> existingRecords = [SELECT Id, Name, SIREN__c, NumberOfEmployees, SIRET__c, Categorie_Entreprise__c FROM Account  WHERE SIRET__c = :siret  LIMIT 1];

        if (!existingRecords.isEmpty()) {
            response.put('exists', true);
            response.put('record', existingRecords[0]);
        } else {
            response.put('exists', false);
        }

        return response;
    }

    @AuraEnabled
    public static Account createAccount(String siret, String nom, String adresse, String codeNic, String dateCreation) {
        try {
            Account newAccount = new Account();
            newAccount.Name = nom;
            newAccount.SIRET__c = siret;  
            newAccount.Adresse__c = adresse;  
            newAccount.Code_NIC__c = codeNic;  
            newAccount.Date_Creation__c = Date.valueOf(dateCreation);  

            insert newAccount;

            return newAccount;
        } catch (Exception e) {
            throw new AuraHandledException('Erreur lors de la création du compte : ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static Account updateAccount(String siret, String nom, String adresse, String codeNic, Date dateCreation) {
        Account accToUpdate = [SELECT Id, SIRET__c, Name, Adresse__c, Code_NIC__c, Date_Creation__c 
                               FROM Account WHERE SIRET__c = :siret LIMIT 1];
        if (accToUpdate != null) {
            accToUpdate.Name = nom;
            accToUpdate.Adresse__c = adresse;
            accToUpdate.Code_NIC__c = codeNic;
            accToUpdate.Date_Creation__c = dateCreation;
            update accToUpdate;
            return accToUpdate;
        } else {
            throw new AuraHandledException('Établissement non trouvé pour ce SIRET.');
        }
    }
}
