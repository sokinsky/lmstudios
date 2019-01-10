import { OnInit } from '@angular/core';
import { Context } from "../STA/Data/Context";
export declare class Home implements OnInit {
    private context;
    constructor(context: Context);
    ngOnInit(): Promise<void>;
}
