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

    public async GetPerson(){
        this.Person = await this.context.People.Select({ID:2});
    }
    public async GetPersonUser(){
        if (this.Person !== undefined){
            var user = await this.Person.Server.User;
            if (user instanceof STA.Data.Models.Person)
                this.User = user
        }            
    }
    public Log(item:any){
        console.log(item);
    }
}
