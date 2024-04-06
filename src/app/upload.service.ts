import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(private http: HttpClient) { }

  uploadData(data:any) {
    let url = 'https://sdpflaskv2.basicoverflow.com/api/upload';
    return this.http.post(url, data);
  }

  testGet() {
    let url = 'https://sdpflaskv2.basicoverflow.com/api/upload';
    return this.http.get(url);
  }

}