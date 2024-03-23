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
    field: string;
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
    searchQuery2: string = '';
    searchResults: any[] = [];
    searchResults2: any[] = [];
    selectedUnit: string = 'mg_g_solv'; //default
    selectedFraction: string = 'wtfrac'; //default
    selectedCriterion: string = 'solid_form'; //default


    compound_name: string = '';
    solvent_1: string = '';
    solvent_2: string = '';
    solvent_3: string = '';
    solid_form: string = '';

    filters: AdvancedSearchQuery[] = [{field: '', compound_name: '', solvent_1: '', solvent_2: '', solvent_3: '', solid_form: ''}];
    

    isNaN: Function = Number.isNaN;

    constructor(private http: HttpClient) { }

    toggleAdvancedSearch() {
        this.showAdvancedSearch = !this.showAdvancedSearch;
    }
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
    addFilter(): void {
        this.filters.push({field:'', compound_name: '', solvent_1: '', solvent_2: '', solvent_3: '', solid_form: ''});
        console.log(this.filters);
    }
    removeFilter(i: number): void {
        this.filters.splice(i, 1);
    }
    advancedSearch(): void {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

        const searchQuery2: AdvancedSearchQuery = {
            field: '',  
            compound_name: '',  
            solvent_1: '',  
            solvent_2: '',  
            solvent_3: '',  
            solid_form: '',  
        };
    
        // Loop through filters to populate searchQuery
        for (const filter of this.filters) {
            if (filter.field === 'compound_name') {
                searchQuery2.compound_name = filter.compound_name;
            } else if (filter.field === 'solvent') {
                searchQuery2.solvent_1 = filter.solvent_1;
                searchQuery2.solvent_2 = filter.solvent_2;
                searchQuery2.solvent_3 = filter.solvent_3;
            } else if (filter.field === 'solid_form') {
                searchQuery2.solid_form = filter.solid_form;
            }
        }
        const searchQueryString = encodeURIComponent(JSON.stringify(searchQuery2));
        console.log('advanced search query string:', searchQueryString);
    
        // Set the field based on the first filter
        searchQuery2.field = this.filters.length > 0 ? this.filters[0].field : '';
        console.log('advanced search query:', searchQuery2);
        this.http.get<any>(`http://127.0.0.1:5000/api/advancedSearch?query=${searchQueryString}`, {headers}).subscribe(
            (response) => {
                this.searchResults2 = response;
                console.log('advanced search results:', this.searchResults2);
            },
            (error) => {
                console.error("no bueno", error);
        });
    }
        
    resetSearch(): void {
        this.searchQuery = '';
        this.searchResults = [];
        if (this.searchInput){
            this.searchInput.nativeElement.value = '';}
    }

    clearSearch(){
        this.compound_name = '';
        this.solvent_1 = '';
        this.solvent_2 = '';
        this.solvent_3 = '';
        this.solid_form = '';
        this.resetSearch();
    }

}

