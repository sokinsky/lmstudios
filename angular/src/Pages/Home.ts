import { Component, OnInit } from '@angular/core';
import { Type } from "@lmstudios/types";
import { Context } from '../STA/Data/Context';
import { Email } from '../STA/Data/Models';

@Component({
    selector: 'home',
    templateUrl: './Home.html',
    styleUrls: ['./Home.css'],
})
export class Home {
	constructor(private context: Context) {
        var email = new Email(context);
        console.log(email.GetType().IsSubTypeOf("LMS.Data.Model"));
        console.log(Type.GetTypes());
    }
}
