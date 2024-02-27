import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SolubilityData, SolubilityDataColumns } from '../model/solubilitydata'; // Import SolubilityDataColumns from the same file
import { SolubilityDataService } from '../services/solubility-data.service';


@Component({
  selector: 'table-root',
  styleUrls: ['./table.component.scss'],
  templateUrl: 'table.component.html',
})
export class TableComponent implements OnInit {
  columnsSchema = SolubilityDataColumns; // Directly use SolubilityDataColumns
  displayedColumns: string[] = SolubilityDataColumns.map(col => col.key);
  dataSource = new MatTableDataSource<SolubilityData>();

  constructor(private solubilityDataService: SolubilityDataService) {}

  ngOnInit() {
    this.solubilityDataService.getSolubilityData().subscribe((res: any) =>{
        this.dataSource.data = res["Row Data"];
    });
  }
}
