import { Component, ElementRef, ViewChild, EventEmitter, Output } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { HttpClient, HttpHandler, HttpHeaders } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
interface AdvancedSearchQuery {
    compound_name?: string;
    solvent_1?: string;
    solvent_2?: string;
    solvent_3?: string;
    solid_form?: string;
    selectedUnit?: string;
    selectedFraction?: string;
}
@Component({
    selector: 'view-root',
    templateUrl: 'view.component.html',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule

    ],
    styleUrls: ['./view.component.scss']
    })
export class ViewComponent {
    @ViewChild('searchInput') searchInput!: ElementRef;
    selectedValue: string | null = null;

    equalityTerms: string[] = ["=", "<", "<=", ">", ">="];
    solidformTerms: string[] = ["Form I", "Form II", "Form III"];
    // solventSelectTerms: string[] = ["has specific solvent combination", "has any data on solvent"];

    inputType: 'number' | 'equality' | 'solidform' | 'solvent' | null = null;

    showAdditionalFields: boolean = false;

    showAdvancedSearch: boolean = false;
    searchQuery: string = '';
    searchResults: any[] = [];
    selectedUnit: string = 'mg_g_solv'; //default
    selectedFraction: string = 'wtfrac'; //default
    selectedCriterion: string = 'solid_form'; //default
    includeSolvent2: boolean = false;
    includeSolvent3: boolean = false;

    compound_name: string = '';
    solvent_1: string = '';
    solvent_2: string = '';
    solvent_3: string = '';
    solid_form: string = '';
    

    isNaN: Function = Number.isNaN;

    constructor(private http: HttpClient) { }

    basicSearch(): void {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        // const body = {searchQuery: this.searchQuery};
            this.http.get<any>(`http://127.0.0.1:5000/api/basicSearch?query=${this.searchQuery}`,{ headers }).subscribe(
                (response) => {
                this.searchResults = response;
            },
            (error) => {
                console.error("no work", error);
        });
    }

    advancedSearch(): void {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const searchQuery: AdvancedSearchQuery = {}
        if (this.compound_name) {
            searchQuery.compound_name = this.compound_name;
        }
        if (this.solvent_1) {
            searchQuery.solvent_1 = this.solvent_1;
        }
        if (this.solvent_2) {
            searchQuery.solvent_2 = this.solvent_2;
        }
        if (this.solvent_3) {
            searchQuery.solvent_3 = this.solvent_3;
        }
        if (this.solid_form) {
            searchQuery.solid_form = this.solid_form;
        }

        this.http.post<any>(`http://127.0.0.1:5000/api/advancedSearch`, searchQuery, {headers}).subscribe(
            (response) => {
                this.searchResults = response;
                console.log('advanced search results:', this.searchResults);
            },
            (error) => {
                console.error("no work", error);
        });
    }
        
    resetSearch(): void {
        this.searchQuery = '';
        this.searchResults = [];
        if (this.searchInput){
            this.searchInput.nativeElement.value = '';}
    }

    clearSearch(){
        this.selectedCriterion ='';
        this.compound_name = '';
        this.solvent_1 = '';
        this.solvent_2 = '';
        this.solvent_3 = '';
        this.solid_form = '';
        this.resetSearch();
    }


    // filters: { selectedValue: string | null, inputType: string | null }[] = [];



    toggleAdvancedSearch() {
        this.showAdvancedSearch = !this.showAdvancedSearch;
    }



    updateFormFields(selectedValue: string) {
        switch (selectedValue) {
            case 'Project Number':
                this.inputType = 'number';
                this.showAdditionalFields = false;
                break;
            case 'Molecular Weight':
                this.inputType = 'equality';
                this.showAdditionalFields = true;
                break;
            case 'Solid Form':
                this.inputType = 'solidform';
                this.showAdditionalFields = false;
                break;
            case 'Melting Temperature':
                this.inputType = 'equality';
                this.showAdditionalFields = true;
                break;
            case 'Fusion Enthalpy':
                this.inputType = 'equality';
                this.showAdditionalFields = true;
                break;
            case 'Solvent':
                this.inputType = 'solvent';
                this.showAdditionalFields = false;
                break;
            default:
                this.inputType = null;
                break;
        }
    }
performSearch() {
    console.log('Searching for:', this.selectedValue, this.inputType, this.showAdditionalFields);
}
// addFilter() {
//     if (this.selectedValue && this.inputType) {
//       this.filters.push({ selectedValue: this.selectedValue, inputType: this.inputType });
//       this.selectedValue = null;
//       this.inputType = null;
//     }
//   }

// removeFilter(index: number) {
//     this.filters.splice(index, 1);
//   }

}

