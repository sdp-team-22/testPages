import { Component, OnInit } from '@angular/core';
import { StatsService } from '../stats.service';
@Component({
  templateUrl: './stats.component.html',
})
export class StatsComponent {
  title = 'stats';
  data1: any;
  dbStorage: any;
  tableCount: any;
  constructor(private stats: StatsService) {
    this.stats.getDbStorage().subscribe((data1: any) => {
      console.log(data1)
      this.dbStorage = data1[0];
      this.tableCount = data1[1];
    })
  }

 
  
  //implements OnInit{
  // dbStorage: any;
  // constructor(private statisticsService: StatisticsService) {}
  // ngOnInit(): void {
  //   this.statisticsService.getDbStorage().subscribe((data: any) => {
  //     this.dbStorage = data;
  //   });
  }
