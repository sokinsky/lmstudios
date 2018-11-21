import { Component, OnInit } from '@angular/core';
import { Context } from "../STA/Data/Context";
import { Models } from "../STA/Data";
import { Meta } from "@lmstudios/data";

@Component({
    selector: 'home',
    templateUrl: './Home.html',
    styleUrls: ['./Home.css'],
})
export class Home implements OnInit {
	constructor(private context: Context) {
		console.log(Meta.Type.GetTypes());
    }
    public async ngOnInit(){
        //this.User = this.context.Users.Add({Username:"sokinsky", Password:"musk4rat"});
    }

    public User?:Models.User;
    public Person?:Models.Person;

    public async Test(){
    }
    public Log(item:any){
        console.log(item);
    }
    public async SaveChanges(){
        console.log(this.context.ChangeTracker.Changes);
        console.log(this.context.ChangeTracker.GetBridgeChanges());
        console.log(await this.context.SaveChanges());
    }
	public async NewPerson() {
		console.log(this.context.People.Local.Search({ ID: 1 }));
		console.log(this.context.People.Local.Select({ ID: 1 }));
		//var result = this.context.PeopleEmails.Add({ ID: 1, Person: 1, Email: 1 })
		//console.log(result);
    }
    public async NewUser(){
        this.User = this.context.Users.Add();
    }
}
