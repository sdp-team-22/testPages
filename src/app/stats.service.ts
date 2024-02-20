import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class StatsService {

  constructor(private http: HttpClient) { }

  getDbStorage() {
    let url = 'http://127.0.0.1:5000/api/db_storage';
    return this.http.get(url);

  }
}
