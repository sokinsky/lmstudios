import { ContentChildren, AfterViewInit,  ViewContainerRef, ViewRef, Component, ElementRef, Inject, Input, Output, ViewChildren, EventEmitter, ViewChild, QueryList } from '@angular/core';
import * as LMS from "@lmstudios/entity";
import * as Controls from "./";

@Component({
	selector: 'ctlRepository',
	templateUrl: './Repository.html',
	styleUrls: ['./Repository.css']
})
export class Repository {
	constructor() { }  

	// @ViewChildren(Controls.Model) items?:QueryList<Controls.Model>;
	// ngAfterViewInit() {
	// 	if (this.items !== undefined){
	// 	}
	//   }

    // private __parent:Controls.Model|Controls.Context|undefined;
    // public get parent():Controls.Model|Controls.Context|undefined{
    //     return this.__parent;
    // }
    // @Input() public set parent(value:Controls.Model|Controls.Context|undefined){
	// 	this.__parent = value;
    // }

    // private __parentProperty:LMS.Meta.Property|undefined;
    // public get parentProperty():LMS.Meta.Property{
	// 	if (this.__parentProperty === undefined)
	// 		throw new Error("ctlRepository's parentProperty is undefined");
    //     return this.__parentProperty            
    // }
    // @Input() public set parentProperty(value:LMS.Meta.Property){
    //     this.__parentProperty = value;
	// }

	// private __value:LMS.Repository<LMS.Model>|undefined;
    // public get value():LMS.Repository<LMS.Model>|undefined{
    //     return this.__value;
    // }
    // @Input() public set value(value:LMS.Repository<LMS.Model>|undefined){
    //     this.__value = value;
	// }

	// private __selected:boolean = false;
	// public get selected():boolean{
	// 	return this.__selected;
	// }
	// public set selected(value:boolean){
	// 	this.__selected = value;
	// 	if (this.__selected){
	// 		this.select.emit(this);
	// 	}
	// }
	// @Output() public select:EventEmitter<Controls.Repository> = new EventEmitter();

	// private selectedModel:LMS.Model|undefined;

	// public get label():string{
	// 	var result:string = `${this.parentProperty.Name}`;
	// 	if (this.value){
	// 		result += `(${this.value.Items.length})`;
	// 	}
	// 	return result;
	// }
    // public selectedControl:Controls.Model|undefined;
    // public onSelect(control:Controls.Model){
	// 	console.log(control);
    //     if (this.selectedControl === undefined){
    //         this.selectedControl = control;
    //         return;
    //     }
    //     if (this.selectedControl !== control){
    //         this.selectedControl.selected = false;
    //         this.selectedControl = control;
    //     }
	// }
	
	// public toggle = {
    //     value:false,
    //     click:()=>{
	// 		if (! this.toggle.disabled())
	// 			this.toggle.value = !this.toggle.value;
	// 	},
	// 	disabled:()=>{			
	// 		var result =  (this.value && this.value.Items.length == 0);
	// 		return result;

	// 	}
	// }
	// public options = {
	// 	add:{
	// 		value:"",
	// 		toggle:{
	// 			value:false,
	// 			click:()=>{
	// 				this.options.add.toggle.value = !this.options.add.toggle.value;
	// 			}
	// 		},
	// 		actions:{
	// 			add:()=>{
	// 				var value = this.options.add.value;
	// 				try{
	// 					value = JSON.parse(this.options.add.value);
	// 					console.log(value);
	// 				}
	// 				catch{
	// 					value = this.options.add.value;
	// 				}
	// 				finally{
	// 					console.log(`add:${value}`);
	// 					if (this.value !== undefined){
	// 						this.value.Add(<Partial<LMS.Model>>value);
	// 					}
						
	// 				}
					

	// 			},
	// 			cancel:()=>{
	// 				this.options.add.value = "";
	// 			}		
	// 		}
	// 	},
    //     search:{
	// 		value:"",
    //         toggle:{
    //             value: false,
    //             click:()=>{
	// 				this.options.search.toggle.value = !this.options.search.toggle.value;
	// 				if (this.options.search.toggle.value){
	// 					for (var key in this.options){
	// 					}
	// 				}

                    
    //             }
    //         },
    //         actions:{
    //             search:async ()=>{
	// 				if (this.value !== undefined){
	// 					this.selectedModel = await this.value.Select(this.options.search.value);
	// 					this.options.search.toggle.value = false;
	// 					this.toggle.value = true;
	// 				}
	// 			},
    //             cancel:()=>{}
	// 		}
    //     }
    // }
}