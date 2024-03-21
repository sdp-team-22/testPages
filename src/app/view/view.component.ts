import { Component, ElementRef, ViewChild, EventEmitter, Output } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';

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
    selectedFraction: string = 'wt_frac'; //default

    isNaN: Function = Number.isNaN;

    constructor(private http: HttpClient) { }

    basicSearch() {
        // if (this.searchQuery.trim() !== '')
            this.http.get<any>(`http://127.0.0.1:5000/api/basicSearch?query=${this.searchQuery}`).subscribe(
                (response) => {
                this.searchResults = response;
            },
            (error) => {
                console.error("no work", error);
        });
    }
    resetSearch() {
        this.searchQuery = '';
        this.searchResults = [];
        this.searchInput.nativeElement.value = '';
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

