import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { Module as LMSModule } from '../../projects/data-angular-controls/src/lib/module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    LMSModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
