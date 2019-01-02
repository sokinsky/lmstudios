import { NgModule, InjectionToken, APP_INITIALIZER, ApplicationModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule, ControlContainer } from '@angular/forms';
import { BrowserModule } from "@angular/platform-browser";
import { HttpModule } from "@angular/http";
import { RouterModule } from '@angular/router';

import { HttpClientModule } from '@angular/common/http';
import * as Pages from './Pages';
import * as Controls from "./Controls";

import { Context, ContextService } from "./STA/Data/Context";

export function schemaFactory(service:ContextService){
	return () => service.Initialize();
}

@NgModule({
	bootstrap: [Pages.Master],
	declarations: [
		Pages.Master, Pages.Home,
		Controls.ContextControl, Controls.RepositoryControl, Controls.ModelControl, Controls.PropertyControl,
		Controls.Properties.DataPropertyControl, Controls.Properties.ModelPropertyControl, Controls.Properties.CollectionPropertyControl
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
	]
})
export default class {
	constructor() { }
}

