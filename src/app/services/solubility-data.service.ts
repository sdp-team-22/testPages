import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SolubilityData } from '../model/solubilitydata';

@Injectable({
  providedIn: 'root'
})
export class SolubilityDataService {
  private serviceUrl = 'assets/data.json';
  
  constructor(private http: HttpClient) { }

  getSolubilityData(): Observable<SolubilityData[]> {
    return this.http
      .get<SolubilityData[]>(this.serviceUrl); // Specify the type of response expected
  }
}
