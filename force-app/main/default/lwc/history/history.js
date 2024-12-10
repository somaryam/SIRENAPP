import { LightningElement, api, track } from 'lwc';
import getSiretData from '@salesforce/apex/SiretDataController.getSiretData'; // Remplacer par un appel Apex si nécessaire

export default class SiretDataDisplay extends LightningElement {
    @track siret = '';  // SIRET de l'account sélectionné
    @track data = [];  // Données associées au SIRET
    @track noData = false;  // Indicateur pour afficher un message si pas de données

    // Cette propriété sera définie via l'ID de l'Account sélectionné
    @api recordId; 

    connectedCallback() {
        // Lors de la connexion du composant, récupérer le SIRET de l'account
        if (this.recordId) {
            this.getAccountSiretData(this.recordId);
        }
    }

    // Récupérer les données du SIRET de l'account sélectionné
    getAccountSiretData(accountId) {
        // Simuler l'appel API ou Apex pour récupérer le SIRET de l'account
        getSiretData({ accountId })
            .then((result) => {
                if (result && result.siret) {
                    this.siret = result.siret;
                    this.getDataForSiret(result.siret); // Appeler la méthode pour récupérer les données associées
                } else {
                    this.noData = true;
                }
            })
            .catch((error) => {
                console.error('Erreur récupération SIRET:', error);
                this.noData = true;
            });
    }

    // Récupérer les données associées au SIRET (ex: Enseigne, dates)
    getDataForSiret(siret) {
        // Simuler une récupération de données en fonction du SIRET
        if (siret === 'SIRET123') {
            this.data = [
                { enseigne: 'Enseigne A', dateDebut: '2009-12-25', dateFin: 'En cours' },
                { enseigne: 'Enseigne B', dateDebut: '2008-01-01', dateFin: '2009-12-24' }
            ];
            this.noData = false;
        } else if (siret === 'SIRET456') {
            this.data = [
                { enseigne: 'Enseigne C', dateDebut: '1996-12-25', dateFin: '2007-12-31' }
            ];
            this.noData = false;
        } else {
            this.data = [];
            this.noData = true;
        }
    }
}
