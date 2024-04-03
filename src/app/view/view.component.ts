import { Component, ElementRef, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { HttpClient, HttpHandler, HttpHeaders } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import {MatCheckboxChange, MatCheckboxModule} from '@angular/material/checkbox';
import {Chart} from 'chart.js/auto';
import {MatSnackBar} from '@angular/material/snack-bar';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface AdvancedSearchQuery {
    field: string;
    compound_name?: string;
    solvent_1?: string;
    solvent_2?: string;
    solvent_3?: string;
    xrpdf?: string;
    solventMatch?: string;
    // selectedUnit?: string;
    // selectedFraction?: string;
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
        MatTableModule,
        MatCheckboxModule

    ],
    styleUrls: ['./view.component.scss']
    })
export class ViewComponent {
    @ViewChild('barCanvas') barCanvas: any;

    showAdditionalFields: boolean = false;
    showAdvancedSearch: boolean = false;

    searchQuery: string = '';
    searchQuery2: string = '';
    searchResults: any[] = [];
    searchResults2: any[] = [];

    selectedUnit: string = 'solubility_mg_g_solv'; //default
    selectedFraction: string = 'wtfrac'; //default
    selectedItems: any[] = [];
    selectedData: any[] = []; 


    compound_name: string = '';
    solventMatch: string = '';
    solvent_1: string = '';
    solvent_2: string = '';
    solvent_3: string = '';
    xrpdf: string = '';
    solubility_mg_g_solv: number = 0;
    solubility_mg_g_solvn: number = 0;
    solubility_mg_mL_solv: number = 0;
    solubility_wt: number = 0;

    filters: AdvancedSearchQuery[] = [{field: '', compound_name: '', solventMatch: '', solvent_1: '', solvent_2: '', solvent_3: '', xrpdf: ''}];
    isNaN: Function = Number.isNaN;
    barChart: any;


    constructor(private http: HttpClient, private _snackBar: MatSnackBar) { }


    toggleAdvancedSearch() {
        this.showAdvancedSearch = !this.showAdvancedSearch;
    }
    basicSearch(): void {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        if (this.searchQuery === '') {
            this._snackBar.open('Please enter Compound Name', 'Close', {
                duration: 3000, 
                horizontalPosition: 'center', 
                verticalPosition: 'bottom', 
                panelClass: 'error-snackbar' // Custom CSS class for styling
            });
            return;
        }

        this.http.get<any>(`http://127.0.0.1:5000/api/basicSearch?query=${this.searchQuery}`,{ headers }).subscribe(
                (response) => {
                this.searchResults = response;
            },
            (error) => {
                if (error.status === 404) {
                    this._snackBar.open('No results found', 'Close', {
                        duration: 3000, 
                        horizontalPosition: 'center', 
                        verticalPosition: 'bottom', 
                        panelClass: 'error-snackbar' 
                    });
                } else {
                    console.error("no work", error);
                }
        });
    }
    addFilter(): void {
        if (this.filters.length < 3) {
            this.filters.push({field:'', compound_name: '', solventMatch: '', solvent_1: '', solvent_2: '', solvent_3: '', xrpdf: ''});
        } else {
            this._snackBar.open('Cannot add more than 3 filters', 'Close', {
                duration: 3000, 
                horizontalPosition: 'center', 
                verticalPosition: 'bottom', 
                panelClass: 'error-snackbar' // Custom CSS class for styling
            });       
        }
    }
    removeFilter(i: number): void {
        this.filters.splice(i, 1);
    }
    advancedSearch(): void {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        // Check if any filter fields are filled
        const filtersEmpty = this.filters.every(filter => !filter.compound_name && !filter.solvent_1 && !filter.solvent_2 && !filter.solvent_3 && !filter.xrpdf);

    // Show error message if filters are empty
        if (filtersEmpty) {
        this._snackBar.open('Please fill in at least one filter', 'Close', {
            duration: 3000, 
            horizontalPosition: 'center', 
            verticalPosition: 'bottom', 
            panelClass: 'error-snackbar' // Custom CSS class for styling
        });
        return;
        }

        const searchQuery2: AdvancedSearchQuery = {
            field: '',  
            compound_name: '',
            solventMatch: '',
            solvent_1: '',  
            solvent_2: '',  
            solvent_3: '',  
            xrpdf: '',  
        };
    
        // Loop through filters to populate searchQuery
        for (const filter of this.filters) {
            if (filter.field === 'compound_name') {
                searchQuery2.compound_name = filter.compound_name;
            } else if (filter.field === 'solvent') {
                searchQuery2.solventMatch = filter.solventMatch;
                searchQuery2.solvent_1 = filter.solvent_1;
                searchQuery2.solvent_2 = filter.solvent_2;
                searchQuery2.solvent_3 = filter.solvent_3;
            } else if (filter.field === 'xrpdf') {
                searchQuery2.xrpdf = filter.xrpdf;
            }
        }
        const searchQueryString = encodeURIComponent(JSON.stringify(searchQuery2));
        // console.log('advanced search query string:', searchQueryString);
    
        // Set the field based on the first filter
        searchQuery2.field = this.filters.length > 0 ? this.filters[0].field : '';
        console.log('advanced search query:', searchQuery2);
        this.http.get<any>(`http://127.0.0.1:5000/api/advancedSearch?query=${searchQueryString}`, {headers}).subscribe(
            (response) => {
                this.searchResults2 = response;
                console.log('advanced search results:', this.searchResults2);
            },
            (error) => {
                console.error("no work", error);
        });
    }
        
    resetSearch(): void {
        this.searchQuery = '';
        this.searchResults = [];
    }

    clearSearch(){
        this.compound_name = '';
        this.solventMatch = '';
        this.solvent_1 = '';
        this.solvent_2 = '';
        this.solvent_3 = '';
        this.xrpdf = '';
        this.filters = [{field:'', compound_name: '', solventMatch: '', solvent_1: '', solvent_2: '', solvent_3: '', xrpdf: ''}];
        this.searchQuery2 = '';
        this.searchResults2 = [];
    }

    
    
    onCheckboxChange(event: MatCheckboxChange, item: any) {
        const selectedData = {
            compound_name: item.compound_name,
            solvent_1: item.solvent_1,
            solvent_2: item.solvent_2,
            solvent_3: item.solvent_3,
            temp: item.temp,
            xrpdf: item.xrpdf,
            solubility: item[this.selectedUnit]
        };

        if (event.checked) {
            this.selectedItems.push(selectedData);
            console.log(this.selectedItems);
        } else {
            this.selectedItems = this.selectedItems.filter(
                data => 
                    !(data.compound_name === selectedData.compound_name &&
                      data.solvent_1 === selectedData.solvent_1 &&
                      data.solvent_2 === selectedData.solvent_2 &&
                      data.solvent_3 === selectedData.solvent_3 &&
                      data.temp === selectedData.temp &&
                      data.xrpdf === selectedData.xrpdf &&
                      data.solubility === selectedData.solubility)
            );
            console.log(this.selectedItems);}
        }    
    exportToExcel(selectedItems: any[]): void {
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(selectedItems);

        // Create a workbook
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };

        // Convert workbook to binary Excel file
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        // Save the file
        const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        saveAs(data, 'Solubility.xlsx');
    }
    
    toggleSelectAll1(event: MatCheckboxChange) {
        this.searchResults.forEach(item => {
            item.selected = event.checked;
        })

        if (event.checked) {
            this.selectedItems = this.searchResults.map(item => ({ 
                    compound_name: item.compound_name,
                    solvent_1: item.solvent_1,
                    solvent_2: item.solvent_2,
                    solvent_3: item.solvent_3,  
                    temp: item.temp,
                    xrpdf: item.xrpdf,                     
                    solubility: item[this.selectedUnit]
            }));
    
        } else {
            this.selectedItems = [];
            }
        }

    toggleSelectAll2(event: MatCheckboxChange) {
        this.searchResults2.forEach(item => {
            item.selected = event.checked;
        })


        if (event.checked) {
            this.selectedItems = this.searchResults2.map(item => ({ 
                    compound_name: item.compound_name,
                    solvent_1: item.solvent_1,
                    solvent_2: item.solvent_2,
                    solvent_3: item.solvent_3,  
                    temp: item.temp,
                    xrpdf: item.xrpdf,                     
                    solubility: item[this.selectedUnit]
            }));
        
        } else {
            this.selectedItems = [];
            }
        }    
    showGraph() {
        // console.log("Creating chart...");
    
        const labels = this.selectedItems.map(item => `${item.solvent_1} ${item.solvent_2} ${item.solvent_3} ${item.temp}°C`);
        const data = this.selectedItems.map(item => item.solubility);
        const datasetsLabels = `${this.selectedItems[0].compound_name} ${this.selectedItems[0].xrpdf}`;
        // const yAxisTitle = this.selectedUnit; // try to print the selected unit on y axis label

        const canvas = document.getElementById('barCanvas') as HTMLCanvasElement;
        if (!canvas) {
            console.error("Canvas element 'barCanvas' not found.");
            return;
        }
    
        if (this.barChart) {
            this.barChart.destroy();
            // console.log("Destroyed old chart...");

        } //else {
        //     // console.log("No existing chart to destroy.");
        // }

        // console.log("Creating new chart...");
        this.barChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: datasetsLabels,
                    data: data,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            text: this.selectedUnit, 
                            display: true
                        }
                    }
                }
            }
        });
    
        // console.log("Chart created successfully.");
    }
    
}
    
    

