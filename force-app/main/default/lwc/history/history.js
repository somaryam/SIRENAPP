import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import getData from '@salesforce/apex/siren.getData'; // Importation de la méthode Apex

// Remplacer 'SIRET__c' par le nom API du champ SIRET dans ton organisation
const FIELDS = ['Account.SIRET__c'];

export default class DisplaySiret extends LightningElement {
    @api recordId; // ID du compte sélectionné automatiquement fourni
    siret; // Variable pour stocker la valeur SIRET
    result = []; // Pour stocker les résultats récupérés
    error; // Pour afficher des erreurs si nécessaire

    // Définir les colonnes à afficher dans le tableau
    columns = [
        { label: 'Enseigne', fieldName: 'enseigne' },
        { label: 'Date Début', fieldName: 'dateDebut' },
        { label: 'Date Fin', fieldName: 'dateFin' }
    ];

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredRecord({ error, data }) {
        if (data) {
            this.siret = data.fields.SIRET__c.value; // Récupère le SIRET du compte sélectionné
            this.handleSearch(); // Appelle la fonction handleSearch pour récupérer les données
        } else if (error) {
            console.error('Erreur lors de la récupération du SIRET', error);
            this.error = 'Erreur lors de la récupération du SIRET'; // Affiche une erreur en cas de problème
        }
    }

    // Fonction appelée pour rechercher les données
    async handleSearch() {
        this.result = null;
        this.error = null;

        try {
            // Appel à la méthode Apex pour récupérer les données via le paramètre siret
            const response = await getData({ param: this.siret });

            // Vérifie la structure des données retournées
            if (response && response.etablissements && response.etablissements.length > 0) {
                const etablissements = response.etablissements[0];
                if (etablissements.periodesEtablissement) {
                    this.result = etablissements.periodesEtablissement.map(item => ({
                        enseigne: item.enseigne1Etablissement,
                        dateDebut: item.dateDebut,
                        dateFin: item.dateFin
                    }));
                }
            } else {
                console.error('Pas d\'établissements trouvés');
                this.error = 'Pas d\'établissements trouvés';
            }
        } catch (err) {
            console.error('Erreur lors de la recherche:', err);
            this.error = 'Erreur lors de la recherche';
        }
    }
}
