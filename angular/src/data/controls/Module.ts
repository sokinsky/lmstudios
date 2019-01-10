import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule, ControlContainer } from '@angular/forms';
import { Context } from "./Context";

@NgModule({
    declarations:[ Context ],
    imports:[
        FormsModule
    ],
    exports:[ Context ]
})
export class Module {}