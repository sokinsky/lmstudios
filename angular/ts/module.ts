import { NgModule } from "@angular/core";
import { control, controls } from "./";

@NgModule({
    declarations:[
        control,
        controls.context, controls.repository, controls.model, controls.property
    ],
    exports:[
        control,
        controls.context, controls.repository, controls.model, controls.property
    ]
})
export class module{

}