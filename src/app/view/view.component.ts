import { Component, ElementRef, ViewChild, EventEmitter, Output } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

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
        MatIconModule
    ],
    styleUrls: ['./view.component.scss']
    })
export class ViewComponent {
    selectedValue: string | null = null;

    equalityTerms: string[] = ["=", "<", "<=", ">", ">="];
    solidformTerms: string[] = ["Form I", "Form II", "Form III"];
    // solventSelectTerms: string[] = ["has specific solvent combination", "has any data on solvent"];

    inputType: 'number' | 'equality' | 'solidform' | 'solvent' | null = null;

    showAdditionalFields: boolean = false;

    showAdvancedSearch: boolean = false;

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

