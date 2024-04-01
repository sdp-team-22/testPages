import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SolubilityData, SolubilityDataColumns } from '../model/solubilitydata'; // Import SolubilityDataColumns from the same file
import { DataService } from '../services/solubility-data.service';
import { take } from 'rxjs/operators';


@Component({
  selector: 'table-root',
  styleUrls: ['./table.component.scss'],
  templateUrl: 'table.component.html',
})
export class TableComponent implements OnInit {
  tablesData: { 
    projectInfo: { 
      projectName: string, 
      scientistName: string, 
      compoundName: string, 
      solidForm: string, 
      Tmelt: number, 
      Hfus: number 
    }, 
    columnsSchema: any[], 
    displayedColumns: string[], 
    dataSource: MatTableDataSource<SolubilityData> 
  }[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.dataService.responseData$.pipe(
      take(1)
    ).subscribe(response => {
      if (response != null) {
        for (const key in response) {
          const projectInfo = {
            projectName: response[key]['Project Name'],
            scientistName: response[key]['Scientist Name'],
            compoundName: response[key]['Compound Name'],
            solidForm: response[key]['Solid Form'],
            Tmelt: response[key]['Tmelt'],
            Hfus: response[key]['Hfus'],
          };

          const tableData = {
            projectInfo: projectInfo,
            columnsSchema: SolubilityDataColumns,
            displayedColumns: SolubilityDataColumns.map(col => col.key),
            dataSource: new MatTableDataSource<SolubilityData>()
          };
          tableData.dataSource.data = response[key]['Row Data'];
          console.log(response[key]['Row Data'])
          this.tablesData.push(tableData);
        }
      }
    });
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
        rowData: table.dataSource.data
      }));

      // Send data to backend
      this.dataService.sendDataToBackend(dataToSend)
        .subscribe(
          response => {
            console.log('Data sent successfully:', response);
          },
          error => {
            console.error('Error sending data:', error);
          }
        );
    } else {
      console.error('Some tables are not valid.');
    }
  }

  // Validate if table data has a valid status
  validateTable(table: any): boolean {
    return table.dataSource.data.every((row : any) => row.Status === 'OK');
  }
}