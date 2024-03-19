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
  projectName!: string;
  scientistName!: string;
  compoundName!: string;
  solidForm!: string;
  Tmelt!: number;
  Hfus!: number;
  columnsSchema = SolubilityDataColumns; // Directly use SolubilityDataColumns
  displayedColumns: string[] = SolubilityDataColumns.map(col => col.key);
  dataSource = new MatTableDataSource<SolubilityData>();

  constructor(private solubilityDataService: SolubilityDataService) {}

  ngOnInit() {
    this.solubilityDataService.getSolubilityData().subscribe((res: any) =>{
        this.projectName = res['Project Name'];
        this.scientistName = res['Scientist Name'];
        this.compoundName = res['Compound Name'];
        this.solidForm = res['Solid Form'];
        this.Tmelt = res['Tmelt'];
        this.Hfus = res['Hfus'];
        this.dataSource.data = res["Row Data"];
    });
  }
}