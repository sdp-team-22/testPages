import { Component, OnInit } from '@angular/core';
import { StatsService } from '../stats.service';
@Component({
  templateUrl: './stats.component.html',
})
export class StatsComponent {
  title = 'stats';
  data: any;
  constructor(private stats: StatsService) {
    this.stats.getDbStorage().subscribe((data: any) => {
      console.log(data)
      this.data = data;
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
