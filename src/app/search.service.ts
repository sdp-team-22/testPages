import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { flask_api_url } from './config';
@Injectable({
    providedIn: 'root'
})
export class SearchService {

    constructor(private http: HttpClient) { }

    grabAllCompounds() {
        let url = flask_api_url + 'grabAllCompounds';
        return this.http.get<string[]>(url);
    }

    grabAllXRPD() {
        let url = flask_api_url + 'grabAllXRPD';
        return this.http.get<string[]>(url);
    }

    grabAllSolvents() {
        let url = flask_api_url + 'grabAllSolvents';
        return this.http.get<string[]>(url);
    }

    grabConstrained(selected: string[]) {
        let url = flask_api_url + 'constrainFilter';
        return this.http.post(url, selected);
    }

    grabAllRestricted(selected: any) {
        let url = flask_api_url + 'grabAllRestricted';
        return this.http.post<string[]>(url, selected);
    }

    basicSearch(searchQuery: any) {
        let url = flask_api_url + 'basicSearch2';
        return this.http.post(url, { searchQuery });
    }

    advancedSearch(searchQuery: any) {
        let url = flask_api_url + 'advancedSearch2';
        return this.http.post(url, { searchQuery });
    }

    advancedSearchRestricted(searchQuery: any) {
        let url = flask_api_url + 'advancedSearchRestricted';
        return this.http.post(url, searchQuery);
    }

    deleteRow(item: any) {
        let url = flask_api_url + 'deleteRow';
        return this.http.post(url, { item });
    }

}