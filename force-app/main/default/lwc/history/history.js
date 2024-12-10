import { LightningElement, track } from 'lwc';

export default class SiretDataDisplay extends LightningElement {
    @track accounts = [
        { label: 'Account 1', value: '0013j00000A1BcD', siret: 'SIRET123' },
        { label: 'Account 2', value: '0013j00000A1BcE', siret: 'SIRET456' },
        { label: 'Account 3', value: '0013j00000A1BcF', siret: 'SIRET789' }
    ];  // Exemple d'Accounts simulés

    @track selectedAccountId = '';  // ID de l'account sélectionné
    @track siret = '';  // SIRET de l'account sélectionné
    @track data = [];  // Données associées au SIRET
    @track noData = false;  // Indicateur pour afficher un message si pas de données

    // Gérer le changement d'account sélectionné
    handleAccountChange(event) {
        this.selectedAccountId = event.detail.value;

        // Récupérer le SIRET de l'account sélectionné à partir de l'ID de l'account
        const selectedAccount = this.accounts.find(account => account.value === this.selectedAccountId);
        this.siret = selectedAccount ? selectedAccount.siret : '';

        // Appeler la méthode pour récupérer les données par SIRET
        this.getDataForSiret(this.siret);
    }

    // Récupérer les données en fonction du SIRET
    getDataForSiret(siret) {
        // Simuler une récupération de données (remplacer avec logique réelle)
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
