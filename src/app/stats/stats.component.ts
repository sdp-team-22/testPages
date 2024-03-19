import { Component, OnInit } from '@angular/core';
import { StatsService } from '../stats.service';
@Component({
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
})
export class StatsComponent {
  title = 'stats';
  data: any;
  db_storage: any;
  upload_history: any;
  daily_visits: any;
  monthly_visits: any;

  // flags to show/hide components
  showUploadHistory = false;
  showDailyVisits = false;
  showMonthlyVisits = false;

  constructor(private stats: StatsService) {
    this.stats.getData().subscribe((data: any) => {
      console.log(data)
      this.db_storage = data.db_storage; // change data1 to data1[0]-[1] if calling multiple elements 
      this.upload_history = data.upload_history.map((upload: any) => {
        return {
          id: upload[0],
          compound_name: upload[1],
          username: upload[2],
          time_uploaded: upload[3]
        }
      })
      this.daily_visits = data.daily_visits.map((dailyVisit: any) => {
        return {
          id: dailyVisit[1],
          username:  dailyVisit[2],
          daily_visited: dailyVisit[3]
        }
      })
      this.monthly_visits = data.monthly_visits.map((monthlyVisit: any) => {
        return {
          id: monthlyVisit[1],
          username: monthlyVisit[2],
          monthly_visited: monthlyVisit[3]
        }
      })
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