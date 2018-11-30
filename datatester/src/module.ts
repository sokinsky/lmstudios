import { NgModule, InjectionToken } from '@angular/core';
import { FormsModule, ReactiveFormsModule, ControlContainer } from '@angular/forms';
import { BrowserModule } from "@angular/platform-browser";
import { HttpModule } from "@angular/http";
import { RouterModule } from '@angular/router';

import { HttpClientModule } from '@angular/common/http';
import * as Pages from './pages';
import { getSchema } from "@lmstudios/data"

export let schema;
export const schemaToken = new InjectionToken("");
export const schemaPromise = getSchema("").then(response=>{
	schema = response.Result.Schema;
});

@NgModule({
	bootstrap: [Pages.Master],
	declarations: [
		Pages.Master, Pages.Home,
	],
    imports: [
		BrowserModule,
		HttpModule, HttpClientModule,
		FormsModule,
		ReactiveFormsModule,
		RouterModule.forRoot([
			{ path: '', redirectTo: 'home', pathMatch: 'full' },
			{ path: 'home', component: Pages.Home }
		],
		{ useHash: true }),
	],
	providers: [ {provide:schemaToken, useFactory:()=>schema} ]
})
export default class {
	constructor() { }
}

