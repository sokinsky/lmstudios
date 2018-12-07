import { Component, OnInit } from '@angular/core';
import { Context } from "../STA/Data/Context";
import { Models } from "../STA/Data";

@Component({
    selector: 'home',
    templateUrl: './Home.html',
    styleUrls: ['./Home.css'],
})
export class Home implements OnInit {
	constructor(private context: Context) {
    }
    public async ngOnInit(){
        //this.PersonEmail = await this.context.PeopleEmails.Select({ID:3})
        //this.Person = await this.context.People.Select({ID:2});
        // console.log(this.Person);
        // if (this.Person !== undefined)
        //     console.log(this.Person.User);
        var person = await this.context.People.Select({ID:2});
        console.log(person);
        if (person !== undefined)
            console.log(person.User);
    }

    public PersonEmail?:Models.PersonEmail;
    public User?:Models.User;
    public Person?:Models.Person;

    public async Test(){
    }
    public Log(item:any){
        console.log(item);
    }
    public async SaveChanges(){
    }
	public async NewPerson() {
    }
    public async NewUser(){
    }
}
