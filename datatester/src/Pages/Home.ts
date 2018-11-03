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
    constructor(private context:Context) {

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
    }
    public async NewUser(){
        this.User = this.context.Users.Add({});
    }
}
