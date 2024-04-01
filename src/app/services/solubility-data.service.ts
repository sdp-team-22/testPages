import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private responseDataSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public responseData$: Observable<any> = this.responseDataSubject.asObservable();

  constructor(private http: HttpClient) {}

  setResponseData(response: any) {
    this.responseDataSubject.next(response);
  }

  sendDataToBackend(dataToSend : any){
    let url = 'http://127.0.0.1:5000/api/db_upload';
    return this.http.post(url, dataToSend);
  }
}
