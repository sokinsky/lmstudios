import { NgModule, InjectionToken, APP_INITIALIZER, ApplicationModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule, ControlContainer } from '@angular/forms';
import { BrowserModule } from "@angular/platform-browser";
import { HttpModule } from "@angular/http";
import { RouterModule } from '@angular/router';

import { HttpClientModule } from '@angular/common/http';
import * as Pages from './Pages';
import { Module as LMSDataControlModule } from "./data/controls/Module";

@NgModule({
	bootstrap: [Pages.Master],
	declarations: [
		Pages.Master, Pages.Home
	],
	imports: [
		LMSDataControlModule,
		BrowserModule,
		HttpModule, HttpClientModule,
		FormsModule,
		ReactiveFormsModule,
		RouterModule.forRoot([
			{ path: '', redirectTo: 'home-page', pathMatch: 'full' },
			{ path: 'home-page', component: Pages.Home }
		],
			{ useHash: true }),
	],

	providers: []
})
export default class {
	constructor() { }
}

