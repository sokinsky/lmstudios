import { Component, OnInit } from '@angular/core';
import { STA } from '..';

@Component({
    selector: 'home',
    templateUrl: './Home.html',
    styleUrls: ['./Home.css'],
})
export class Home implements OnInit {
	constructor(private context: STA.Data.Context) {
    }
    public async ngOnInit(){
    }

    public User?:STA.Data.Models.User;
    public Person?:STA.Data.Models.Person; 
    public PersonEmail?:STA.Data.Models.PersonEmail;

    public async GetPersonEmail(){
        this.PersonEmail = await this.context.PeopleEmails.Select({ID:1});
    }
    public async GetPerson(){
        this.Person = await this.context.People.Select({ID:2});
    }
    public async GetUser(){
        this.User = await this.context.Users.Select({ID:2});          
    }
    public Log(item:any){
        console.log(item);
    }
}
