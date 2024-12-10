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
//staticite modifiables valeurs champs popup like nom et affichage de tous 
//historique affichage 
// si j ai le temps afficher depuis le bouton 
//terminer le plus tot possible 
    columns = [
       { 
        label: 'Nom', 
        fieldName: 'nom', 
        type: 'button', 
        typeAttributes: {
            label: { fieldName: 'nom' },
            name: 'openModal',
            variant: 'base',
            disabled: false
        }
    },
        { label: 'SIRET', fieldName: 'siret', type: 'text' },
        { label: 'SIREN', fieldName: 'siren', type: 'text' },
        { label: 'Code NIC', fieldName: 'codeNic', type: 'text' },
        { label: 'Categorie Entreprise', fieldName: 'dateCreation', type: 'date' },
        { label: 'Nombre Employes', fieldName: 'numberOfEmployees', type: 'date' },
        {
            type: 'action',
            typeAttributes: {
                rowActions: [
                    { label: 'Détail', name: 'detail' }
                ]
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
                    siren: etab.siren,
                    siret: etab.siret,
                    nombreEmployes: `${etab.siren || ''} ${etab.adresseEtablissement.typeVoieEtablissement || ''} ${etab.adresseEtablissement.libelleVoieEtablissement || ''}, ${etab.adresseEtablissement.codePostalEtablissement || ''} ${etab.adresseEtablissement.libelleCommuneEtablissement || ''}`,
                    codeNic: etab.nic,
                    dateCreation: etab.dateCreationEtablissement
                }));
            } else {
                this.error = 'Aucune donnée pour ce SIRET.';
            }
        } catch (err) {
            this.error = 'Erreur recherche.';
        }
    }

    async handleRowAction(event) {
        
        console.log('action: ', event);
        
        const actionName = event.detail.action.name;

        const row = event.detail.row;

        if (actionName === 'detail') { 
            const response = await checkIfRecordExists({ siret: row.siret });
            if (response.exists) {
                this.modalData = {
                    nom: response.record.Name,
                    siret: response.record.SIREN__c,   
                    codeNic: response.record.Code_NIC__c,
                    nombreEmployes: response.record.Nombre_Employes__c,
                    categorieEntreprise: response.record.Categorie_Entreprise__c
                };
                this.isSiretValid = false;  
            } else {
                this.modalData = {
                    nom: row.nom,
                    siret: row.siret,
                    siren: row.siret.slice(0, 9),   
                    codeNic: row.codeNic,
                    nombreEmployes: '',   
                    categorieEntreprise: ''   
                };
                this.isSiretValid = true;   
            }

            this.isModalOpen = true;   
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

            
            this.isModalOpen = false;
            this.modalData = {};

            
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: createdAccount.Id,  
                    objectApiName: 'Account',   
                    actionName: 'view'          
                }
            });
        } catch (error) {
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

            
            this.isModalOpen = false;
            this.modalData = {};

     
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: updatedAccount.Id,   
                    objectApiName: 'Account',    
                    actionName: 'view'            
                }
            });

        } catch (error) {
            this.error = 'Erreur lors de la mise à jour de l\'établissement : ' + error.body.message;
        }
    }
}
