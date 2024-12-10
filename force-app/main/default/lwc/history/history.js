import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';

// Remplace 'SIRET__c' par l'API Name du champ SIRET dans ton organisation
const FIELDS = ['Account.SIRET__c'];

export default class DisplaySiret extends LightningElement {
    @api recordId; // ID du compte sélectionné automatiquement fourni
    siret; // Variable pour stocker la valeur SIRET

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredRecord({ error, data }) {
        if (data) {
            this.siret = data.fields.SIRET__c.value; // Récupère la valeur du champ SIRET
        } else if (error) {
            console.error('Erreur lors de la récupération du SIRET', error);
            this.siret = null; // Affiche une valeur vide en cas d'erreur
        }
    }
}
