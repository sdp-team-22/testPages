import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
    providedIn: 'root'
})
export class SearchService {

    constructor(private http: HttpClient) { }

    grabAllCompounds() {
        let url = 'http://127.0.0.1:5000/api/grabAllCompounds';
        return this.http.get<string[]>(url);
    }

    grabAllXRPD() {
        let url = 'http://127.0.0.1:5000/api/grabAllXRPD';
        return this.http.get<string[]>(url);
    }

    grabAllSolvents() {
        let url = 'http://127.0.0.1:5000/api/grabAllSolvents';
        return this.http.get<string[]>(url);
    }

    basicSearch(searchQuery: string) {
        let url = 'http://127.0.0.1:5000/api/basicSearch2';
        return this.http.post(url, { searchQuery });
    }

}