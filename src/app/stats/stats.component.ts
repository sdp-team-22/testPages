import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { StatsService } from '../services/stats.service';
@Component({
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
  providers: [DatePipe]
})
export class StatsComponent {
  title = 'stats';
  data: any;
  data_points: any;
  upload_history: any;
  daily_visits: any;
  monthly_visits: any;
  myDate = new Date();

  // flags to show/hide components
  showUploadHistory = false;
  showDailyVisits = false;
  showMonthlyVisits = false;


  constructor(private stats: StatsService, public datePipe: DatePipe) {
    let date = this.datePipe.transform(this.myDate, 'yyyy-MM-dd');
    this.stats.getData().subscribe((data: any) => {
      // console.log(data)
      this.data_points = data.data_points; // change data1 to data1[0]-[1] if calling multiple elements
      this.upload_history = data.upload_history.map((upload: any) => {
        return {
          id: upload[0],
          scientist: upload[1],
          time_uploaded: upload[2],
          file_name: upload[3],
          compound_name: upload[4],
        }
      })

      this.daily_visits = data.daily_visits;
      this.monthly_visits = data.monthly_visits;
    })
  }
toggleUploadHistory(event: Event) {
    event.preventDefault();
    this.showUploadHistory = !this.showUploadHistory;
    this.showDailyVisits = false;
    this.showMonthlyVisits = false;
  }

  toggleDailyVisits(event: Event) {
    event.preventDefault();
    this.showDailyVisits = !this.showDailyVisits;
    this.showUploadHistory = false;
    this.showMonthlyVisits = false;
  }
  toggleMonthlyVisits(event: Event) {
    event.preventDefault();
    this.showMonthlyVisits = !this.showMonthlyVisits;
    this.showUploadHistory = false;
    this.showDailyVisits = false;
  }
}