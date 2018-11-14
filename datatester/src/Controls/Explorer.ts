import { ContentChildren, AfterViewInit,  ViewContainerRef, ViewRef, Component, ElementRef, Inject, Input, Output, ViewChildren, EventEmitter, ViewChild, QueryList } from '@angular/core';
import * as LMStudios from "@lmstudios/data";
import { TreeView } from "./";

@Component({
	selector: 'explorer',
	templateUrl: './Explorer.html',
	styleUrls: ['./Explorer.css']
})
export class Explorer implements AfterViewInit {
    constructor() { }  
    ngAfterViewInit() {
    }
    @ViewChild("view") public View?:TreeView;

	@Input() public context?: LMStudios.Context;
	public selectedRequest?: LMStudios.Request;

	public get repositories(): LMStudios.Repository<LMStudios.Model>[] {
		var result: LMStudios.Repository<LMStudios.Model>[] = [];
		if (this.context !== undefined) {
			this.context.GetType().GetProperties().forEach(property => {
				if (property.Type.IsSubTypeOf(LMStudios.Repository)) {
					var repository = property.GetValue(this.context);
					if (repository === undefined)
						throw new Error(``);
					result.push(repository);
				}
			})
		}
		return result;
	}
	public selectedRepository?: LMStudios.Repository<LMStudios.Model>;
	public selectRepository(repository: LMStudios.Repository<LMStudios.Model>) {
		this.selectedRepository = repository;
		if (this.View !== undefined) {
			this.View.parentItem = undefined;
			this.View.selectedItem = repository;
		}			
	}

	public toJson(item: any): string | undefined {
		return JSON.stringify(item, null, 2);
	}

	public Log(item: any) {
		console.log(item);
	}
	public SaveChanges() {
		if (this.context)
			this.context.SaveChanges();
	}
}