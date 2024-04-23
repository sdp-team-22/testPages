import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { flask_api_url } from '../config';
@Injectable({
    providedIn: 'root'
})
export class SearchService {

    constructor(private http: HttpClient) { }

    grabAllCompounds() {
        let url = flask_api_url + 'api/grabAllCompounds';
        return this.http.get<string[]>(url);
    }

    grabAllXRPD() {
        let url = flask_api_url + 'api/grabAllXRPD';
        return this.http.get<string[]>(url);
    }

    grabAllSolvents() {
        let url = flask_api_url + 'api/grabAllSolvents';
        return this.http.get<string[]>(url);
    }

    grabConstrained(selected: string[]) {
        let url = flask_api_url + 'api/constrainFilter';
        return this.http.post(url, selected);
    }

    grabAllRestricted(selected: any) {
        let url = flask_api_url + 'api/grabAllRestricted';
        return this.http.post<string[]>(url, selected);
    }

    basicSearch(searchQuery: any) {
        let url = flask_api_url + 'api/basicSearch';
        return this.http.post(url, { searchQuery });
    }

    advancedSearch(searchQuery: any) {
        let url = flask_api_url + 'api/advancedSearch';
        return this.http.post(url, { searchQuery });
    }

    advancedSearchRestricted(searchQuery: any) {
        let url = flask_api_url + 'api/advancedSearchRestricted';
        return this.http.post(url, searchQuery);
    }

    deleteRow(item: any) {
        let url = flask_api_url + 'api/deleteRow';
        return this.http.post(url, { item });
    }

}