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
        var data = {
            User:{
                Username:"sokinsky",
                Password:"musk4rat"
            }
        }
        this.Person = this.context.People.Add(data);
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
