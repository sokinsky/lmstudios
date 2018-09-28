import { Component } from '@angular/core';
import * as STA from "../STA";
import {Application } from "../STA/Application";

@Component({
	selector: 'home',
	templateUrl: './home.html',
	styleUrls: ['./home.css']
})
export class Home {
	constructor(private app:Application) {		
  	}
	ngOnInit() {	
	}

	public Test() {
		var person = new STA.Data.Models.Person();
	}
}