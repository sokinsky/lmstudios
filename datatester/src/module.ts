import { NgModule, InjectionToken, APP_INITIALIZER, ApplicationModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule, ControlContainer } from '@angular/forms';
import { BrowserModule } from "@angular/platform-browser";
import { HttpModule } from "@angular/http";
import { RouterModule } from '@angular/router';

import { HttpClientModule } from '@angular/common/http';
import * as Pages from './pages';
import { Context, ContextService } from "./STA/Data/Context";

export function schemaFactory(service:ContextService){
	return () => service.Initialize();
}

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
	providers: [
		ContextService, { provide: APP_INITIALIZER, useFactory:schemaFactory, deps:[ContextService], multi:true}
		//Context, { provide:APP_INITIALIZER,useFactory:(url:string, ...paths:string[])=>{return Schema.Context.GetSchema(appSettings.apiUrl, "Context", "Initialize")}, multi:true }
		//appLoader, { provide:APP_INITIALIZER,useFactory: (appLoader:appLoader)=>{return appLoader.Initialize()}, deps: [appLoader], multi:true}
	]
})
export default class {
	constructor() { }
}

