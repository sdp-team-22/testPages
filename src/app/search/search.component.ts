import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // to use *ngIf
import { Form, FormControl, FormsModule } from '@angular/forms'; // to use ngModel
// for filters
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { SearchService } from '../search.service';

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
    ]
  })
export class SearchComponent {
    // used to toggle between searches
    useBasicSearch: boolean = true;
    toggleSearchButtonText: string = this.useBasicSearch === true ? "Switch to Advanced Search?": "Switch to Basic Search?";
    
    // basic search variables
    searchQuery: any;

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

    constructor(private flaskConnectionService: SearchService){}

    /**
     * void toggleSearchType()
     * calling this switches between basic and advanced search
     */
    toggleSearchType() {
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
                this.flaskConnectionService.grabAllCompounds().subscribe(
                    (response) => {
                        // console.log(response);
                        this.filters[id].compoundNameOptions = response;
                    },
                    (error) => {
                        console.log(error);
                    }
                )
                // find compound name options based on current filters
                break;
            case 'XRPD':
                //console.log("XRPD Selected");
                this.hideElement('compoundName_' + id)
                this.showElement('XRPD_' + id);
                this.hideElement('solubilityExactContains_' + id)
                this.hideElement('solubilityAnyData_' + id);
                this.resetContains(id);
                // find xrpd options
                this.flaskConnectionService.grabAllXRPD().subscribe(
                    (response) => {
                        // console.log(response);
                        this.filters[id].xrpdOptions = response;
                    },
                    (error) => {
                        console.log(error);
                    }
                );
                // find xrpd options based on current filters
                break;
            case 'Solvent':
                //console.log("Solvent Selected");
                this.hideElement('compoundName_' + id)
                this.showElement('solubilityExactContains_' + id);
                this.hideElement('XRPD_' + id)
                this.resetContains(id);
                break;
        }
    }

    onFilterL2SolventChanged(event: MatAutocompleteSelectedEvent, filterId: string) {
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
            console.log("hmmm");
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
        var options: string[] = [];
        var tempControl = new FormControl();
        this.filters[i].solventAnyDataOptions.push(options);
        this.filters[i].controls.solventAnyDataControl.push(tempControl);
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
        } else if (j == 1) {
            // 1 filter selected, find options for second
            console.log('preparing second filter');
            this.flaskConnectionService.grabConstrained([this.filters[i].controls.solventExactDataControl[0].value]).subscribe(
                (response: {[key: string]: any}) => {
                    var temp = response['solvent_2_options'];
                    this.filters[i].solventExactDataOptions[j] = temp;
                    this.filters[i].solventExactDataCount++;
                },
                error => {

                }
            )
        } else if (j == 2) {
            // 2 filters selected, find options for third
            console.log('preparing second filter');
            var value1 = this.filters[i].controls.solventExactDataControl[0].value;
            var value2 = this.filters[i].controls.solventExactDataControl[1].value;
            this.flaskConnectionService.grabConstrained([value1, value2]).subscribe(
                (response: {[key: string]: any}) => {
                    var temp = response['solvent_3_options'];
                    this.filters[i].solventExactDataOptions[j] = temp;
                    this.filters[i].solventExactDataCount++;
                },
                error => {

                }
            )
        }
    }

    deleteFilter(filterId: string) {
        console.log("delete:", filterId);
        if (this.filters.length > 1) {
            var index = this.getId(filterId);
            this.filters[index].controls.mainControl.reset(); // reset control
            this.filters.splice(index, 1);
        }
    }

    basicSearch() {
        console.log("enter pressed");
        this.flaskConnectionService.basicSearch(this.searchQuery).subscribe(
            response => {
                console.log(response);
            },
            error => {
                console.error('Error: search.component.ts basicSearch() failed');
            }
        );
    }

    advancedSearch() {
        var advancedQuery = {'Compound Name':[] as string[], 'XRPD':[] as string[], 'Solvent Exact': [[]] as [string[]], 'Solvent Contains': [] as string[]}
        for (let i = 0; i < this.filters.length; i++) {
            var mainSelection = this.filters[i].controls.mainControl.value;
            switch (mainSelection) {
                case 'Compound Name':
                    const tempName: string = this.filters[i].controls.compoundNameControl.value;
                    advancedQuery['Compound Name'].push(tempName);
                    break;
                case 'XRPD':
                    const tempXRPD: string = this.filters[i].controls.xrpdControl.value;
                    advancedQuery['XRPD'].push(tempXRPD);
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
                            advancedQuery['Solvent Exact'].push(tempList);
                            break;
                        case 'has any data on':
                            var tempControls = this.filters[i].controls.solventAnyDataControl;
                            for (let j = 0; j < tempControls.length; j++) {
                                advancedQuery['Solvent Contains'].push(tempControls[j].value);
                            }
                            break;
                    }
                break;
            }
        }
        // console.log(advancedQuery);
        this.flaskConnectionService.advancedSearch(advancedQuery).subscribe (
            (response) => {
                console.log(response);
            },
            (error) => {
                console.log('Error search.component.ts: advancedSearch');
            }
        );
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
}
