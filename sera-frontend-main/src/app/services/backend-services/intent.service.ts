import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { enviroment } from "../../config/enviroment";
import { Observable } from "rxjs";
import { IntentRequest, IntentResponse } from "../../models/intent.model";

@Injectable({
    providedIn: 'root'
})
export class IntentService {
    constructor(private http: HttpClient) { }
    detectIntent(text: string): Observable<IntentResponse> {

        const payload: IntentRequest = {
            text: text
        };

        return this.http.post<IntentResponse>(
            `${enviroment.backendUrl}/detect-intent`,
            payload
        );
    }
}
