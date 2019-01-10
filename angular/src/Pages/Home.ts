import { Component, OnInit } from '@angular/core';
import { Context } from "../STA/Data/Context";

@Component({
	selector: 'home-page',
	templateUrl: './Home.html',
	styleUrls: ['./Home.css'],
})
export class Home implements OnInit {
	constructor(private context:Context) {
	}
	public async ngOnInit() {
	}
}
