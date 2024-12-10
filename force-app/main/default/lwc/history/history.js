import { LightningElement, api, wire, track } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import getData from '@salesforce/apex/siren.getData';  // Méthode Apex pour appeler l'API

const FIELDS = ['Account.SIRET__c'];  // Champ SIRET dans l'account

export default class DisplaySiret extends LightningElement {
    @api recordId;  // ID du compte sélectionné
    @track siret;  // Variable pour stocker le SIRET
    @track data = [];  // Données de la recherche de l'API
    @track error;  // Message d'erreur

    // Récupérer le SIRET du compte sélectionné
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredRecord({ error, data }) {
        if (data) {
            this.siret = data.fields.SIRET__c.value;  // Stocker le SIRET récupéré
            this.error = null;  // Réinitialiser l'erreur
            console.log('SIRET récupéré:', this.siret);  // Afficher le SIRET dans la console
            this.fetchData();  // Appeler la méthode pour récupérer les données de l'API
        } else if (error) {
            this.error = 'Erreur lors de la récupération du SIRET';
            console.error('Erreur:', error);  // Afficher l'erreur dans la console
        }
    }

    // Appeler l'API avec le SIRET récupéré
    fetchData() {
        if (this.siret) {
            // Afficher le SIRET dans la console pour vérifier qu'il est bien récupéré
            console.log('Appel à l\'API avec le SIRET:', this.siret);

            getData({ param: this.siret })  // Appeler la méthode Apex 'getData' avec le SIRET
                .then(result => {
                    // Afficher les résultats dans la console
                    console.log('Résultat de la recherche API pour le SIRET:', this.siret);
                    console.log(result);  // Afficher toute la réponse de l'API INSEE
                    if (result && result['etablissements']) {
                        // Mapper les résultats pour extraire les informations utiles
                        this.data = result['etablissements'].map(item => ({
                            enseigne: item['uniteLegale']['denominationUniteLegale'] || 'Non spécifié',
                            dateDebut: item['dateDebutActivite'] || 'Non spécifié',
                            dateFin: item['dateFinActivite'] || 'Non spécifié'
                        }));
                    } else {
                        console.log('Aucun établissement trouvé pour ce SIRET');
                    }
                })
                .catch(error => {
                    this.error = 'Erreur lors de la récupération des données';
                    console.error('Erreur API:', error);  // Afficher l'erreur dans la console
                });
        } else {
            console.log('Aucun SIRET sélectionné.');
        }
    }
}
