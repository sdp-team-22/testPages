import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class StatsService {

  constructor(private http: HttpClient) { }

  getData() {
    let url = 'https://sdpflaskv2.basicoverflow.com/api/data';
    return this.http.get(url);
  }

}
