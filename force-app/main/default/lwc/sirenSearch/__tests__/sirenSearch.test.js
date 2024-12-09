import { LightningElement, track } from 'lwc';
import getData from '@salesforce/apex/siren.getData';

export default class SirenSearch extends LightningElement {
    @track siret = ''; 
    @track result; 
    @track error; 
    @track details = {}; // Objet pour stocker les détails de l'unité légale
    @track showModal = false; // État pour afficher/masquer le popup

    columns = [
        { label: 'Nom', fieldName: 'nom', type: 'text' },
        { label: 'SIRET', fieldName: 'siret', type: 'text' },
        { label: 'Adresse', fieldName: 'adresse', type: 'text' },
        { label: 'Code NIC', fieldName: 'codeNic', type: 'text' },
        { label: 'Date de création', fieldName: 'dateCreation', type: 'date' },
        {
            type: 'button',
            typeAttributes: {
                label: 'Détails',
                name: 'details',
                variant: 'brand'
            }
        }
    ];

    handleSiretChange(event) {
        this.siret = event.target.value; 
    }

    async handleSearch() {
        this.result = null;
        this.error = null;

        try {
            const response = await getData({ param: this.siret }); 
            if (response && response.etablissements && response.etablissements.length > 0) {
                this.result = response.etablissements.map(etab => ({
                    nom: etab.uniteLegale.denominationUniteLegale,
                    siret: etab.siret,
                    adresse: `${etab.adresseEtablissement.numeroVoieEtablissement || ''} ${etab.adresseEtablissement.typeVoieEtablissement || ''} ${etab.adresseEtablissement.libelleVoieEtablissement || ''}, ${etab.adresseEtablissement.codePostalEtablissement || ''} ${etab.adresseEtablissement.libelleCommuneEtablissement || ''}`,
                    codeNic: etab.nic,
                    dateCreation: etab.dateCreationEtablissement,
                    uniteLegale: etab.uniteLegale
                }));
            } else {
                this.error = 'Aucune donnée pour ce SIRET.';
            }
        } catch (err) {
            this.error = 'Erreur recherche.';
        }
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        if (actionName === 'details') {
            this.details = {
                nom: row.nom,
                siret: row.siret,
                formeJuridique: row.uniteLegale.categorieJuridiqueUniteLegale || 'Non renseigné',
                activitePrincipale: row.uniteLegale.activitePrincipaleUniteLegale || 'Non renseignée',
                categorieEntreprise: row.uniteLegale.categorieEntreprise || 'Non renseignée',
                dateCreation: row.uniteLegale.dateCreationUniteLegale || 'Non renseignée'
            };
            this.showModal = true;
        }
    }

    closeModal() {
        this.showModal = false;
    }
}
