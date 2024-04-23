import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { flask_api_url } from './config';
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
      this.http.post(flask_api_url + 'api/updateVisits', {}).subscribe(
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
