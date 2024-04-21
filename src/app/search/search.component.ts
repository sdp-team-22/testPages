import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // to use *ngIf
import { FormControl, FormsModule } from '@angular/forms'; // to use ngModel
// for filters
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { SearchService } from '../search.service';
// for table
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// for cool buttons 
import { MatButtonModule } from '@angular/material/button';
//for selection box
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
//for graph
import {Chart} from 'chart.js/auto';
import * as XLSX from 'xlsx';

@Component({
    selector: 'search-root',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        // for filters
        MatAutocompleteModule,
        MatInputModule,
        ReactiveFormsModule,
        MatTableModule,
        MatCheckboxModule,
        MatSnackBarModule,
        // for buttons
        MatButtonModule,
        // for selection box
        MatFormFieldModule,
        MatSelectModule,
    ]
  })
export class SearchComponent {
    // used to toggle between searches
    useBasicSearch: boolean = true;
    toggleSearchButtonText: string = this.useBasicSearch === true ? "Switch to Advanced Search?": "Switch to Basic Search?";
    
    // for graph
    barChart: any;
    scatterChart: any;
    selectedUnit: string = 'solubility_mg_g_solv'; //default
    selectedFraction: string = 'wtfrac'; //default
    selectedItems: any[] = [];
    selectedGraphType: string = 'bar'; //default bar
    selectAllCheckbox: boolean = false;

    // basic search variables
    restrictiveSearch: boolean = true;
    searchQuery: any;
    result: any[] = [];

    // advanced search variables
    filters = [
        { 
            mainOptions: ['test option 1', 'test option 2', 'test option 3'],
            compoundNameOptions: ['compound name 1', 'compound name 2', 'compound name 3'],
            xrpdOptions: ['xrpd option 1', 'xrpd option 2', 'xrpd option 3'],
            solventOptions1: ['has exact combination', 'has any data on'],
            solventAnyDataOptions: [['1', '2', '3'],['4', '5', '6'], ['7', '8', '9']],
            solventExactDataOptions: [['1', '2', '3'],['4', '5', '6'], ['7', '8', '9']],
            solventAnyDataCount: 0,
            solventExactDataCount: 0,
            controls: { 
                mainControl: new FormControl(),
                compoundNameControl: new FormControl(),
                xrpdControl: new FormControl(),
                solventControl1: new FormControl(),
                solventAnyDataControl: [new FormControl],
                solventExactDataControl: [new FormControl],
            }
        },
    ]

    constructor(private flaskConnectionService: SearchService, private _snackBar: MatSnackBar){}

    /**
     * void toggleSearchType()
     * calling this switches between basic and advanced search
     */
    toggleSearchType() {
        this.result = [];
        this.selectedItems = [];
        if (this.useBasicSearch) {
            this.useBasicSearch = false;
            this.searchQuery = "";
            this.toggleSearchButtonText = "Switch to Basic Search?";
            this.resetFilters();
        } else {
            this.useBasicSearch = true;
            this.toggleSearchButtonText = "Switch to Advanced Search?";
        }
    }

    resetFilters() {
        // reset advanced search
        for (let i = this.filters.length - 1; i >= 0; i--) {
            this.filters[i].controls.mainControl.reset();
            this.filters.pop();
        }
        this.addFilter();
    }

    toggleRestrictedSearch() {
        this.resetFilters();
        var onOff = this.restrictiveSearch === true ? 'ON': 'OFF';
        this._snackBar.open('Restrictive Search has been toggled: ' + onOff, 'Close', {
            duration: 2000, 
            horizontalPosition: 'center', 
            verticalPosition: 'bottom', 
            // panelClass: 'error-snackbar' // Custom CSS class for styling
        });
    }

    /**
     * void addFilter()
     * adds a filter to filters list, which gets shown in frontend
     */
    addFilter() {
        // console.log("add filter");
        var compoundNameOptions: string[] = []; // need to populate this
        var xrpdOptions: string[] = []; // need to populate this
        var solventAnyDataOptions: string[][] = [];
        var solventExactDataOptions: string[][] = [];
        // create other requirements for a filter
        var level1Options: string[] = ['Compound Name', 'XRPD', 'Solvent'];
        var solventOptions1: string[] = ['has exact combination', 'has any data on'];
        var mainControl = new FormControl();
        var compoundNameControl = new FormControl();
        var newXRPDControl = new FormControl();
        var newSolventControl1 = new FormControl();
        var solventAnyDataControl: FormControl[] = [];
        var solventExactDataControl: FormControl[] = [];
        var newFilter = {
            mainOptions: level1Options,
            compoundNameOptions: compoundNameOptions,
            xrpdOptions: xrpdOptions,
            solventOptions1: solventOptions1,
            solventAnyDataOptions: solventAnyDataOptions,
            solventExactDataOptions: solventExactDataOptions,
            solventAnyDataCount: 0,
            solventExactDataCount: 0,
            controls: { 
                mainControl: mainControl,
                compoundNameControl: compoundNameControl,
                xrpdControl: newXRPDControl,
                solventControl1: newSolventControl1,
                solventAnyDataControl: solventAnyDataControl,
                solventExactDataControl: solventExactDataControl,
            },
        }
        this.filters.push(newFilter);
    }

    onFilterL1Changed(event: MatAutocompleteSelectedEvent, filterId: string) {
        /**
         * 1. get values of all other filters
         * 2. show/hide the responding filters
         * 3. adjust the values in those filters (if in restrictive mode)
         *   - here we can only adjust values for compound name and xrpd
         */
        const option = event.option.value;
        var id = this.getId(filterId);
        // console.log('Option selected:', option, ' | Parent ID:', filterId);
        // do different things based on filter selection
        switch(option) {
            case 'Compound Name':
                //console.log("Compound Name Selected");
                this.showElement('compoundName_' + id)
                this.hideElement('XRPD_' + id);
                this.hideElement('solubilityExactContains_' + id)
                this.hideElement('solubilityAnyData_' + id);
                this.resetContains(id);
                // find compound name options
                if (!(this.restrictiveSearch && this.filters.length > 1)) {
                    this.flaskConnectionService.grabAllCompounds().subscribe(
                        (response) => {
                            // console.log(response);
                            this.filters[id].compoundNameOptions = response;
                            // console.log('original cname setting for', id, this.filters[id].compoundNameOptions)
                        },
                        (error) => {
                            console.log(error);
                        }
                    )
                }
                break;
            case 'XRPD':
                //console.log("XRPD Selected");
                this.hideElement('compoundName_' + id)
                this.showElement('XRPD_' + id);
                this.hideElement('solubilityExactContains_' + id)
                this.hideElement('solubilityAnyData_' + id);
                this.resetContains(id);
                // find xrpd options
                if (!(this.restrictiveSearch && this.filters.length > 1)) {
                    this.flaskConnectionService.grabAllXRPD().subscribe(
                        (response) => {
                            // console.log(response);
                            this.filters[id].xrpdOptions = response;
                            // console.log('original xrpd setting for', id, this.filters[id].xrpdOptions)
                        },
                        (error) => {
                            console.log(error);
                        }
                    );
                }
                break;
            case 'Solvent':
                //console.log("Solvent Selected");
                this.hideElement('compoundName_' + id)
                this.showElement('solubilityExactContains_' + id);
                this.hideElement('XRPD_' + id)
                this.resetContains(id);
                break;
        }
        // restrictive filters logic
        if (this.restrictiveSearch && this.filters.length > 1) {
            var newOptions: any = [];
            var tempSelected = this.getFilterData();
            if (option == 'Compound Name' || option == 'XRPD') {
                this.flaskConnectionService.grabAllRestricted({ 'filterContents':tempSelected, 'type': event.option.value, 'exact':[] }).subscribe(
                    response => {
                        // console.log(response);
                        newOptions = response;
                        if (option == 'Compound Name') {
                            // console.log('changing compound name options for', id);
                            // console.log('old cname:', this.filters[id].compoundNameOptions);
                            this.filters[id].compoundNameOptions = newOptions;
                            // console.log('new cname:', this.filters[id].compoundNameOptions);
                        } else if (option == 'XRPD') {
                            // console.log('changing xrpd options for', id);
                            // console.log('old xrpd:', this.filters[id].xrpdOptions);
                            this.filters[id].xrpdOptions = newOptions;
                            // console.log('new xrpd:', this.filters[id].xrpdOptions);
                        }
                    },
                    error => {

                    }
                );
            }
        }
    }

    onFilterL2SolventChanged(event: MatAutocompleteSelectedEvent, filterId: string) {
        /**
         * restrictive mode logic in addSolventExactFilter and addSolventFilter
         */
        var id = this.getId(filterId);
        switch(event.option.value) {
            case 'has exact combination':
                this.showElement('solubilityExactData_' + id);
                this.hideElement('solubilityAnyData_' + id);
                this.resetContains(id);
                // create a filter
                this.addSolventExactFilter(event, id, 0);
                break;
            case 'has any data on':
                this.showElement('solubilityAnyData_' + id);
                this.resetContains(id);
                // create a filter
                this.addSolventFilter(event, id, 0);
                break;
        }
    }

    resetContains(id: number) {
        this.filters[id].solventExactDataCount = 0;
        this.filters[id].solventExactDataOptions = [];
        this.filters[id].controls.solventExactDataControl = [];
        this.filters[id].solventAnyDataCount = 0;
        this.filters[id].solventAnyDataOptions = [];
        this.filters[id].controls.solventAnyDataControl = [];
    }

    filterSolventExactChanged(event: MatAutocompleteSelectedEvent, i: number, j: number) {
        // 1st or 2nd filter selection, and we are selecting newest filter
        if (j < 2 && j == this.filters[i].solventExactDataCount - 1) {
            this.addSolventExactFilter(event, i, j + 1);
        } else if (j < this.filters[i].solventExactDataCount - 1) {
            // selecting older filter (delete all new ones, start from last changed)
            // console.log(this.filters[i].solventExactDataCount - 1, j);
            for (let k = this.filters[i].solventExactDataCount - 1; k > j; k--) {
                this.filters[i].solventExactDataCount--;
                this.filters[i].solventExactDataOptions.pop();
                this.filters[i].controls.solventExactDataControl.pop();
            }
            this.addSolventExactFilter(event, i, j + 1);
        }
    }

    filterSolventHasAnyChanged(event: MatAutocompleteSelectedEvent, i: number, j: number) {
        // increase number of filters if j is last and no null
        if (j == this.filters[i].solventAnyDataCount - 1) {
            // adding a solvent filter
            // console.log("onFilterHasAnyDataSolventChanged");
            this.addSolventFilter(event, i, j + 1);
        }
    }

    /**
     * void addSolventFilter
     * Adds solvent filter to the end of filters for solvent 'has any' filter
     * - increases solventAnyDataOnCount by 1 (which generates new box)
     * - adds options to solventAnyDataOnOptions[][]
     * - adds control to solventAnyDataOnControl[]
     */
    addSolventFilter(event: MatAutocompleteSelectedEvent, i: number, j: number) {
        // console.log(this.filters[i]);
        /**
         * Restrictive mode:
         * 1. get values of all other filters
         * 2. show/hide the responding filters
         * 3. adjust the values in those filters
         */
        var options: string[] = [];
        var tempControl = new FormControl();
        this.filters[i].solventAnyDataOptions.push(options);
        // console.log(this.filters[i].solventAnyDataOptions);
        this.filters[i].controls.solventAnyDataControl.push(tempControl);
        // restrictive search check
        if (!(this.restrictiveSearch && this.filters.length > 1)) {
            this.flaskConnectionService.grabAllSolvents().subscribe(
                (response) => {
                    // console.log(response);
                    // console.log(j, this.filters[i].solventAnyDataOptions);
                    this.filters[i].solventAnyDataOptions[j] = response;
                    this.filters[i].solventAnyDataCount++;
                },
                (error) => {
                    console.log(error);
                }
            )
        } else {
            var tempSelected = this.getFilterData();
            this.flaskConnectionService.grabAllRestricted({ 'filterContents':tempSelected, 'type': 'has any', 'exact':[] }).subscribe(
                (response) => {
                    // console.log(response);
                    // console.log(j, this.filters[i].solventAnyDataOptions);
                    // console.log(response);
                    this.filters[i].solventAnyDataOptions[j] = response;
                    this.filters[i].solventAnyDataCount++;
                    // console.log(this.filters[i].solventAnyDataCount);
                },
                (error) => {
                    console.log(error);
                }
            )
        }
    }

    /**
     * void addSolventFilter
     * Adds solvent filter to the end of filters for solvent 'has any' filter
     * - increases solventAnyDataOnCount by 1 (which generates new box)
     * - adds options to solventAnyDataOnOptions[][]
     * - adds control to solventAnyDataOnControl[]
     */
    addSolventExactFilter(event: MatAutocompleteSelectedEvent, i: number, j: number) {
        // console.log(this.filters[i]);
        var options: string[] = [];
        var tempControl = new FormControl();
        this.filters[i].solventExactDataOptions.push(options);
        this.filters[i].controls.solventExactDataControl.push(tempControl);
        if (j == 0) {
            // writing first filter
            if (!(this.restrictiveSearch && this.filters.length > 1)) {
                this.flaskConnectionService.grabAllSolvents().subscribe(
                    (response) => {
                        // console.log(response);
                        // console.log(j, this.filters[i].solventExactDataOptions);
                        this.filters[i].solventExactDataOptions[j] = response;
                        this.filters[i].solventExactDataCount++;
                    },
                    (error) => {
                        console.log(error);
                    }
                )
            } else {
                // restrictive first exact filter
                // check compound names, xrpds, has filters
                var tempSelected = this.getFilterData();
                this.flaskConnectionService.grabAllRestricted({ 'filterContents':tempSelected, 'type': 'has exact', 'exact':[] }).subscribe(
                    (response) => {
                        // console.log(response);
                        this.filters[i].solventExactDataOptions[j] = response;
                        this.filters[i].solventExactDataCount++;
                    },
                    (error) => {
                        console.log(error);
                    }
                )
            }
        } else if (j == 1) {
            // 1 filter selected, find options for second
            // console.log('preparing second filter');
            var value1 = this.filters[i].controls.solventExactDataControl[0].value;
            if (!(this.restrictiveSearch && this.filters.length > 1)) {
                this.flaskConnectionService.grabConstrained([value1]).subscribe(
                    (response: {[key: string]: any}) => {
                        var temp = response['solvent_2_options'];
                        this.filters[i].solventExactDataOptions[j] = temp;
                        this.filters[i].solventExactDataCount++;
                    },
                    error => {
                        console.log(error);
                    }
                )
            } else {
                // restrictive second exact filter
                // check compound names, xrpds, has filters, first exact filter
                var tempSelected = this.getFilterData();
                this.flaskConnectionService.grabAllRestricted({ 'filterContents':tempSelected, 'type': 'has exact', 'exact':[value1] }).subscribe(
                    (response) => {
                        // console.log(response);
                        this.filters[i].solventExactDataOptions[j] = response;
                        this.filters[i].solventExactDataCount++;
                    },
                    (error) => {
                        console.log(error);
                    }
                )
            }
        } else if (j == 2) {
            // 2 filters selected, find options for third
            // console.log('preparing third filter');
            var value1 = this.filters[i].controls.solventExactDataControl[0].value;
            var value2 = this.filters[i].controls.solventExactDataControl[1].value;
            if (!(this.restrictiveSearch && this.filters.length > 1)) {
                this.flaskConnectionService.grabConstrained([value1, value2]).subscribe(
                    (response: any) => {
                        // console.log(response);
                        var temp = response['solvent_3_options'];
                        this.filters[i].solventExactDataOptions[j] = temp;
                        this.filters[i].solventExactDataCount++;
                    }, 
                    error => {
                        console.log("error with advanced search");
                    }
                )
            } else {
                // restrictive third exact filter
                // check compound names, xrpds, has filters, first and second exact filter
                var tempSelected = this.getFilterData();
                this.flaskConnectionService.grabAllRestricted({ 'filterContents':tempSelected, 'type': 'has exact', 'exact':[value1, value2] }).subscribe(
                    (response) => {
                        // console.log(response);
                        this.filters[i].solventExactDataOptions[j] = response;
                        this.filters[i].solventExactDataCount++;
                    },
                    (error) => {
                        console.log(error);
                    }
                )
            }
        }
    }

    deleteFilter(filterId: string) {
        // console.log("delete:", filterId);
        if (this.filters.length > 1) {
            var index = this.getId(filterId);
            this.filters[index].controls.mainControl.reset(); // reset control
            this.filters.splice(index, 1);
        } else {
            this.resetFilters();
        }
    }

    basicSearch() {
        // console.log(this.searchQuery);
        if (!this.searchQuery) {
            this._snackBar.open('Please enter Compound Name', 'Close', {
                duration: 2000, 
                horizontalPosition: 'center', 
                verticalPosition: 'bottom', 
                panelClass: 'error-snackbar' // Custom CSS class for styling
            });
            return;
        }
        this.flaskConnectionService.basicSearch(this.searchQuery).subscribe(
            (response: any) => {
                //console.log(response);
                if (response.length == 0) {
                    // console.log('no results');
                    this._snackBar.open('No results found', 'Close', {
                        duration: 2000, 
                        horizontalPosition: 'center', 
                        verticalPosition: 'bottom', 
                        panelClass: 'error-snackbar' // Custom CSS class for styling
                    });
                    return;
                }
                this.result = response;
                this.selectedItems = [];
                this.showGraph();
                this.removeZeros(this.result);
                this.selectAllCheckbox = false;
            },            
            error => {
                console.error('Error: search.component.ts basicSearch() failed');
            },
        );
        
    }

    getFilterData() {
        var filterData = {'Compound Name':[] as string[], 'XRPD':[] as string[], 'Solvent Exact': [[]] as [string[]], 'Solvent Contains': [] as string[]}
        for (let i = 0; i < this.filters.length; i++) {
            var mainSelection = this.filters[i].controls.mainControl.value;
            switch (mainSelection) {
                case 'Compound Name':
                    const tempName: string = this.filters[i].controls.compoundNameControl.value;
                    filterData['Compound Name'].push(tempName);
                    break;
                case 'XRPD':
                    const tempXRPD: string = this.filters[i].controls.xrpdControl.value;
                    filterData['XRPD'].push(tempXRPD);
                    break;
                case 'Solvent':
                    const Solvent2: string = this.filters[i].controls.solventControl1.value;
                    switch(Solvent2) {
                        case 'has exact combination':
                            var tempControls = this.filters[i].controls.solventExactDataControl;
                            var tempList = []
                            for (let j = 0; j < tempControls.length; j++) {
                                tempList.push(tempControls[j].value);
                            }
                            filterData['Solvent Exact'].push(tempList);
                            break;
                        case 'has any data on':
                            var tempControls = this.filters[i].controls.solventAnyDataControl;
                            for (let j = 0; j < tempControls.length; j++) {
                                filterData['Solvent Contains'].push(tempControls[j].value);
                            }
                            break;
                    }
                break;
            }
        }
        return filterData;
    }

    advancedSearch() {
        var advancedQuery = this.getFilterData();
        // console.log(advancedQuery);
        if (!(this.restrictiveSearch)) {
            this.flaskConnectionService.advancedSearch(advancedQuery).subscribe (
                (response: any) => {
                    console.log(response);
                    if (response.length == 0) {
                        // console.log('no results');
                        this._snackBar.open('No results found', 'Close', {
                            duration: 2000, 
                            horizontalPosition: 'center', 
                            verticalPosition: 'bottom', 
                            panelClass: 'error-snackbar' // Custom CSS class for styling
                        });
                        return;
                    }
                    this.result = response;
                    this.selectedItems = [];
                    this.showGraph();
                    this.removeZeros(this.result);
                    this.selectAllCheckbox = false;
                },
                (error) => {
                    console.log('Error search.component.ts: advancedSearch');
                }
            );
        } else {
            // restricted advanced search
            this.flaskConnectionService.advancedSearchRestricted(advancedQuery).subscribe (
                (response: any) => {
                    // console.log(response);
                    if (response.length == 0) {
                        // console.log('no results');
                        this._snackBar.open('No results found', 'Close', {
                            duration: 2000, 
                            horizontalPosition: 'center', 
                            verticalPosition: 'bottom', 
                            panelClass: 'error-snackbar' // Custom CSS class for styling
                        });
                        return;
                    }
                    this.result = response;
                    this.selectedItems = [];
                    this.showGraph();
                    this.removeZeros(this.result);
                    this.selectAllCheckbox = false;
                },
                (error) => {
                    console.log('Error search.component.ts: advancedSearch2:', error);
                }
            );
        }
    }

    /**
     * void toggleSelectAll
     * select or de-select all the rows and keep track of them
     * - if select
     *      - check all the available checkboxes
     *      - adds the data from each row to selectedItems[]
     * - if de-select
     *      - uncheck all the available checkboxes
     *      - remove the data of each row from selectedItems[]
     */
    toggleSelectAll(event : MatCheckboxChange){
        // highlights the checkboxes
        this.result.forEach(item => {
            item.selected = event.checked;

            // add all checked rows to selectedItems[]
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
        this.showGraph();
        console.log(this.selectedItems)
    }

    /**
     * void onCheckboxChange
     * select or de-select the user selected box and keeps track of the corresponding row data
     * - if select
     *      - check the selected checkbox
     *      - adds the data in row to selectedItems[]
     * - if de-select
     *      - uncheck the selected checkbox
     *      - remove the data in the row from selectedItems[]
     *
     */
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
            // console.log(this.selectedItems);
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
            // console.log(this.selectedItems);
        }
        this.showGraph();
        this.selectAllCheckbox = (this.selectedItems.length == this.result.length) ? true : false;
    }

    deleteSelection() {
        // console.log("delete selected items");
        for (let singleSelected of this.selectedItems) {
            var cname = singleSelected['compound_name'];
            var solv1 = singleSelected['solvent_1'];
            var solv2 = singleSelected['solvent_2'];
            var solv3 = singleSelected['solvent_3'];
            var temp = singleSelected['temp'];
            var xrpd = singleSelected['xrpd'];
            var vfrac1 = singleSelected['fractions'][0]['value'];
            var vfrac2 = singleSelected['fractions'][1]['value'];
            var vfrac3 = singleSelected['fractions'][2]['value'];
            var wfrac1 = singleSelected['fractions'][3]['value'];
            var wfrac2 = singleSelected['fractions'][4]['value'];
            var wfrac3 = singleSelected['fractions'][5]['value'];
            // console.log(singleSelected['fractions']);
            this.result = this.result.filter(singleResult => {
                if (singleResult['compound_name'] == cname) {
                    // console.log('\n\n\n', singleSelected);
                    // console.log(singleResult);
                    // console.log('identical compound name');
                    if (singleResult['solvent_1'] == solv1) {
                        // console.log('identical solvent 1');
                        if (singleResult['solvent_2'] == solv2) {
                            // console.log('identical solvent 2');
                            if (singleResult['solvent_3'] == solv3) {
                                // console.log('identical solvent 3');
                                if (singleResult['temp'] == temp) {
                                    // console.log('identical temp');
                                    if (singleResult['xrpd'] == xrpd) {
                                        // console.log('identical xrpd');
                                        if (singleResult['volfrac1'] == vfrac1) {
                                            // console.log('identical volfrac1');
                                            if (singleResult['volfrac2'] == vfrac2) {
                                                // console.log('identical volfrac2');
                                                if (singleResult['volfrac3'] == vfrac3) {
                                                    // console.log('identical volfrac3');
                                                    if (singleResult['wtfrac1'] == wfrac1) {
                                                        // console.log('identical wfrac1');
                                                        if (singleResult['wtfrac2'] == wfrac2) {
                                                            // console.log('identical wfrac2');
                                                            if (singleResult['wtfrac3'] == wfrac3) {
                                                                // console.log('identical wfrac3');
                                                                // console.log('identical primary key'); // we want to remove singleResult
                                                                this.deleteFromDatabase(singleResult);
                                                                return false;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                return true;
            });
        }
        this.selectedItems = [];
        this.showGraph();
    }

    deleteFromDatabase(item: any) {
        // console.log(item);
        this.flaskConnectionService.deleteRow(item).subscribe(
            response => {
                // console.log(response);
            },
            error => {
                // console.log('delete from database failed:', error);
            }
        );
    }

    showGraph() {
        let canvasDiv = document.getElementById('chartCanvasDiv') as HTMLDivElement;
        let canvas = document.getElementById('chartCanvas') as HTMLCanvasElement;
        if (!canvasDiv) {
            // console.error("Canvas element 'chartCanvasDiv' not found.");
            return;
        } else if (this.selectedItems.length > 0) {
            canvasDiv.style.display = 'block';
        } else {
            canvasDiv.style.display = 'none';
            return;
        }
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
                            display: true,
                            font:{
                                size: 20,
                                weight: 'bold'
                            }
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
                            display: true,
                            font:{
                                size: 20,
                                weight: 'bold'
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            text: this.selectedUnit,
                            display: true,
                            font:{
                                size: 20,
                                weight: 'bold'
                            }
                        }
                    }
                }
            }
        });
    }
    
    removeZeros(inputData : any[]) {
        inputData.forEach((row: any) => {
            for (let key in row) {
                if (row[key] == 'nan') { 
                    row[key] = '';
                }
            }
        });
    }
    
    getId(inputString: string) {
        const strId = inputString.substring(inputString.lastIndexOf("_") + 1);
        const intId = parseInt(strId, 10);
        // console.log(intId);
        return intId;
    }

    showElement(id: string) {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'block';
        }
    }

    hideElement(id: string) {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    }

    /**
     * any[] generateArray(n)
     * This is used for solubility 'has any data on'
     * This will expand every time user selects new thing
     */
    generateArray(n: number): any[] {
        return Array(n);
    }

    downloadSelection() {
        // console.log('download selection');
        const flattenItems = this.selectedItems.map(item => ({
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
}
