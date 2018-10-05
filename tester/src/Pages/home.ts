import { Component } from '@angular/core';
import * as STA from "../STA";
import { Meta } from "@lmstudios/entity";

@Component({
	selector: 'home',
	templateUrl: './home.html',
	styleUrls: ['./home.css']
})
export class Home {
	constructor(private context:STA.Data.Context) {	
		this.Load();
  	}
	ngOnInit() {	
	}
	public Person:STA.Data.Models.Person|undefined;
	public async Load(){
		this.Person = await this.context.People.Select(1);
	}

	public async Save(){
		var response = await this.context.SaveChanges();
		console.log(response);
	}
	public Log(item:any){
		console.log(item);
	}
	public Test(item:any){
		switch(item.GetType().Name){
			case "User":
				console.log(item.Controller.Values.Original);
				console.log(item.Controller.Write());
				break;
		}
	}
}