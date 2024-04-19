import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'SDPAngular';
  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
      // Flask endpoint request to update visits
      this.http.post('http://127.0.0.1:5000/api/updateVisits', {}).subscribe(
        (response) => {
          // console.log('Visit count incremented successfully');
        },
        (error) => {
          console.error('Error incrementing visit count:', error);
        }
      );
  }

  handleInputDataClick(): void {
    // Navigate to the "/upload" route
    this.router.navigate(['/upload']);
  }

  handleViewDataClick(): void {
    // Navigate to the "/edit" route
    this.router.navigate(['/edit']);
  }

  handleStatisticsClick(): void {
    // Navigate to the "/view" route
    this.router.navigate(['/view']);
  }

  handleStatsClick(): void {
    // Navigate to the "/stats" route
    this.router.navigate(['/stats']);
  }

  handleSearchClick(): void {
    // Navigate to the "/stats" route
    this.router.navigate(['/search']);
  }
  
}
