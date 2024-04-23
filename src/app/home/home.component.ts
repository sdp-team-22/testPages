import { Component } from '@angular/core';

@Component({
    selector: 'home-root',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
  })
export class HomeComponent {
    title = 'SDPAngular';
    handleInputDataClick(): void {
        // Implement logic for Input Data button click
        console.log('Input Data button clicked!');
    }

    handleViewDataClick(): void {
        // Implement logic for View Data button click
        console.log('View Data button clicked!');
    }

    handleStatisticsClick(): void {
        // Implement logic for Statistics button click
        console.log('Statistics button clicked!');
    }
}


