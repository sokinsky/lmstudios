import { Guid } from "@lmstudios/utilities";
import { Type, Property, PropertyDecorator } from "@lmstudios/types";
import { Context } from "./Context";
import { Model } from "./Model";
import { ChangeStatus } from "./ChangeTracker";
import { ServerStatus } from "./ServerStatus";


export class Controller<TModel extends Model> {
	constructor(context:Context, model: TModel, modelProxy:TModel) {
		this.ID = Guid.Create().toString();
        this.Context = context;
        this.Model = model;
        this.ModelProxy = modelProxy;
		this.Values = {
			Local: {},
			Server: {},
			Pending: {}
		}
		this.Status = {
			Server: { Properties:{} },
			Change: { Model: ChangeStatus.Detached, Properties:{} }
		}
	}
	public ID:string;
    public Context:Context;
    public Model:TModel;
    public ModelProxy:TModel;
	public Values:{
		Local: Partial<TModel>,
		Server: Partial<TModel>,
		Pending: Partial<TModel>
	}
	public Status:{
		Server: { Model?:ServerStatus, Properties:{[name:string]:ServerStatus }},
		Change: { Model?:ChangeStatus, Properties:{[name:string]:ChangeStatus }}
	}
	public GetValue(value:string|Property):any{	
        var property:Property|undefined
        if (typeof(value)==="string")
            property = this.Model.GetType().GetProperty(<string>value);
        else if (value instanceof Property)
            property = value;
        if (property !== undefined){
            if (property.PropertyType.IsSubTypeOf("LMS.Data.Model"))
                return this.getModel(property);
            return property.GetValue(this.Model);
        }
        throw new Error(`Controller<Model>.GetValue() requires a Property`)
	}
	public async GetValueAsync(value:string|Property):Promise<any>{
        var property:Property|undefined
        if (typeof(value)==="string")
            property = this.Model.GetType().GetProperty(<string>value);
        else if (value instanceof Property)
            property = value;
        if (property !== undefined){
            if (property.PropertyType.IsSubTypeOf("LMS.Data.Model"))
                return this.getModelAsync(property);
            return property.GetValue(this.Model);
        }
        throw new Error(`Controller<Model>.GetValue() requires a Property`)
	}
	private getModel(value:string|Property):Model|undefined{	
        var property:Property|undefined
        if (typeof(value)==="string")
            property = this.Model.GetType().GetProperty(<string>value);
        else if (value instanceof Property)
            property = value;

        if (property instanceof Property){
            if (property.PropertyType.IsSubTypeOf("LMS.Data.Model")){
                var result = property.GetValue(this.Model);
                if (result === undefined){
                    var repository = this.Context.GetRepository(property.PropertyType);
                    result = repository.Local.Select(this.generateRelationshipFilter(property));
                    if (result === undefined){
                        if (this.Status.Server.Properties[property.Name] === undefined){
                            this.Status.Server.Properties[property.Name] = ServerStatus.Serving
                            this.getModelAsync(property).then(serverResult=>{
                                this.setModel(<Property>property, serverResult, true);
                            })
                        }
                    }
                }
                return result;
            }
            throw new Error(`Controller<Model>.getModel() requires a property that is of type 'LMS.Data.Model'`)
        }
        throw new Error(`Controller<Model>.GetValue() requires a Property`)
	}
	private async getModelAsync(value:string|Property):Promise<Model|undefined>{
        var property:Property|undefined
        if (typeof(value)==="string")
            property = this.Model.GetType().GetProperty(<string>value);
        else if (value instanceof Property)
            property = value;
        if (property !== undefined){
            var repository = this.Context.GetRepository(property.PropertyType);
            switch (this.Status.Server.Properties[property.Name]){
                case ServerStatus.Serving:
                    console.warn("Controller<Model>.getModelAsync() is already trying to server this model.")
                    break;
                default:
                    this.Status.Server.Properties[property.Name] = ServerStatus.Serving;
                    var result = await repository.Server.Select(this.generateRelationshipFilter(property));
                    this.setModel(property, result, true);
                    return result;
            }
        }
	}

	public SetValue(propertyValue:string|Property, value:any, fromServer?:boolean){				
        var property:Property|undefined
        if (typeof(propertyValue)==="string")
            property = this.Model.GetType().GetProperty(<string>propertyValue);
        else if (propertyValue instanceof Property)
            property = propertyValue;
        if (property instanceof Property){
            if (property.PropertyType.IsSubTypeOf("LMS.Data.Model"))
                this.setModel(property, value, fromServer);
            else if (property.PropertyType.IsSubTypeOf("LMS.Data.Collection")){
                if (property.GetValue(this.Model) === undefined){
                    value.Parent.Property = property;
                    property.SetValue(this.Model, value)
                }                    
            }
            else{
                if (fromServer){
                    this.Status.Server.Properties[property.Name] = ServerStatus.Served
                    property.SetValue(this.Values.Server, value);
                }
                switch (this.Status.Server.Properties[property.Name]){
                    case ServerStatus.Serving:
                        property.SetValue(this.Model, value);
                        property.SetValue(this.Values.Local, value);
                        property.SetValue(this.Values.Pending, value);                      
                        break;
                    case ServerStatus.Served:
                        property.SetValue(this.Model, value);
                        property.SetValue(this.Values.Local, value);
                        break;
                    default:
                        property.SetValue(this.Model, value);
                        property.SetValue(this.Values.Local, value);
                        break;
                }
            } 
            
            // Check for changes
            this.UpdateChangeStatus();
        }
	}

	private setModel(property:string|Property, value:Model|Partial<Model>|undefined, fromServer?:boolean){
        // var model:Model|undefined;
        // if (value !== undefined){
        //     if (value instanceof Model)
        //         model = value;
        //     else {

        //     }
        // }
        
        // var referenceProperty = this.getReferenceProperty(property);

		// if (value instanceof Model){
		// 	property.SetValue(this.Values.Actual.Model, value);
		// 	var keyValue = value.PrimaryKey;
		// 	if (keyValue === undefined)
		// 		keyValue = value.__controller.ID;
		// 	if (referenceProperty !== undefined){
		// 		referenceProperty.SetValue(this.Values.Actual.Model, keyValue);
		// 		referenceProperty.SetValue(this.Values.Actual.Data, keyValue);
		// 	}				
		// 	return;
		// }
		// else if (value === undefined){
		// 	if (referenceProperty === this.Schema.PrimaryKeyProperty){			
		// 		if (referenceProperty.Principal !== undefined){
		// 			console.warn("Unable to delete or remove the principal Property reference");
		// 			return;
		// 		}
		// 	}
		// 	else{
		// 		property.SetValue(this.Values.Actual.Model, value);
		// 		if (referenceProperty !== undefined){
		// 			referenceProperty.SetValue(this.Values.Actual.Model, value);
		// 			referenceProperty.SetValue(this.Values.Actual.Data, value)
		// 		}
		// 	}
		// 	return;
		// }
		// else{
		// 	var repository = this.Context.GetRepository(property.PropertyType);
			
		// }
		
	}

	public generateRelationshipFilter(value:string|Property):any {
        var property:Property|undefined
        if (typeof(value)==="string")
            property = this.Model.GetType().GetProperty(<string>value);
        else if (value instanceof Property)
            property = value;
        if (property instanceof Property){
            var schemaModel = this.Model.GetSchema();
            var schemaProperty = schemaModel.GetProperty(property.Name);
            if (schemaProperty !== undefined){
                if (schemaProperty.Relationship !== undefined){
                    var result = {};
                    for (let localName in schemaProperty.Relationship){
                        var foreignPropertySchema = schemaProperty.Relationship[localName];
                        var foreignModelSchema = foreignPropertySchema.Model;
                        var foreignProperty = foreignModelSchema.Type.GetProperty(foreignPropertySchema.Name);
                        if (foreignProperty !== undefined)
                            foreignProperty.SetValue(result, property.GetValue(this.Model))
                    }
                    return result;
                }
            }
        }
		throw new Error(``);
	}
	public Load(values: Partial<TModel>, fromServer?:boolean) {
		for (var key in values){
			var property:Property|undefined = this.Model.GetType().GetProperty(key);
			if (property !== undefined){
				var value = property.GetValue(values);				
				this.SetValue(property, value, fromServer);	
			}			
		}
		if (fromServer)
			this.Status.Server.Model = ServerStatus.Served;	
		this.UpdateChangeStatus(fromServer);	
	}
	public UpdateChangeStatus(fromServer?:boolean){
		if (this.Status.Change.Model === ChangeStatus.Detached)
			return;
		if (fromServer)
			this.Status.Change.Model = ChangeStatus.Unchanged;

		for (var property of this.Model.GetType().Properties){
			this.Status.Change.Properties[property.Name] = ChangeStatus.Unchanged;
			var serverValue = property.GetValue(this.Values.Server);
			var localValue = property.GetValue(this.Values.Local);
			if (serverValue === undefined){
				if (localValue !== undefined)
					this.Status.Change.Properties[property.Name] = ChangeStatus.Added;
			}
			else{
				if (localValue === undefined)
					this.Status.Change.Properties[property.Name] = ChangeStatus.Deleted;
				else if (localValue !== serverValue)
					this.Status.Change.Properties[property.Name] = ChangeStatus.Modified;
			}
		}
		if (this.Status.Change.Model !== ChangeStatus.Added && this.Status.Change.Model !== ChangeStatus.Deleted){
			this.Status.Change.Model = ChangeStatus.Unchanged;
			for (var key in this.Status.Change.Properties){
				if (this.Status.Change.Properties[key] !== ChangeStatus.Unchanged){
					this.Status.Change.Model = ChangeStatus.Modified;
					return;
				}							
			}
		}
	}
	public Undo(propertyValue?:string|Property){
        var property:Property|undefined
        if (typeof(propertyValue)==="string")
            property = this.Model.GetType().GetProperty(<string>propertyValue);
        else if (propertyValue instanceof Property)
            property = propertyValue;
        if (property instanceof Property){
			var serverValue = property.GetValue(this.Values.Server);
			this.SetValue(property, serverValue);
        }
        else if (property === undefined){
			for (var p of this.Model.GetType().Properties){
				this.Undo(p);
			}
        }
	}

	public toString():string{
		return this.Model.GetType().Name;
	}

	public async Duplicate():Promise<Model|undefined>{
		// var repository = this.Context.GetRepository(this.Schema);
		// var filters:{Server:boolean, Value:any}[] = [];
		// for (var key of this.Schema.AdditionalKeys){
		// 	var item = {Server:true, Value:{}};
		// 	for (var property of key.Properties){				
		// 		var value = property.GetValue(this.Values.Actual.Data);				
		// 		property.SetValue(item.Value, value);
		// 		if (typeof(value) !== property.PropertyType.Name)
		// 		item.Server = false;
		// 	}
		// 	filters.push(item);
		// }

		// var duplicates;
		// for (var filter of filters){
		// 	duplicates = repository.Local.Search(filter.Value);
		// 	if (duplicates.length > 0)
		// 		duplicates = duplicates.filter(x => { return x !== this.Values.Proxy; });
		// 	switch (duplicates.length){
		// 		case 0: 
		// 			break;
		// 		default:
		// 			return duplicates[0];
		// 	}
		// }
		// for (var filter of filters){
		// 	if (filter.Server){
		// 		duplicates = await repository.Server.Search(filter.Value);
		// 		if (duplicates.length > 0)
		// 			duplicates = duplicates.filter(x => { return x !== this.Values.Proxy; });
		// 		switch (duplicates.length){
		// 			case 0:
		// 				break;
		// 			default:
		// 				return duplicates[0];
		// 		}
		// 	}
		// }
		return undefined;
	
	}

	public Validate(property?:string|Property){
		// if (property === undefined){
		// 	this.Error = new LMS.Error();
		// 	this.Error.InnerErrors = {};
		// 	var properties = this.Schema.Properties.filter(x => { return x.Relationship === undefined});
		// 	for (var p of properties){
		// 		this.Validate(p);
		// 	}

			
		// 	if (this.Error !== undefined && this.Error.InnerErrors !== undefined && Object.keys(this.Error.InnerErrors).length === 0){
		// 		console.log(this.Error);
		// 		this.Error = undefined;				
		// 	}				
		// 	else{
		// 		this.Error.Message = "Invalid";
		// 		this.Error.Description = "See InnerErrors";
		// 		console.log(this.Error);
		// 	}
		// }
		// else{			
		// 	if (property === this.Schema.PrimaryKeyProperty)
		// 		return;
		// 	var value = property.GetValue(this.Actual.Model);
		// 	if (property.Required){
		// 		if (value === undefined){
		// 			if (this.Error === undefined)
		// 				this.Error = new LMS.Error();
		// 			if (this.Error.InnerErrors == undefined)
		// 				this.Error.InnerErrors = {};
		// 			this.Error.InnerErrors[property.Name] = {Message:"Required.", Description:`Please provide a value for ${property.Name}`};
		// 		}					
		// 	}								
		// }
			
	}
}
