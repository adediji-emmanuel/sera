import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { enviroment } from "../config/enviroment";
import { Command } from "../enums/command.enum";

@Injectable({
    providedIn: 'root'
})
export class CommandService {
    constructor() { }


    executeCommand(intent: string) {
        switch (intent) {
            case Command.OPEN_APP:

                break;

            default:
                break;
        }
    }

}
