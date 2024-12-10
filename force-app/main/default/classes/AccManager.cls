public class AccManager {

    @AuraEnabled
    public static Map<String, Object> checkIfRecordExists(String siret) {
        Map<String, Object> response = new Map<String, Object>();

        List<Account> existingRecords = [SELECT Id, Name, SIREN__c, NumberOfEmployees, SIRET__c, Categorie_Entreprise__c 
                                         FROM Account WHERE SIRET__c = :siret LIMIT 1];

        if (!existingRecords.isEmpty()) {
            response.put('exists', true);
            response.put('record', existingRecords[0]);
        } else {
            response.put('exists', false);
        }

        return response;
    }

    @AuraEnabled
    public static Account createAccount(String siret, String nom, String categorieEntreprise, String codeNic, String nombreEmployes) {
        try {
            Account newAccount = new Account();
            newAccount.Name = nom;
            newAccount.SIRET__c = siret;
            
            // Conversion correcte de nombreEmployes en Integer
            newAccount.NumberOfEmployees = Integer.valueOf(nombreEmployes);  
            
            newAccount.Code_NIC__c = codeNic;
            newAccount.Categorie_Entreprise__c = categorieEntreprise;

            insert newAccount;

            return newAccount;
        } catch (Exception e) {
            throw new AuraHandledException('Erreur lors de la création du compte : ' + e.getMessage());
        }
    }

     @AuraEnabled
    public static Account updateAccount(String siret, String nom, String categorieEntreprise, String codeNic, String nombreEmployes) {
        Account accToUpdate = [SELECT Id, SIRET__c, Name, Categorie_Entreprise__c, Code_NIC__c, NumberOfEmployees 
                               FROM Account WHERE SIRET__c = :siret LIMIT 1];
      
            accToUpdate.Name = nom;
            accToUpdate.NumberOfEmployees = Integer.valueOf(nombreEmployes);  
            accToUpdate.Code_NIC__c = codeNic;
            accToUpdate.Categorie_Entreprise__c = categorieEntreprise;
            update accToUpdate;
            return accToUpdate;
      
    } 
}
