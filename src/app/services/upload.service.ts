import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { flask_api_url } from '../config';
@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(private http: HttpClient) { }

  uploadData(data:any) {
    let url = flask_api_url + 'api/upload';
    return this.http.post(url, data);
  }

  testGet() {
    let url = flask_api_url + 'api/upload';
    return this.http.get(url);
  }

}