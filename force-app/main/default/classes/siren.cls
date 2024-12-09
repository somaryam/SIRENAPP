public class siren {

    @AuraEnabled
    public static String getToken() {
        Http http = new Http();
        HttpRequest req = new HttpRequest();
        String credentials = 'grant_type=client_credentials';
        req.setEndpoint('https://api.insee.fr/token');
        req.setMethod('POST');
        req.setBody(credentials);
        req.setHeader('Authorization', 'Basic Z2hFNUVneEtBcV82cndscDZaR0xnZkV5TEhzYTpoZnp5Zm9mZW9vRDhOaHAyeWRWc2ZPWGNNUEFh');
        HttpResponse res = http.send(req);
        System.debug(res.getBody());
        
        String result = res.getBody().substringBetween(':"', '"');
        return result;
    }

    
    @AuraEnabled
    public static Map<String, Object> getData(String param) {
        String token = getToken();
        System.debug('Token: ' + token);
        String endpoint = 'https://api.insee.fr/entreprises/sirene/V3.11/siret?q=';
        endpoint += param.length() == 9 ? 'siren:' : 'siret:';
        // endpoint += param;

        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint(endpoint + param);
        req.setMethod('GET');
        req.setHeader('Authorization', 'Bearer ' + token);
        
        try {
            HttpResponse res = http.send(req);
            System.debug('Response: ' + res.getBody());
            
            Map<String, Object> result = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
            return result;
        } catch (Exception e) {
            System.debug('Error: ' + e.getMessage());
            throw new AuraHandledException('Erreur lors de la récupération des données.');
        }
    }


    
}
