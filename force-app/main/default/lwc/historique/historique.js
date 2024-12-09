import { LightningElement, api, track, wire } from 'lwc';
import getData from '@salesforce/apex/siren.getData';
import { getRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import SIRET_FIELD from "@salesforce/schema/Account.SIRET__c";
// Déclarez le champ à récupérer
// const SIRET_FIELD = 'SIRET__c';
export default class SiretDetails extends LightningElement {
    @api recordId;
    @track result = null; // Indicateur de succès
    @track details = null; // Détails récupérés
    @track error = null; // Erreurs
    @track siret; // Variable pour stocker le SIRET
    // Récupération des données du champ SIRET
    @wire(getRecord, { recordId: '$recordId', fields: [SIRET_FIELD] })
    wiredRecord({ error, data }) {
        if (data) {
            this.siret = data.fields.SIRET__c?.value;
            // Appelle automatiquement la méthode pour récupérer les détails
            this.fetchDetails();
        } else if (error) {
            console.error('Erreur lors de la récupération du SIRET :', error);
            this.error = 'Impossible de récupérer le SIRET.';
            this.showToast('Erreur', 'Erreur lors de la récupération du SIRET.', 'error');
        }
    } 
    // Récupération des détails associés au SIRET
     async fetchDetails() {
        if (!this.siret) {
            this.error = 'SIRET non disponible.';
            this.showToast('Erreur', this.error, 'error');
            return;
        }
        try {
            const response = await getData({ param: this.siret});
            this.result = true;
            
            this.details = response.etablissements[0];
            this.error = null;
            this.showToast('Succès', 'Détails récupérés avec succès.', 'success');
            console.log('Détails récupérés :', this.details);
        } catch (error) {
            console.error('Erreur lors de la récupération des détails :', JSON.stringify(error));
            this.error = 'Erreur lors de la récupération des détails du SIRET.';
            this.details = null;
            this.showToast('Erreur', this.error, 'error');
        }
    }
    // Méthode utilitaire pour afficher une notification
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant,
            })
        );
    }
}













