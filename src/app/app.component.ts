import { Component } from '@angular/core';
import { Person } from "../models/person";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(){
    var person = new Person();
    console.log(person);
  } 
}
