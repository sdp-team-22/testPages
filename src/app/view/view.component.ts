import { Component, ElementRef, ViewChild, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import {FormsModule, FormControl , ReactiveFormsModule} from '@angular/forms';
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
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import * as XLSX from 'xlsx';
import {AdvancedSearchQuery, populateSearchQuery} from '../searchMethods/advanced_search'
import { Subscription, Observable, filter } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { MatAutocompleteModule, MatAutocomplete } from '@angular/material/autocomplete';

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
        MatCheckboxModule,
        MatSnackBarModule,
        ReactiveFormsModule,
        MatAutocompleteModule

    ],
    styleUrls: ['./view.component.scss']
    })
export class ViewComponent implements OnInit, OnDestroy {
    @ViewChild('barCanvas') barCanvas: any;
    @ViewChild(MatAutocomplete) auto!: MatAutocomplete;

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
    xrpd: string = '';
    solubility_mg_g_solv: number = 0;
    solubility_mg_g_solvn: number = 0;
    solubility_mg_mL_solv: number = 0;
    solubility_wt: number = 0;

    CurrentQuery: any[] = [];

    filters: AdvancedSearchQuery[] = [{field: '', compound_name: '', solventMatch: '', solvent_1: '', solvent_2: '', solvent_3: '', xrpd: ''}];
    isNaN: Function = Number.isNaN;
    barChart: any;
    scatterChart: any;
    selectedGraphType: string = 'bar'; //default bar

    xrpdOptions: string[] = [];
    compoundOptions: string[] = [];
    solvent1_Options: string[] = [];
    solvent2_Options: string[] = [];
    solvent3_Options: string[] = [];
    searchResultFilter: any[] = [];
    History: any[] = [];


    private xrpdOptionsSubscription: Subscription | undefined;

    //set up auto-complete for compound name
    myControl = new FormControl();
    filteredOptions: Observable<string[]> | undefined;

    solvent1Control = new FormControl();
    filterSolvent1: Observable<string[]> | undefined;

    solvent2Control = new FormControl();
    filterSolvent2: Observable<string[]> | undefined;

    solvent3Control = new FormControl();
    filterSolvent3: Observable<string[]> | undefined;

    

    constructor(private http: HttpClient, private _snackBar: MatSnackBar) { }

    ngOnInit() {
        this.fetchOptions();
        this.filteredOptions = this.myControl.valueChanges.pipe(
            startWith(''),
            map(value => this._filter(value, this.compoundOptions))
          );

        this.filterSolvent1 = this.solvent1Control.valueChanges.pipe(
            startWith(''),
            map(value => this._filter(value, this.solvent1_Options))
        );

        this.filterSolvent2 = this.solvent2Control.valueChanges.pipe(
            startWith(''),
            map(value => this._filter(value, this.solvent2_Options))
        );

        this.filterSolvent3 = this.solvent3Control.valueChanges.pipe(
            startWith(''),
            map(value => this._filter(value, this.solvent3_Options))
        );
      }

      private _filter(value: string, arrayToFilter: string[]): string[] {
        const filterValue = value.toLowerCase();
        return arrayToFilter.filter(option => option.toLowerCase().includes(filterValue));
      }

    ngOnDestroy() {
        if (this.xrpdOptionsSubscription) {
          this.xrpdOptionsSubscription.unsubscribe();
        }
      }

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
                }},
                
            () => this.searchResults.forEach((row: any) => {
                for (let key in row) {
                  if (row[key] == 'nan') { 
                    row[key] = '';
                }
                }
                }
                ));
    }

    addFilter(): void {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
        const filtersEmpty = this.filters.every(filter => !filter.compound_name && !filter.solvent_1 && !filter.solvent_2 && !filter.solvent_3 && !filter.xrpd);
    
        // Check if any of the fields in the current filter are not empty
        if (!filtersEmpty) {
            // Check if the maximum number of filters has been reached
            if (this.filters.length < 3) {
                // Add a new filter with default values
                const searchQueryString = populateSearchQuery(this.filters);
                this.http.get<any>(`http://127.0.0.1:5000/api/advancedSearch?query=${searchQueryString}`, { headers }).subscribe(
                    (response) => {
                        this.searchResultFilter = response;
                    
                        // Push current options arrays into History
                        this.History.push([
                            this.compoundOptions,
                            this.xrpdOptions,
                            this.solvent1_Options,
                            this.solvent2_Options,
                            this.solvent3_Options,
                        ]);
                    
                        // Define a mapping object to associate keys with set to avoid duplicate
                        const optionsMap: { [key: string]: Set<any> } = {
                            compound_name: new Set(),
                            xrpd: new Set(),
                            solvent_1: new Set(),
                            solvent_2: new Set(),
                            solvent_3: new Set(),
                        };
                    
                        // Iterate over searchResultFilter to populate options set
                        this.searchResultFilter.forEach((row: any) => {
                            for (let key in row) {
                                if (optionsMap.hasOwnProperty(key) && row[key] !== "nan" ) {
                                    optionsMap[key].add(row[key]);
                                }
                            }
                        });

                        // Reset the value of each options
                        this.compoundOptions = Array.from(optionsMap['compound_name']);
                        this.xrpdOptions = Array.from(optionsMap['xrpd']);
                        this.solvent1_Options = Array.from(optionsMap['solvent_1']);
                        this.solvent2_Options = Array.from(optionsMap['solvent_2']);
                        this.solvent3_Options = Array.from(optionsMap['solvent_3']);
                    },
                    (error) => {
                        console.error("no work", error);
                    });
    
                this.filters.push({field:'', compound_name: '', solventMatch: '', solvent_1: '', solvent_2: '', solvent_3: '', xrpd: ''});
            } else {
                // Display error message if more than 3 filters are already added
                this._snackBar.open('Cannot add more than 3 filters', 'Close', {
                    duration: 3000, 
                    horizontalPosition: 'center', 
                    verticalPosition: 'bottom', 
                    panelClass: 'error-snackbar' // Custom CSS class for styling
                });       
            }
        }
    }
    removeFilter(i: number): void {
        // Only can remove if there is atleast 1 filter. 
        if (this.filters.length > 1){
            this.filters.splice(i, 1);
            this.History.splice(i,1);
        }else {
            // Display error message if trying to delete all filters.
            this._snackBar.open('Need at least one filter', 'Close', {
                duration: 3000, 
                horizontalPosition: 'center', 
                verticalPosition: 'bottom', 
                panelClass: 'error-snackbar' // Custom CSS class for styling
            });  
        }     

    }
    advancedSearch(): void {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        // Check if any filter fields are filled
        const filtersEmpty = this.filters.every(filter => !filter.compound_name && !filter.solvent_1 && !filter.solvent_2 && !filter.solvent_3 && !filter.xrpd);

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
            xrpd: '',  
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
            } else if (filter.field === 'xrpd') {
                searchQuery2.xrpd = filter.xrpd;
            }
        }
        const searchQueryString = encodeURIComponent(JSON.stringify(searchQuery2));
    
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
        },
        () => this.searchResults2.forEach((row: any) => {
            for (let key in row) {
              if (row[key] == 'nan') { 
                row[key] = '';
              }
            }
          }
        )
        );
    }

    fetchOptions() {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        this.xrpdOptionsSubscription = this.http.get<any>('http://127.0.0.1:5000/api/form', { headers }).subscribe(
                    (response) => {
                if (response) {
                    this.processOptions(response.compound_name_options, this.compoundOptions);
                    this.processOptions(response.xrpd_options, this.xrpdOptions);
                    this.processOptions(response.solvent_1_options, this.solvent1_Options);
                    this.processOptions(response.solvent_2_options, this.solvent2_Options);
                    this.processOptions(response.solvent_3_options, this.solvent3_Options);

                    this.History.push([this.compoundOptions, this.xrpdOptions, this.solvent1_Options, this.solvent2_Options, this.solvent3_Options])
                } else {
                    console.error('Invalid response format:', response);
                }
            },
            (error) => {
                console.error('Error fetching options:', error);
            }
        );
    }

    processOptions(options: string[], targetArray: string[]) {
        if (options && Array.isArray(options)) {
            options.forEach((option: string) => {
                if (option !== 'nan') { // Exclude 'nan' values
                    targetArray.push(option);
                }
            });
        }
    }
    isInputDisabled(index: number): boolean {
        // Disable the input if it's not the last filter'
        return index !== this.filters.length - 1;
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
        this.xrpd = '';
        this.filters = [{field:'', compound_name: '', solventMatch: '', solvent_1: '', solvent_2: '', solvent_3: '', xrpd: ''}];
        this.searchQuery2 = '';
        this.searchResults2 = [];


        const state = this.History[0];
        this.compoundOptions = state[0];
        this.xrpdOptions = state[1];
        this.solvent1_Options = state[2];
        this.solvent2_Options = state[3];
        this.solvent3_Options = state[4];

    }

    
  onCheckboxChange(event: MatCheckboxChange, item: any) {
        const selectedData = {
            compound_name: item.compound_name,
            solvent_1: item.solvent_1,
            solvent_2: item.solvent_2,
            solvent_3: item.solvent_3,
            temp: item.temp,
            xrpd: item.xrpd,
            solubility: item[this.selectedUnit],
            fractions: [] as {unit: string, value: number}[],
            solubility_units: [] as {unit: string, value: number}[]
        };
        const fractionKeys = ['volfrac1', 'volfrac2', 'volfrac3', 'wtfrac1', 'wtfrac2', 'wtfrac3'];
        for (const fractionKey of fractionKeys) {
            if (item[fractionKey] !== null) {
                selectedData.fractions.push({
                    unit: fractionKey,
                    value: item[fractionKey]
                });
            }
        }

        const solubilityUnitKeys = ['solubility_mg_g_solv', 'solubility_mg_g_solvn', 'solubility_mg_mL_solv', 'solubility_wt'];
        for (const unitKey of solubilityUnitKeys) {
            if (item[unitKey] !== null) {
                selectedData.solubility_units.push({
                    unit: unitKey,
                    value: item[unitKey]
                });
            }
        }

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
                      data.xrpd === selectedData.xrpd &&
                      data.solubility === selectedData.solubility))
            ;
            console.log(this.selectedItems);}
        }    
    
    exportToExcel(selectedItems: any[]): void {
        if (selectedItems.length === 0) {
            this._snackBar.open('Cannot export an empty table', 'Close', {
                duration: 3000, 
                horizontalPosition: 'center', 
                verticalPosition: 'bottom', 
                panelClass: 'error-snackbar' 
            });
            return;
        }

        const flattenItems = selectedItems.map(item => ({
            compound_name: item.compound_name,
            solvent_1: item.solvent_1,
            solvent_2: item.solvent_2,
            solvent_3: item.solvent_3,
            temp: item.temp,
            xrpd: item.xrpd,
            ...item.fractions.reduce((acc: { [x: string]: any; }, fraction: { unit: string | number; value: any; }) => {
                acc[fraction.unit] = fraction.value;
                return acc; 
            }, {}),
            ...item.solubility_units.reduce((acc: { [x: string]: any; }, unit: { unit: string | number; value: any; }) => {
                acc[unit.unit] = unit.value;
                return acc;
            }, {})
            
        }));

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(flattenItems);

        // Create a workbook
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };

        // Convert workbook to binary Excel file
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        // Save the file
        let fileName = 'Solubility.xlsx';
        const existingFiles = window.localStorage.getItem('excelFiles');
        if (existingFiles) {
            const files = JSON.parse(existingFiles);
            let index = 1;
            while (files.includes(fileName)) {
                fileName = `Solubility ${index}.xlsx`;
                index++;
            }
            files.push(fileName);
            window.localStorage.setItem('excelFiles', JSON.stringify(files));
        } else {
            window.localStorage.setItem('excelFiles', JSON.stringify([fileName]));
        }

        const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        const url = window.URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
    }

    toggleSelectAll1(event: MatCheckboxChange) {
        this.searchResults.forEach(item => {
            item.selected = event.checked;
    
            if (event.checked) {
                const selectedData = {
                    compound_name: item.compound_name,
                    solvent_1: item.solvent_1,
                    solvent_2: item.solvent_2,
                    solvent_3: item.solvent_3,  
                    temp: item.temp,
                    xrpd: item.xrpd,                     
                    solubility: item[this.selectedUnit],
                    fractions: [] as {unit: string, value: number}[],
                    solubility_units: [] as {unit: string, value: number}[]
                };
    
                const fractionKeys = ['volfrac1', 'volfrac2', 'volfrac3', 'wtfrac1', 'wtfrac2', 'wtfrac3'];
                for (const fractionKey of fractionKeys) {
                    if (item[fractionKey] !== null) {
                        selectedData.fractions.push({
                            unit: fractionKey,
                            value: item[fractionKey]
                        });
                    }
                }
    
                const solubilityUnitKeys = ['solubility_mg_g_solv', 'solubility_mg_g_solvn', 'solubility_mg_mL_solv', 'solubility_wt'];
                for (const unitKey of solubilityUnitKeys) {
                    if (item[unitKey] !== null) {
                        selectedData.solubility_units.push({
                            unit: unitKey,
                            value: item[unitKey]
                        });
                    }
                }
    
                this.selectedItems.push(selectedData);
            } else {
                this.selectedItems = this.selectedItems.filter(
                    data => 
                        !(data.compound_name === item.compound_name &&
                          data.solvent_1 === item.solvent_1 &&
                          data.solvent_2 === item.solvent_2 &&
                          data.solvent_3 === item.solvent_3 &&
                          data.temp === item.temp &&
                          data.xrpd === item.xrpd &&
                          data.solubility === item[this.selectedUnit])
                );
            }
        });
    }
    

    toggleSelectAll2(event: MatCheckboxChange) {
        this.searchResults2.forEach(item => {
            item.selected = event.checked;
        
            if (event.checked) {
                const selectedData = {
                    compound_name: item.compound_name,
                    solvent_1: item.solvent_1,
                    solvent_2: item.solvent_2,
                    solvent_3: item.solvent_3,  
                    temp: item.temp,
                    xrpd: item.xrpd,                     
                    solubility: item[this.selectedUnit],
                    fractions: [] as {unit: string, value: number}[],
                    solubility_units: [] as {unit: string, value: number}[]
                };
    
                const fractionKeys = ['volfrac1', 'volfrac2', 'volfrac3', 'wtfrac1', 'wtfrac2', 'wtfrac3'];
                for (const fractionKey of fractionKeys) {
                    if (item[fractionKey] !== null) {
                        selectedData.fractions.push({
                            unit: fractionKey,
                            value: item[fractionKey]
                        });
                    }
                }
    
                const solubilityUnitKeys = ['solubility_mg_g_solv', 'solubility_mg_g_solvn', 'solubility_mg_mL_solv', 'solubility_wt'];
                for (const unitKey of solubilityUnitKeys) {
                    if (item[unitKey] !== null) {
                        selectedData.solubility_units.push({
                            unit: unitKey,
                            value: item[unitKey]
                        });
                    }
                }
    
                this.selectedItems.push(selectedData);
            } else {
                this.selectedItems = this.selectedItems.filter(
                    data => 
                        !(data.compound_name === item.compound_name &&
                          data.solvent_1 === item.solvent_1 &&
                          data.solvent_2 === item.solvent_2 &&
                          data.solvent_3 === item.solvent_3 &&
                          data.temp === item.temp &&
                          data.xrpd === item.xrpd &&
                          data.solubility === item[this.selectedUnit])
                );
            }
        });
    }

showGraph() {
    let canvas = document.getElementById('chartCanvas') as HTMLCanvasElement;
    if (!canvas) {
        console.error("Canvas element 'chartCanvas' not found.");
        return;
    }
    let chartInstances = Chart.instances;
    for (let chartInstance in chartInstances) {
        if (chartInstances.hasOwnProperty(chartInstance)) {
            chartInstances[chartInstance].destroy();
        }
    }

    if (this.barChart) {
        this.barChart.destroy();
    }
    else if (this.scatterChart) {
        this.scatterChart.destroy();
    }

    if (this.selectedGraphType === 'bar') {
        this.plotBarChart(canvas);
    } else if (this.selectedGraphType === 'scatter') {
        this.plotScatterPlot(canvas);
    }
}

plotBarChart(canvas: HTMLCanvasElement) {
    if (this.selectedItems.length === 0) {
        this._snackBar.open('Please select at least one item', 'Close', {
            duration: 3000, 
            horizontalPosition: 'center', 
            verticalPosition: 'bottom', 
            panelClass: 'error-snackbar' 
        });
        return;
    }
    const labels = this.selectedItems.map(item => `${item.solvent_1} ${item.solvent_2} ${item.solvent_3} ${item.temp}°C`);
    const data = this.selectedItems.map(item => item.solubility);
    const datasetsLabels = `${this.selectedItems[0].compound_name} ${this.selectedItems[0].xrpd}`;

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
}

plotScatterPlot(canvas: HTMLCanvasElement) {
    if (this.selectedItems.length === 0) {
        this._snackBar.open('Please select at least one item', 'Close', {
            duration: 3000, 
            horizontalPosition: 'center', 
            verticalPosition: 'bottom', 
            panelClass: 'error-snackbar' 
        });
        return;
    }
    const data = this.selectedItems.map(item => {
        return {
            x: item.temp,
            y: item.solubility
        };
    });
    const datasetsLabels = `${this.selectedItems[0].compound_name} ${this.selectedItems[0].xrpd}`;

    this.scatterChart = new Chart(canvas, {
        type: 'scatter',
        data: {
            datasets: [{
                label: datasetsLabels,
                data: data,
                backgroundColor: 'rgba(3, 68, 38, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 7
            }]
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true,
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        text: 'Temperature (°C)',
                        display: true
                    }
                },
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
}
    
}

    
    

