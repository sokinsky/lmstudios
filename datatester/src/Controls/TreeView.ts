import { ContentChildren, AfterViewInit,  ViewContainerRef, ViewRef, Component, ElementRef, Inject, Input, Output, ViewChildren, EventEmitter, ViewChild, QueryList } from '@angular/core';
import * as LMStudios from "@lmstudios/data";
import { TreeNode } from ".";

@Component({
	selector: 'treeview',
	templateUrl: './TreeView.html',
	styleUrls: ['./TreeView.css']
})
export class TreeView {
    constructor() { }  
	@Input() public selectedItem?:LMStudios.Model|LMStudios.Repository<LMStudios.Model>|LMStudios.SubRepository<LMStudios.Model>|undefined;
	public returnItem:LMStudios.Model|LMStudios.Repository<LMStudios.Model>|LMStudios.SubRepository<LMStudios.Model>|undefined;
	public selectItem(item: any) {
		if (item instanceof LMStudios.Model) {
			var itemType:LMStudios.Meta.Type = item.GetType();
			if (this.returnItem instanceof LMStudios.Model) {
				var returnType = this.returnItem.GetType();
				var returnProperty = returnType.GetProperties().find(x => {
					return x.Type === itemType;
				})
				if (returnProperty !== undefined)
					returnProperty.SetValue(this.returnItem, item);
				this.selectedItem = this.returnItem;
				this.returnItem = undefined;
				return;
			}
		}
		
		this.returnItem = undefined;
		
	}

	public get selectedItemType():string|undefined{
		if (this.selectedItem !== undefined){
			if (this.selectedItem instanceof LMStudios.Model)
				return "Model";
			if (this.selectedItem instanceof LMStudios.Repository)
				return "Repository";
			if (this.selectedItem instanceof LMStudios.SubRepository )
				return "SubRepository";
		}
		return undefined;
	}
	public get Items():LMStudios.Model[]|undefined{
		switch (this.selectedItemType){
			case "Model":
				return undefined;
			case "Repository":
				if (this.selectedItem != undefined)
					return (<LMStudios.Repository<LMStudios.Model>>this.selectedItem).Items;
				return undefined;	
			case "SubRepository":
				if (this.selectedItem !== undefined)
					return (<LMStudios.Repository<LMStudios.Model>>this.selectedItem).Items;
				return undefined;
		}
		return undefined;
	}
	public get Properties():LMStudios.Meta.Property[]|undefined{
		if (this.selectedItemType !== undefined){
			switch (this.selectedItemType){
				case "Model":
					return (<LMStudios.Model>this.selectedItem).GetType().GetProperties();
				case "Repository":
					return (<LMStudios.Repository<LMStudios.Model>>this.selectedItem).Type.GetProperties();
				case "SubRepository":
					return (<LMStudios.SubRepository<LMStudios.Model>>this.selectedItem).Parent.GetType().GetProperties();
			}
		}
		return undefined;
	}

	public propertyType(property:LMStudios.Meta.Property):string{
		if (property.Type.IsSubTypeOf(LMStudios.Model))
			return "Model";
		if (property.Type.IsSubTypeOf(LMStudios.SubRepository) || property.Type === LMStudios.Meta.Type.GetType(LMStudios.SubRepository))
			return "SubRepository";
		return "any";
	}
	
	public Log(node:TreeNode){
		console.log(node);
	}
	public toJson(property:LMStudios.Meta.Property):string|undefined{
		var value = property.GetValue(this.selectedItem);
		if (value !== undefined)
			return JSON.stringify(value.Controller.Values.Actual.Data, null, 2);
		return undefined;
	}
	public selectModel(property:LMStudios.Meta.Property){
		if (this.selectedItem !== undefined){
			if (this.selectedItem instanceof LMStudios.Model) {
				this.returnItem = this.selectedItem;
				this.selectedItem = this.selectedItem.Context.GetRepository(property.Type);
			}				
			this.selectedItem = this.selectedItem
		}		
	}
	public createModel(property:LMStudios.Meta.Property){
		if (this.selectedItem !== undefined){
			if (this.selectedItem instanceof LMStudios.Model){
				var childModel = this.selectedItem.Context.GetRepository(property.Type).Add();
				property.SetValue(this.selectedItem, childModel);
				this.selectedItem = childModel;
			}				
			if (this.selectedItem instanceof LMStudios.Repository)
				this.selectedItem = this.selectedItem.Add();
		}		
	}
	public search(value:string){
		if (this.selectedItem instanceof LMStudios.Repository)
			this.selectedItem.Search(value)
	}

}