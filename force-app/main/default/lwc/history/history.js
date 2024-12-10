import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';

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
            this.getData(this.siret); // Appelle la fonction pour récupérer les données liées au SIRET
        } else if (error) {
            console.error('Erreur lors de la récupération du SIRET', error);
            this.error = 'Erreur lors de la récupération du SIRET'; // Affiche une erreur en cas de problème
        }
    }

    // Fonction pour récupérer les données en fonction du SIRET
    getData(siret) {
        // Exemple d'appel API pour récupérer les données liées au SIRET
        fetch(`/api/getData?siret=${siret}`)
            .then(response => response.json())
            .then(data => {
                console.log('Données récupérées pour le SIRET:', siret);
                console.log(data); // Afficher les données récupérées dans la console

                // Traiter les données et stocker le résultat
                this.result = data.map(item => ({
                    enseigne: item.enseigne,
                    dateDebut: item.dateDebut,
                    dateFin: item.dateFin
                }));
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des données:', error);
                this.error = 'Erreur lors de la récupération des données';
            });
    }
}
