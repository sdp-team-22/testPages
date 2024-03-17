import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class StatsService {

  constructor(private http: HttpClient) { }

  getData() {
    let url = 'http://127.0.0.1:5000/api/data';
    return this.http.get(url);
  }

}
