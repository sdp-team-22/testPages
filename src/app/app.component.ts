import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'SDPAngular';
  constructor(private router: Router) {}
  data = []

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
  
}
