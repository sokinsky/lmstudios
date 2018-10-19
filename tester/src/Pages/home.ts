import { Component } from '@angular/core';
import * as STA from "../STA";
import { Meta } from "@lmstudios/entity";

@Component({
	selector: 'home',
	templateUrl: './home.html',
	styleUrls: ['./home.css']
})
export class Home {
	constructor(private context:STA.Data.Context) {	}
	async ngOnInit() {	
		var personEmail = this.context.Emails.Add({Address:"steve"});
		console.log(this.context.ChangeTracker.Changes);
		var response = await this.context.SaveChanges();
		console.log(response);
		
	}
	public User:STA.Data.Models.User|undefined;
	public Person:STA.Data.Models.Person|undefined;
	public async Load(){
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
	public Run(){
		if (this.Person){
			this.Person.FirstName = "steve";
			console.log(this.Person.User);
		}

	}
}