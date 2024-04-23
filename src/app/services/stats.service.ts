import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { flask_api_url } from '../config';
@Injectable({
  providedIn: 'root'
})
export class StatsService {

  constructor(private http: HttpClient) { }

  getData() {
    let url = flask_api_url + 'api/data';
    return this.http.get(url);
  }

}
