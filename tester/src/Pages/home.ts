import { Component } from '@angular/core';
import * as Entity from "@lmstudios/entity";
import * as STA from "../STA";

@Component({
	selector: 'home',
	templateUrl: './home.html',
	styleUrls: ['./home.css']
})
export class Home {
	constructor() {
  	}
	ngOnInit() {	
	}

	public get Context():STA.Data.Context{
		let result:STA.Data.Context|undefined = <STA.Data.Context>STA.Application.Retrieve().Context;
		return result;
	}

	public Test() {
		console.log(this.Context.People);

		var person = this.Context.People.Select(4);
	}
}