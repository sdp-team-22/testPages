import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SolubilityData, SolubilityDataColumns } from '../model/solubilitydata'; // Import SolubilityDataColumns from the same file
import { DataService } from '../services/solubility-data.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';


@Component({
  selector: 'table-root',
  styleUrls: ['./table.component.scss'],
  templateUrl: 'table.component.html',
})
export class TableComponent implements OnInit  {
  tablesData: { 
    projectInfo: { 
      fileName: string,
      projectName: string, 
      scientistName: string, 
      molecularWeight: string,
      compoundName: string, 
      solidForm: string, 
      Tmelt: number, 
      Hfus: number 
    }, 
    columnsSchema: any[], 
    displayedColumns: string[], 
    dataSource: MatTableDataSource<SolubilityData> 
  }[] = [];

  private subscription: Subscription | undefined;

  constructor(private dataService: DataService, private router : Router ) {}

  ngOnInit() {
    this.subscription = this.dataService.getResponseData(
    ).subscribe(response => {
      if (response != null) {
        for (const key in response) {
          console.log()
          const projectInfo = {
            fileName: response[key]['File Name'],
            projectName: response[key]['Project Name'],
            scientistName: response[key]['Scientist Name'],
            molecularWeight: response[key]['Molecular Weight'],
            compoundName: response[key]['Compound Name'],
            solidForm: response[key]['Solid Form'],
            Tmelt: response[key]['Tmelt'],
            Hfus: response[key]['Hfus'],
          };

          let columnsSchema = SolubilityDataColumns.slice();
          const keyMappings: { [key: string]: string } = {
            'SolvFrac1_wtfrac': 'SolvFrac1_volfrac',
            'SolvFrac2_wtfrac': 'SolvFrac2_volfrac',
            'SolvFrac3_wtfrac': 'SolvFrac3_volfrac'
        };
        
        // Iterate over the keys in the response data
        for (const solvFracKey in keyMappings) {
            if (response[key]['Row Data'][0].hasOwnProperty(solvFracKey) &&
                response[key]['Row Data'][0][solvFracKey] !== null &&
                response[key]['Row Data'][0][solvFracKey] !== undefined) {
                columnsSchema = columnsSchema.map(col => {
                    if (col.key === keyMappings[solvFracKey]) {
                        return {
                            key: solvFracKey,
                            type: 'text',
                            label: `Solv Frac ${solvFracKey.substring(5, 6)} (solute-free) wt`,
                            required: true
                        };
                    }
                    return col;
                });
            }
        }
          const tableData = {
            projectInfo: projectInfo,
            //columnsSchema: SolubilityDataColumns,
            columnsSchema: columnsSchema,
            //displayedColumns: SolubilityDataColumns.map(col => col.key),
            displayedColumns: columnsSchema.map(col => col.key),
            dataSource: new MatTableDataSource<SolubilityData>()
          };
          tableData.dataSource.data = response[key]['Row Data'];
          // Loop through each element in dataSource data and replace NaN with ""
          tableData.dataSource.data.forEach((row: any) => {
          for (let key in row) {
            if (row[key] == 'nan') {
              row[key] = ""; 
            }
          }
        });
          this.tablesData.push(tableData);
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  statusCheck(status: any): string {
    return status === 'OK' ? 'green-row' : 'red-row';
  }

  deleteTable(index: number): void {
    this.tablesData.splice(index, 1); 
  }

  submitTables(): void {
    // Check if all tables are valid
    if (this.tablesData.every(table => this.validateTable(table))) {
      // Prepare data to send

      const dataToSend = this.tablesData.map(table => ({
        projectInfo: table.projectInfo,
        rowData: table.dataSource.data.map((row: any) => {
          const newRow = { ...row };
          for (let key in newRow) {
            if (newRow[key] === '') {
              newRow[key] = 'nan'; // Map empty string to 'nan'
            }
          }
          return newRow;
        })
      }));

      // Send data to backend
      this.dataService.sendDataToBackend(dataToSend)
      .subscribe({
        next: response => {
          console.log('Data sent successfully:', response);
          this.router.navigateByUrl('');
        },
        error: error => {
          console.error('Error sending data:', error);
        }
      });
    }
     else {
      console.error('Some tables are not valid.');
      alert('Some tables are not valid.');
    }
  }

  // Validate if table data has a valid status
  validateTable(table: any): boolean {
    return table.dataSource.data.every((row : any) => row.Status === 'OK');
  }
}