import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getData from '@salesforce/apex/siren.getData';
import checkIfRecordExists from '@salesforce/apex/AccManager.checkIfRecordExists';
import createAccount from '@salesforce/apex/AccManager.createAccount';
import updateAccount from '@salesforce/apex/AccManager.updateAccount';  

export default class SirenSearch extends NavigationMixin(LightningElement) {
    @track siret = ''; 
    @track result; 
    @track error; 
    @track isModalOpen = false;   
    @track modalData = {};     
    @track isSiretValid = false;   

    columns = [
        { 
            label: 'Nom', 
            fieldName: 'nom', 
            type: 'button', 
            typeAttributes: {
                label: { fieldName: 'nom' },
                name: 'openModal',  // Utilisé pour le nom
                variant: 'base',
                disabled: false
            }
        },
        { label: 'SIRET', fieldName: 'siret', type: 'text' },
        { label: 'SIREN', fieldName: 'siren', type: 'text' },
        { label: 'Code NIC', fieldName: 'codeNic', type: 'text' },
        { label: 'Date Creation', fieldName: 'dateCreation', type: 'date' },
        { label: 'Adresse', fieldName: 'adresse', type: 'text' }
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
                    siren: etab.siren,
                    siret: etab.siret,
                    adresse: `${etab.siren || ''} ${etab.adresseEtablissement.typeVoieEtablissement || ''} ${etab.adresseEtablissement.libelleVoieEtablissement || ''}, ${etab.adresseEtablissement.codePostalEtablissement || ''} ${etab.adresseEtablissement.libelleCommuneEtablissement || ''}`,
                    codeNic: etab.nic,
                    dateCreation: etab.dateCreationEtablissement,
                    nombreEmployes: etab.uniteLegale.trancheEffectifsUniteLegale, 
                    categorieEntreprise: etab.uniteLegale.categorieEntreprise 
                }));
            } else {
                this.error = 'Aucune donnée pour ce SIRET.';
            }
        } catch (err) {
            this.error = 'Erreur recherche.';
        }
    }

    async handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        if (actionName === 'openModal') {  // Gère uniquement le clic sur le nom
            const response = await checkIfRecordExists({ siret: row.siret });
            if (response.exists) {
                // Données récupérées depuis la base de données pour modification
                this.modalData = {
                    nom: response.record.Name,
                    siret: response.record.SIREN__c,
                    siren: response.record.SIREN__c,   
                    codeNic: response.record.Code_NIC__c,
                    nombreEmployes: response.record.Nombre_Employes__c,
                    categorieEntreprise: response.record.Categorie_Entreprise__c
                };
                this.isSiretValid = false;  
            } else {
                // Données récupérées depuis la recherche pour création
                this.modalData = {
                    nom: row.nom,
                    siret: row.siret,
                    siren: row.siret.slice(0, 9),   
                    codeNic: row.codeNic,
                    nombreEmployes: row.nombreEmployes || '',  // Initialisation avec les données de l'API
                    categorieEntreprise: row.categorieEntreprise || ''  // Initialisation avec les données de l'API
                };
                this.isSiretValid = true;   
            }

            this.isModalOpen = true;   // Ouvrir le modal
        }
    }

    closeModal() {
        this.isModalOpen = false;
        this.modalData = {};   
    }

    handleInputChange(event) {
        const field = event.target.dataset.id;
        this.modalData[field] = event.target.value;   
    }

    async handleCreate() {
        try {
            const createdAccount = await createAccount({
                nom: this.modalData.nom,
                siren: this.modalData.siren,
                siret: this.modalData.siret,
                codeNic: this.modalData.codeNic,
                nombreEmployes: this.modalData.nombreEmployes,
                categorieEntreprise: this.modalData.categorieEntreprise
            });
    
            console.log('Account created:', createdAccount);  // Vérifiez la réponse ici
    
            // Fermer le modal
            this.isModalOpen = false;
            this.modalData = {};  // Réinitialiser les données du modal
    
            // Rechargez les résultats pour voir le nouvel enregistrement dans la liste
            await this.handleSearch();  // Recharge les résultats
    
            // Rediriger vers la page de l'enregistrement créé
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: createdAccount.Id,  // L'ID du compte créé
                    objectApiName: 'Account',     // L'objet que vous voulez visualiser
                    actionName: 'view'            // L'action de vue
                }
            });
    
        } catch (error) {
            console.error('Error during createAccount:', error);
            this.error = 'Erreur lors de la création de l\'établissement : ' + error.body.message;
        }
    }
    
    
    async handleUpdate() {
        try {
            const updatedAccount = await updateAccount({
                nom: this.modalData.nom,
                siren: this.modalData.siren,
                siret: this.modalData.siret,
                codeNic: this.modalData.codeNic,
                nombreEmployes: this.modalData.nombreEmployes,
                categorieEntreprise: this.modalData.categorieEntreprise
            });
    
            console.log('Account updated:', updatedAccount);  // Vérifiez la réponse ici
            this.isModalOpen = false;
            this.modalData = {};
            // Redirection ou autre logique...
        } catch (error) {
            console.error('Error during updateAccount:', error);
            this.error = 'Erreur lors de la mise à jour de l\'établissement : ' + error.body.message;
        }
    }
    
}
