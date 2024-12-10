import { LightningElement, api, wire, track } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';

const FIELDS = ['Account.SIRET__c'];

export default class DisplaySiret extends LightningElement {
    @api recordId; // ID de l'account sélectionné
    @track siret; // Variable pour stocker le SIRET
    @track error; // Message d'erreur

    // Récupérer les données du compte, y compris le SIRET
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredRecord({ error, data }) {
        if (data) {
            // Récupérer le SIRET et le stocker dans la variable 'siret'
            this.siret = data.fields.SIRET__c.value;
            this.error = null; // Effacer l'erreur si les données sont récupérées avec succès
            console.log('SIRET récupéré:', this.siret); // Affiche le SIRET dans la console pour vérification
        } else if (error) {
            this.error = 'Erreur lors de la récupération du SIRET';
            console.error(error); // Affiche l'erreur dans la console
        }
    }
}
