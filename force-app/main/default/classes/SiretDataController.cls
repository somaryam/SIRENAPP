public with sharing class SiretDataController {

    // Méthode pour récupérer les données associées au SIRET
    @AuraEnabled(cacheable=true)
    public static List<SiretData> getData(String siret) {
        // Vérifier que le SIRET est non vide
        if (String.isEmpty(siret)) {
            throw new AuraHandledException('SIRET ne peut pas être vide.');
        }

        // Requête pour récupérer les données associées au SIRET
        List<SiretData> results = [SELECT Enseigne__c, Date_Debut__c, Date_Fin__c
                                   FROM Siren_Data__c
                                   WHERE Siret__c = :siret];

        // Si aucune donnée n'est trouvée, renvoyer une exception ou une réponse vide
        if (results.isEmpty()) {
            throw new AuraHandledException('Aucune donnée trouvée pour ce SIRET.');
        }

        // Retourner les résultats trouvés
        return results;
    }

    // Structure de données utilisée pour renvoyer les informations du SIRET
    public class SiretData {
        @AuraEnabled public String enseigne;    // Nom de l'enseigne
        @AuraEnabled public Date dateDebut;     // Date de début
        @AuraEnabled public Date dateFin;       // Date de fin
    }
}
