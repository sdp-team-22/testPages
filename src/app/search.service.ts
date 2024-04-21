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

    grabConstrained(selected: string[]) {
        let url = 'http://127.0.0.1:5000/api/constrainFilter';
        return this.http.post(url, selected);
    }

    grabAllRestricted(selected: any) {
        let url = 'http://127.0.0.1:5000/api/grabAllRestricted';
        return this.http.post<string[]>(url, selected);
    }

    basicSearch(searchQuery: any) {
        let url = 'http://127.0.0.1:5000/api/basicSearch2';
        return this.http.post(url, { searchQuery });
    }

    advancedSearch(searchQuery: any) {
        let url = 'http://127.0.0.1:5000/api/advancedSearch2';
        return this.http.post(url, { searchQuery });
    }

    advancedSearchRestricted(searchQuery: any) {
        let url = 'http://127.0.0.1:5000/api/advancedSearchRestricted';
        return this.http.post(url, searchQuery);
    }

    deleteRow(item: any) {
        let url = 'http://127.0.0.1:5000/api/deleteRow';
        return this.http.post(url, { item });
    }

}