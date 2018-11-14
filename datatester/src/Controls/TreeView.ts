import { ContentChildren, AfterViewInit,  ViewContainerRef, ViewRef, Component, ElementRef, Inject, Input, Output, ViewChildren, EventEmitter, ViewChild, QueryList } from '@angular/core';
import * as LMStudios from "@lmstudios/data";
import { Model, Repository, SubRepository } from '@lmstudios/data';
import { identifierModuleUrl } from '../../node_modules/@angular/compiler';

@Component({
	selector: 'treeview',
	templateUrl: './TreeView.html',
	styleUrls: ['./TreeView.css']
})
export class TreeView {
	constructor() { }  
	public parentItem?: LMStudios.Model;
	public selectedItem?:LMStudios.Model|LMStudios.Repository<LMStudios.Model>|LMStudios.SubRepository<LMStudios.Model>|undefined;

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
	public get Properties(): LMStudios.Meta.Property[] | undefined{
		var result: LMStudios.Meta.Property[] = [];
		if (this.selectedItemType !== undefined){
			switch (this.selectedItemType){
				case "Model":
					return (<LMStudios.Model>this.selectedItem).GetType().GetProperties();
				case "Repository":
					result = (<LMStudios.Repository<LMStudios.Model>>this.selectedItem).Type.GetProperties();
					break;
				case "SubRepository":
					result = (<LMStudios.SubRepository<LMStudios.Model>>this.selectedItem).Parent.GetType().GetProperties();
					break;
			}
		}
		result = result.filter(property => {
			return !((property.Type.IsSubTypeOf(LMStudios.Model) || property.Type.IsSubTypeOf(LMStudios.SubRepository) || property.Type == LMStudios.Meta.Type.GetType(LMStudios.SubRepository)));
		})
		return result;
	}

	public propertyType(property:LMStudios.Meta.Property):string{
		if (property.Type.IsSubTypeOf(LMStudios.Model))
			return "Model";
		if (property.Type.IsSubTypeOf(LMStudios.SubRepository) || property.Type === LMStudios.Meta.Type.GetType(LMStudios.SubRepository))
			return "SubRepository";
		return "any";
	}

	
	public Log(node:any){
		console.log(node);
	}
	public toJson(property:LMStudios.Meta.Property):string|undefined{
		var value = property.GetValue(this.selectedItem);
		if (value !== undefined) {
			if (value instanceof LMStudios.Model) {
				return JSON.stringify(value.Controller.Values.Actual.Data, null, 2);
			}
			else if (value instanceof LMStudios.SubRepository) {
				return JSON.stringify(value.Items, null, 2);
			}
		}

			
		return undefined;
	}
	public selectModel(property:LMStudios.Meta.Property){
		if (this.selectedItem !== undefined){
			if (this.selectedItem instanceof LMStudios.Model) {
				this.selectedItem = this.selectedItem.Context.GetRepository(property.Type);
			}				
			this.selectedItem = this.selectedItem
		}		
	}

	public addModel(property: LMStudios.Meta.Property) {
		if (this.selectedItem !== undefined){
			if (this.selectedItem instanceof LMStudios.Model) {
				this.parentItem = this.selectedItem;
				this.selectedItem = this.selectedItem.Context.GetRepository(property.Type);
				console.log(this.selectedItemType);
			}
			else if (this.selectedItem instanceof LMStudios.Repository) {
				this.selectedItem = this.selectedItem.Add();
				console.log(this.selectedItem);
				if (this.parentItem !== undefined) {
					var parentProperty = this.selectedItem.GetType().GetProperties().find(property => {
						if (this.parentItem !== undefined)
							return property.Type === this.parentItem.GetType();
						return false;
					});
					console.log(parentProperty);
					if (parentProperty !== undefined) {
						parentProperty.SetValue(this.selectedItem, this.parentItem);
					}
				}
			}
				
		}		
	}
	public search(value:string){
		if (this.selectedItem instanceof LMStudios.Repository)
			this.selectedItem.Search(value)
	}

}