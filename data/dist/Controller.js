"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_1 = require("@lmstudios/utilities");
const types_1 = require("@lmstudios/types");
const ChangeTracker_1 = require("./ChangeTracker");
const ServerStatus_1 = require("./ServerStatus");
class Controller {
    constructor(context, model, modelProxy) {
        this.ID = utilities_1.Guid.Create().toString();
        this.Context = context;
        this.Model = model;
        this.ModelProxy = modelProxy;
        this.Values = {
            Local: {},
            Server: {},
            Pending: {}
        };
        this.Status = {
            Server: { Properties: {} },
            Change: { Model: ChangeTracker_1.ChangeStatus.Detached, Properties: {} }
        };
    }
    GetValue(value) {
        var property;
        if (typeof (value) === "string")
            property = this.Model.GetType().GetProperty(value);
        else if (value instanceof types_1.Property)
            property = value;
        if (property !== undefined) {
            if (property.PropertyType.IsSubTypeOf("LMS.Data.Model"))
                return this.getModel(property);
            return property.GetValue(this.Model);
        }
        throw new Error(`Controller<Model>.GetValue() requires a Property`);
    }
    GetValueAsync(value) {
        return __awaiter(this, void 0, void 0, function* () {
            var property;
            if (typeof (value) === "string")
                property = this.Model.GetType().GetProperty(value);
            else if (value instanceof types_1.Property)
                property = value;
            if (property !== undefined) {
                if (property.PropertyType.IsSubTypeOf("LMS.Data.Model"))
                    return this.getModelAsync(property);
                return property.GetValue(this.Model);
            }
            throw new Error(`Controller<Model>.GetValue() requires a Property`);
        });
    }
    getModel(value) {
        var property;
        if (typeof (value) === "string")
            property = this.Model.GetType().GetProperty(value);
        else if (value instanceof types_1.Property)
            property = value;
        if (property instanceof types_1.Property) {
            if (property.PropertyType.IsSubTypeOf("LMS.Data.Model")) {
                var result = property.GetValue(this.Model);
                if (result === undefined) {
                    var repository = this.Context.GetRepository(property.PropertyType);
                    result = repository.Local.Select(this.generateRelationshipFilter(property));
                    if (result === undefined) {
                        if (this.Status.Server.Properties[property.Name] === undefined) {
                            this.Status.Server.Properties[property.Name] = ServerStatus_1.ServerStatus.Serving;
                            this.getModelAsync(property).then(serverResult => {
                                this.setModel(property, serverResult, true);
                            });
                        }
                    }
                }
                return result;
            }
            throw new Error(`Controller<Model>.getModel() requires a property that is of type 'LMS.Data.Model'`);
        }
        throw new Error(`Controller<Model>.GetValue() requires a Property`);
    }
    getModelAsync(value) {
        return __awaiter(this, void 0, void 0, function* () {
            var property;
            if (typeof (value) === "string")
                property = this.Model.GetType().GetProperty(value);
            else if (value instanceof types_1.Property)
                property = value;
            if (property !== undefined) {
                var repository = this.Context.GetRepository(property.PropertyType);
                switch (this.Status.Server.Properties[property.Name]) {
                    case ServerStatus_1.ServerStatus.Serving:
                        console.warn("Controller<Model>.getModelAsync() is already trying to server this model.");
                        break;
                    default:
                        this.Status.Server.Properties[property.Name] = ServerStatus_1.ServerStatus.Serving;
                        var result = yield repository.Server.Select(this.generateRelationshipFilter(property));
                        this.setModel(property, result, true);
                        return result;
                }
            }
        });
    }
    SetValue(propertyValue, value, fromServer) {
        var property;
        if (typeof (propertyValue) === "string")
            property = this.Model.GetType().GetProperty(propertyValue);
        else if (propertyValue instanceof types_1.Property)
            property = propertyValue;
        if (property instanceof types_1.Property) {
            if (property.PropertyType.IsSubTypeOf("LMS.Data.Model"))
                this.setModel(property, value, fromServer);
            else if (property.PropertyType.IsSubTypeOf("LMS.Data.Collection")) {
                if (property.GetValue(this.Model) === undefined) {
                    value.Parent.Property = property;
                    property.SetValue(this.Model, value);
                }
            }
            else {
                if (fromServer) {
                    this.Status.Server.Properties[property.Name] = ServerStatus_1.ServerStatus.Served;
                    property.SetValue(this.Values.Server, value);
                }
                switch (this.Status.Server.Properties[property.Name]) {
                    case ServerStatus_1.ServerStatus.Serving:
                        property.SetValue(this.Model, value);
                        property.SetValue(this.Values.Local, value);
                        property.SetValue(this.Values.Pending, value);
                        break;
                    case ServerStatus_1.ServerStatus.Served:
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
    setModel(property, value, fromServer) {
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
    generateRelationshipFilter(value) {
        var property;
        if (typeof (value) === "string")
            property = this.Model.GetType().GetProperty(value);
        else if (value instanceof types_1.Property)
            property = value;
        if (property instanceof types_1.Property) {
            var schemaModel = this.Model.GetSchema();
            var schemaProperty = schemaModel.GetProperty(property.Name);
            if (schemaProperty !== undefined) {
                if (schemaProperty.Relationship !== undefined) {
                    var result = {};
                    for (let localName in schemaProperty.Relationship) {
                        var foreignPropertySchema = schemaProperty.Relationship[localName];
                        var foreignModelSchema = foreignPropertySchema.Model;
                        var foreignProperty = foreignModelSchema.Type.GetProperty(foreignPropertySchema.Name);
                        if (foreignProperty !== undefined)
                            foreignProperty.SetValue(result, property.GetValue(this.Model));
                    }
                    return result;
                }
            }
        }
        throw new Error(``);
    }
    Load(values, fromServer) {
        for (var key in values) {
            var property = this.Model.GetType().GetProperty(key);
            if (property !== undefined) {
                var value = property.GetValue(values);
                this.SetValue(property, value, fromServer);
            }
        }
        if (fromServer)
            this.Status.Server.Model = ServerStatus_1.ServerStatus.Served;
        this.UpdateChangeStatus(fromServer);
    }
    UpdateChangeStatus(fromServer) {
        if (this.Status.Change.Model === ChangeTracker_1.ChangeStatus.Detached)
            return;
        if (fromServer)
            this.Status.Change.Model = ChangeTracker_1.ChangeStatus.Unchanged;
        for (var property of this.Model.GetType().Properties) {
            this.Status.Change.Properties[property.Name] = ChangeTracker_1.ChangeStatus.Unchanged;
            var serverValue = property.GetValue(this.Values.Server);
            var localValue = property.GetValue(this.Values.Local);
            if (serverValue === undefined) {
                if (localValue !== undefined)
                    this.Status.Change.Properties[property.Name] = ChangeTracker_1.ChangeStatus.Added;
            }
            else {
                if (localValue === undefined)
                    this.Status.Change.Properties[property.Name] = ChangeTracker_1.ChangeStatus.Deleted;
                else if (localValue !== serverValue)
                    this.Status.Change.Properties[property.Name] = ChangeTracker_1.ChangeStatus.Modified;
            }
        }
        if (this.Status.Change.Model !== ChangeTracker_1.ChangeStatus.Added && this.Status.Change.Model !== ChangeTracker_1.ChangeStatus.Deleted) {
            this.Status.Change.Model = ChangeTracker_1.ChangeStatus.Unchanged;
            for (var key in this.Status.Change.Properties) {
                if (this.Status.Change.Properties[key] !== ChangeTracker_1.ChangeStatus.Unchanged) {
                    this.Status.Change.Model = ChangeTracker_1.ChangeStatus.Modified;
                    return;
                }
            }
        }
    }
    Undo(propertyValue) {
        var property;
        if (typeof (propertyValue) === "string")
            property = this.Model.GetType().GetProperty(propertyValue);
        else if (propertyValue instanceof types_1.Property)
            property = propertyValue;
        if (property instanceof types_1.Property) {
            var serverValue = property.GetValue(this.Values.Server);
            this.SetValue(property, serverValue);
        }
        else if (property === undefined) {
            for (var p of this.Model.GetType().Properties) {
                this.Undo(p);
            }
        }
    }
    toString() {
        return this.Model.GetType().Name;
    }
    Duplicate() {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    Validate(property) {
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
exports.Controller = Controller;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9Db250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxvREFBNEM7QUFDNUMsNENBQXFFO0FBR3JFLG1EQUErQztBQUMvQyxpREFBOEM7QUFHOUMsTUFBYSxVQUFVO0lBQ3RCLFlBQVksT0FBZSxFQUFFLEtBQWEsRUFBRSxVQUFpQjtRQUM1RCxJQUFJLENBQUMsRUFBRSxHQUFHLGdCQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDbkMsSUFBSSxDQUFDLE1BQU0sR0FBRztZQUNiLEtBQUssRUFBRSxFQUFFO1lBQ1QsTUFBTSxFQUFFLEVBQUU7WUFDVixPQUFPLEVBQUUsRUFBRTtTQUNYLENBQUE7UUFDRCxJQUFJLENBQUMsTUFBTSxHQUFHO1lBQ2IsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFDLEVBQUUsRUFBRTtZQUN6QixNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsNEJBQVksQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFDLEVBQUUsRUFBRTtTQUN2RCxDQUFBO0lBQ0YsQ0FBQztJQWNNLFFBQVEsQ0FBQyxLQUFxQjtRQUM5QixJQUFJLFFBQTJCLENBQUE7UUFDL0IsSUFBSSxPQUFNLENBQUMsS0FBSyxDQUFDLEtBQUcsUUFBUTtZQUN4QixRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxXQUFXLENBQVMsS0FBSyxDQUFDLENBQUM7YUFDMUQsSUFBSSxLQUFLLFlBQVksZ0JBQVE7WUFDOUIsUUFBUSxHQUFHLEtBQUssQ0FBQztRQUNyQixJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUM7WUFD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dkIsSUFBSTtZQUVKLGtCQUFrQjtZQUNsQiwrQkFBK0I7WUFDL0IsdURBQXVEO1lBQ3ZELDhCQUE4QjtZQUM5Qiw4RUFBOEU7WUFDOUUsK0JBQStCO1lBQy9CLGFBQWE7WUFDYixZQUFZO1lBQ1osYUFBYTtZQUNiLDJCQUEyQjtZQUMzQixLQUFLO1lBQ0wsSUFBSTtZQUNKLCtCQUErQjtZQUMvQix1QkFBdUI7WUFDdkIsK0RBQStEO1lBQy9ELCtCQUErQjtZQUMvQiwrRUFBK0U7WUFDL0UsZ0NBQWdDO1lBQ2hDLGFBQWE7WUFDYixhQUFhO1lBQ2IsY0FBYztZQUNkLDRCQUE0QjtZQUM1QixNQUFNO1lBQ04sS0FBSztZQUNMLElBQUk7WUFDSixPQUFPLFNBQVMsQ0FBQztRQUVsQixDQUFDO0tBQUE7SUFFTSxRQUFRLENBQUMsUUFBeUI7UUFDeEMsK0JBQStCO1FBQy9CLGlDQUFpQztRQUNqQyxnQ0FBZ0M7UUFDaEMsZ0dBQWdHO1FBQ2hHLDhCQUE4QjtRQUM5QixzQkFBc0I7UUFDdEIsS0FBSztRQUdMLDhIQUE4SDtRQUM5SCw2QkFBNkI7UUFDN0IsZ0NBQWdDO1FBQ2hDLFNBQVM7UUFDVCxTQUFTO1FBQ1Qsb0NBQW9DO1FBQ3BDLGdEQUFnRDtRQUNoRCw2QkFBNkI7UUFDN0IsS0FBSztRQUNMLElBQUk7UUFDSixXQUFXO1FBQ1gsb0RBQW9EO1FBQ3BELFlBQVk7UUFDWixxREFBcUQ7UUFDckQsMkJBQTJCO1FBQzNCLDhCQUE4QjtRQUM5QixtQ0FBbUM7UUFDbkMsb0NBQW9DO1FBQ3BDLDhDQUE4QztRQUM5QyxtQ0FBbUM7UUFDbkMsK0hBQStIO1FBQy9ILFdBQVc7UUFDWCxhQUFhO1FBQ2IsSUFBSTtJQUVMLENBQUM7Q0FDRDtBQXhXRCxnQ0F3V0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBHdWlkIH0gZnJvbSBcIkBsbXN0dWRpb3MvdXRpbGl0aWVzXCI7XHJcbmltcG9ydCB7IFR5cGUsIFByb3BlcnR5LCBQcm9wZXJ0eURlY29yYXRvciB9IGZyb20gXCJAbG1zdHVkaW9zL3R5cGVzXCI7XHJcbmltcG9ydCB7IENvbnRleHQgfSBmcm9tIFwiLi9Db250ZXh0XCI7XHJcbmltcG9ydCB7IE1vZGVsIH0gZnJvbSBcIi4vTW9kZWxcIjtcclxuaW1wb3J0IHsgQ2hhbmdlU3RhdHVzIH0gZnJvbSBcIi4vQ2hhbmdlVHJhY2tlclwiO1xyXG5pbXBvcnQgeyBTZXJ2ZXJTdGF0dXMgfSBmcm9tIFwiLi9TZXJ2ZXJTdGF0dXNcIjtcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgQ29udHJvbGxlcjxUTW9kZWwgZXh0ZW5kcyBNb2RlbD4ge1xyXG5cdGNvbnN0cnVjdG9yKGNvbnRleHQ6Q29udGV4dCwgbW9kZWw6IFRNb2RlbCwgbW9kZWxQcm94eTpUTW9kZWwpIHtcclxuXHRcdHRoaXMuSUQgPSBHdWlkLkNyZWF0ZSgpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgdGhpcy5Db250ZXh0ID0gY29udGV4dDtcclxuICAgICAgICB0aGlzLk1vZGVsID0gbW9kZWw7XHJcbiAgICAgICAgdGhpcy5Nb2RlbFByb3h5ID0gbW9kZWxQcm94eTtcclxuXHRcdHRoaXMuVmFsdWVzID0ge1xyXG5cdFx0XHRMb2NhbDoge30sXHJcblx0XHRcdFNlcnZlcjoge30sXHJcblx0XHRcdFBlbmRpbmc6IHt9XHJcblx0XHR9XHJcblx0XHR0aGlzLlN0YXR1cyA9IHtcclxuXHRcdFx0U2VydmVyOiB7IFByb3BlcnRpZXM6e30gfSxcclxuXHRcdFx0Q2hhbmdlOiB7IE1vZGVsOiBDaGFuZ2VTdGF0dXMuRGV0YWNoZWQsIFByb3BlcnRpZXM6e30gfVxyXG5cdFx0fVxyXG5cdH1cclxuXHRwdWJsaWMgSUQ6c3RyaW5nO1xyXG4gICAgcHVibGljIENvbnRleHQ6Q29udGV4dDtcclxuICAgIHB1YmxpYyBNb2RlbDpUTW9kZWw7XHJcbiAgICBwdWJsaWMgTW9kZWxQcm94eTpUTW9kZWw7XHJcblx0cHVibGljIFZhbHVlczp7XHJcblx0XHRMb2NhbDogUGFydGlhbDxUTW9kZWw+LFxyXG5cdFx0U2VydmVyOiBQYXJ0aWFsPFRNb2RlbD4sXHJcblx0XHRQZW5kaW5nOiBQYXJ0aWFsPFRNb2RlbD5cclxuXHR9XHJcblx0cHVibGljIFN0YXR1czp7XHJcblx0XHRTZXJ2ZXI6IHsgTW9kZWw/OlNlcnZlclN0YXR1cywgUHJvcGVydGllczp7W25hbWU6c3RyaW5nXTpTZXJ2ZXJTdGF0dXMgfX0sXHJcblx0XHRDaGFuZ2U6IHsgTW9kZWw/OkNoYW5nZVN0YXR1cywgUHJvcGVydGllczp7W25hbWU6c3RyaW5nXTpDaGFuZ2VTdGF0dXMgfX1cclxuXHR9XHJcblx0cHVibGljIEdldFZhbHVlKHZhbHVlOnN0cmluZ3xQcm9wZXJ0eSk6YW55e1x0XHJcbiAgICAgICAgdmFyIHByb3BlcnR5OlByb3BlcnR5fHVuZGVmaW5lZFxyXG4gICAgICAgIGlmICh0eXBlb2YodmFsdWUpPT09XCJzdHJpbmdcIilcclxuICAgICAgICAgICAgcHJvcGVydHkgPSB0aGlzLk1vZGVsLkdldFR5cGUoKS5HZXRQcm9wZXJ0eSg8c3RyaW5nPnZhbHVlKTtcclxuICAgICAgICBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFByb3BlcnR5KVxyXG4gICAgICAgICAgICBwcm9wZXJ0eSA9IHZhbHVlO1xyXG4gICAgICAgIGlmIChwcm9wZXJ0eSAhPT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgaWYgKHByb3BlcnR5LlByb3BlcnR5VHlwZS5Jc1N1YlR5cGVPZihcIkxNUy5EYXRhLk1vZGVsXCIpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TW9kZWwocHJvcGVydHkpO1xyXG4gICAgICAgICAgICByZXR1cm4gcHJvcGVydHkuR2V0VmFsdWUodGhpcy5Nb2RlbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQ29udHJvbGxlcjxNb2RlbD4uR2V0VmFsdWUoKSByZXF1aXJlcyBhIFByb3BlcnR5YClcclxuXHR9XHJcblx0cHVibGljIGFzeW5jIEdldFZhbHVlQXN5bmModmFsdWU6c3RyaW5nfFByb3BlcnR5KTpQcm9taXNlPGFueT57XHJcbiAgICAgICAgdmFyIHByb3BlcnR5OlByb3BlcnR5fHVuZGVmaW5lZFxyXG4gICAgICAgIGlmICh0eXBlb2YodmFsdWUpPT09XCJzdHJpbmdcIilcclxuICAgICAgICAgICAgcHJvcGVydHkgPSB0aGlzLk1vZGVsLkdldFR5cGUoKS5HZXRQcm9wZXJ0eSg8c3RyaW5nPnZhbHVlKTtcclxuICAgICAgICBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFByb3BlcnR5KVxyXG4gICAgICAgICAgICBwcm9wZXJ0eSA9IHZhbHVlO1xyXG4gICAgICAgIGlmIChwcm9wZXJ0eSAhPT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgaWYgKHByb3BlcnR5LlByb3BlcnR5VHlwZS5Jc1N1YlR5cGVPZihcIkxNUy5EYXRhLk1vZGVsXCIpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TW9kZWxBc3luYyhwcm9wZXJ0eSk7XHJcbiAgICAgICAgICAgIHJldHVybiBwcm9wZXJ0eS5HZXRWYWx1ZSh0aGlzLk1vZGVsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb250cm9sbGVyPE1vZGVsPi5HZXRWYWx1ZSgpIHJlcXVpcmVzIGEgUHJvcGVydHlgKVxyXG5cdH1cclxuXHRwcml2YXRlIGdldE1vZGVsKHZhbHVlOnN0cmluZ3xQcm9wZXJ0eSk6TW9kZWx8dW5kZWZpbmVke1x0XHJcbiAgICAgICAgdmFyIHByb3BlcnR5OlByb3BlcnR5fHVuZGVmaW5lZFxyXG4gICAgICAgIGlmICh0eXBlb2YodmFsdWUpPT09XCJzdHJpbmdcIilcclxuICAgICAgICAgICAgcHJvcGVydHkgPSB0aGlzLk1vZGVsLkdldFR5cGUoKS5HZXRQcm9wZXJ0eSg8c3RyaW5nPnZhbHVlKTtcclxuICAgICAgICBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFByb3BlcnR5KVxyXG4gICAgICAgICAgICBwcm9wZXJ0eSA9IHZhbHVlO1xyXG5cclxuICAgICAgICBpZiAocHJvcGVydHkgaW5zdGFuY2VvZiBQcm9wZXJ0eSl7XHJcbiAgICAgICAgICAgIGlmIChwcm9wZXJ0eS5Qcm9wZXJ0eVR5cGUuSXNTdWJUeXBlT2YoXCJMTVMuRGF0YS5Nb2RlbFwiKSl7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gcHJvcGVydHkuR2V0VmFsdWUodGhpcy5Nb2RlbCk7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0ID09PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZXBvc2l0b3J5ID0gdGhpcy5Db250ZXh0LkdldFJlcG9zaXRvcnkocHJvcGVydHkuUHJvcGVydHlUeXBlKTtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXBvc2l0b3J5LkxvY2FsLlNlbGVjdCh0aGlzLmdlbmVyYXRlUmVsYXRpb25zaGlwRmlsdGVyKHByb3BlcnR5KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCA9PT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuU3RhdHVzLlNlcnZlci5Qcm9wZXJ0aWVzW3Byb3BlcnR5Lk5hbWVdID09PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5TdGF0dXMuU2VydmVyLlByb3BlcnRpZXNbcHJvcGVydHkuTmFtZV0gPSBTZXJ2ZXJTdGF0dXMuU2VydmluZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRNb2RlbEFzeW5jKHByb3BlcnR5KS50aGVuKHNlcnZlclJlc3VsdD0+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0TW9kZWwoPFByb3BlcnR5PnByb3BlcnR5LCBzZXJ2ZXJSZXN1bHQsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb250cm9sbGVyPE1vZGVsPi5nZXRNb2RlbCgpIHJlcXVpcmVzIGEgcHJvcGVydHkgdGhhdCBpcyBvZiB0eXBlICdMTVMuRGF0YS5Nb2RlbCdgKVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENvbnRyb2xsZXI8TW9kZWw+LkdldFZhbHVlKCkgcmVxdWlyZXMgYSBQcm9wZXJ0eWApXHJcblx0fVxyXG5cdHByaXZhdGUgYXN5bmMgZ2V0TW9kZWxBc3luYyh2YWx1ZTpzdHJpbmd8UHJvcGVydHkpOlByb21pc2U8TW9kZWx8dW5kZWZpbmVkPntcclxuICAgICAgICB2YXIgcHJvcGVydHk6UHJvcGVydHl8dW5kZWZpbmVkXHJcbiAgICAgICAgaWYgKHR5cGVvZih2YWx1ZSk9PT1cInN0cmluZ1wiKVxyXG4gICAgICAgICAgICBwcm9wZXJ0eSA9IHRoaXMuTW9kZWwuR2V0VHlwZSgpLkdldFByb3BlcnR5KDxzdHJpbmc+dmFsdWUpO1xyXG4gICAgICAgIGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgUHJvcGVydHkpXHJcbiAgICAgICAgICAgIHByb3BlcnR5ID0gdmFsdWU7XHJcbiAgICAgICAgaWYgKHByb3BlcnR5ICE9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICB2YXIgcmVwb3NpdG9yeSA9IHRoaXMuQ29udGV4dC5HZXRSZXBvc2l0b3J5KHByb3BlcnR5LlByb3BlcnR5VHlwZSk7XHJcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy5TdGF0dXMuU2VydmVyLlByb3BlcnRpZXNbcHJvcGVydHkuTmFtZV0pe1xyXG4gICAgICAgICAgICAgICAgY2FzZSBTZXJ2ZXJTdGF0dXMuU2VydmluZzpcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJDb250cm9sbGVyPE1vZGVsPi5nZXRNb2RlbEFzeW5jKCkgaXMgYWxyZWFkeSB0cnlpbmcgdG8gc2VydmVyIHRoaXMgbW9kZWwuXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuU3RhdHVzLlNlcnZlci5Qcm9wZXJ0aWVzW3Byb3BlcnR5Lk5hbWVdID0gU2VydmVyU3RhdHVzLlNlcnZpbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGF3YWl0IHJlcG9zaXRvcnkuU2VydmVyLlNlbGVjdCh0aGlzLmdlbmVyYXRlUmVsYXRpb25zaGlwRmlsdGVyKHByb3BlcnR5KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRNb2RlbChwcm9wZXJ0eSwgcmVzdWx0LCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cdH1cclxuXHJcblx0cHVibGljIFNldFZhbHVlKHByb3BlcnR5VmFsdWU6c3RyaW5nfFByb3BlcnR5LCB2YWx1ZTphbnksIGZyb21TZXJ2ZXI/OmJvb2xlYW4pe1x0XHRcdFx0XHJcbiAgICAgICAgdmFyIHByb3BlcnR5OlByb3BlcnR5fHVuZGVmaW5lZFxyXG4gICAgICAgIGlmICh0eXBlb2YocHJvcGVydHlWYWx1ZSk9PT1cInN0cmluZ1wiKVxyXG4gICAgICAgICAgICBwcm9wZXJ0eSA9IHRoaXMuTW9kZWwuR2V0VHlwZSgpLkdldFByb3BlcnR5KDxzdHJpbmc+cHJvcGVydHlWYWx1ZSk7XHJcbiAgICAgICAgZWxzZSBpZiAocHJvcGVydHlWYWx1ZSBpbnN0YW5jZW9mIFByb3BlcnR5KVxyXG4gICAgICAgICAgICBwcm9wZXJ0eSA9IHByb3BlcnR5VmFsdWU7XHJcbiAgICAgICAgaWYgKHByb3BlcnR5IGluc3RhbmNlb2YgUHJvcGVydHkpe1xyXG4gICAgICAgICAgICBpZiAocHJvcGVydHkuUHJvcGVydHlUeXBlLklzU3ViVHlwZU9mKFwiTE1TLkRhdGEuTW9kZWxcIikpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldE1vZGVsKHByb3BlcnR5LCB2YWx1ZSwgZnJvbVNlcnZlcik7XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHByb3BlcnR5LlByb3BlcnR5VHlwZS5Jc1N1YlR5cGVPZihcIkxNUy5EYXRhLkNvbGxlY3Rpb25cIikpe1xyXG4gICAgICAgICAgICAgICAgaWYgKHByb3BlcnR5LkdldFZhbHVlKHRoaXMuTW9kZWwpID09PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlLlBhcmVudC5Qcm9wZXJ0eSA9IHByb3BlcnR5O1xyXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5LlNldFZhbHVlKHRoaXMuTW9kZWwsIHZhbHVlKVxyXG4gICAgICAgICAgICAgICAgfSAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgIGlmIChmcm9tU2VydmVyKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLlN0YXR1cy5TZXJ2ZXIuUHJvcGVydGllc1twcm9wZXJ0eS5OYW1lXSA9IFNlcnZlclN0YXR1cy5TZXJ2ZWRcclxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eS5TZXRWYWx1ZSh0aGlzLlZhbHVlcy5TZXJ2ZXIsIHZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy5TdGF0dXMuU2VydmVyLlByb3BlcnRpZXNbcHJvcGVydHkuTmFtZV0pe1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgU2VydmVyU3RhdHVzLlNlcnZpbmc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5LlNldFZhbHVlKHRoaXMuTW9kZWwsIHZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHkuU2V0VmFsdWUodGhpcy5WYWx1ZXMuTG9jYWwsIHZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHkuU2V0VmFsdWUodGhpcy5WYWx1ZXMuUGVuZGluZywgdmFsdWUpOyAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBTZXJ2ZXJTdGF0dXMuU2VydmVkOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eS5TZXRWYWx1ZSh0aGlzLk1vZGVsLCB2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5LlNldFZhbHVlKHRoaXMuVmFsdWVzLkxvY2FsLCB2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5LlNldFZhbHVlKHRoaXMuTW9kZWwsIHZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHkuU2V0VmFsdWUodGhpcy5WYWx1ZXMuTG9jYWwsIHZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBDaGVjayBmb3IgY2hhbmdlc1xyXG4gICAgICAgICAgICB0aGlzLlVwZGF0ZUNoYW5nZVN0YXR1cygpO1xyXG4gICAgICAgIH1cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgc2V0TW9kZWwocHJvcGVydHk6c3RyaW5nfFByb3BlcnR5LCB2YWx1ZTpNb2RlbHxQYXJ0aWFsPE1vZGVsPnx1bmRlZmluZWQsIGZyb21TZXJ2ZXI/OmJvb2xlYW4pe1xyXG4gICAgICAgIC8vIHZhciBtb2RlbDpNb2RlbHx1bmRlZmluZWQ7XHJcbiAgICAgICAgLy8gaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgIC8vICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBNb2RlbClcclxuICAgICAgICAvLyAgICAgICAgIG1vZGVsID0gdmFsdWU7XHJcbiAgICAgICAgLy8gICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgIC8vIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyB2YXIgcmVmZXJlbmNlUHJvcGVydHkgPSB0aGlzLmdldFJlZmVyZW5jZVByb3BlcnR5KHByb3BlcnR5KTtcclxuXHJcblx0XHQvLyBpZiAodmFsdWUgaW5zdGFuY2VvZiBNb2RlbCl7XHJcblx0XHQvLyBcdHByb3BlcnR5LlNldFZhbHVlKHRoaXMuVmFsdWVzLkFjdHVhbC5Nb2RlbCwgdmFsdWUpO1xyXG5cdFx0Ly8gXHR2YXIga2V5VmFsdWUgPSB2YWx1ZS5QcmltYXJ5S2V5O1xyXG5cdFx0Ly8gXHRpZiAoa2V5VmFsdWUgPT09IHVuZGVmaW5lZClcclxuXHRcdC8vIFx0XHRrZXlWYWx1ZSA9IHZhbHVlLl9fY29udHJvbGxlci5JRDtcclxuXHRcdC8vIFx0aWYgKHJlZmVyZW5jZVByb3BlcnR5ICE9PSB1bmRlZmluZWQpe1xyXG5cdFx0Ly8gXHRcdHJlZmVyZW5jZVByb3BlcnR5LlNldFZhbHVlKHRoaXMuVmFsdWVzLkFjdHVhbC5Nb2RlbCwga2V5VmFsdWUpO1xyXG5cdFx0Ly8gXHRcdHJlZmVyZW5jZVByb3BlcnR5LlNldFZhbHVlKHRoaXMuVmFsdWVzLkFjdHVhbC5EYXRhLCBrZXlWYWx1ZSk7XHJcblx0XHQvLyBcdH1cdFx0XHRcdFxyXG5cdFx0Ly8gXHRyZXR1cm47XHJcblx0XHQvLyB9XHJcblx0XHQvLyBlbHNlIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKXtcclxuXHRcdC8vIFx0aWYgKHJlZmVyZW5jZVByb3BlcnR5ID09PSB0aGlzLlNjaGVtYS5QcmltYXJ5S2V5UHJvcGVydHkpe1x0XHRcdFxyXG5cdFx0Ly8gXHRcdGlmIChyZWZlcmVuY2VQcm9wZXJ0eS5QcmluY2lwYWwgIT09IHVuZGVmaW5lZCl7XHJcblx0XHQvLyBcdFx0XHRjb25zb2xlLndhcm4oXCJVbmFibGUgdG8gZGVsZXRlIG9yIHJlbW92ZSB0aGUgcHJpbmNpcGFsIFByb3BlcnR5IHJlZmVyZW5jZVwiKTtcclxuXHRcdC8vIFx0XHRcdHJldHVybjtcclxuXHRcdC8vIFx0XHR9XHJcblx0XHQvLyBcdH1cclxuXHRcdC8vIFx0ZWxzZXtcclxuXHRcdC8vIFx0XHRwcm9wZXJ0eS5TZXRWYWx1ZSh0aGlzLlZhbHVlcy5BY3R1YWwuTW9kZWwsIHZhbHVlKTtcclxuXHRcdC8vIFx0XHRpZiAocmVmZXJlbmNlUHJvcGVydHkgIT09IHVuZGVmaW5lZCl7XHJcblx0XHQvLyBcdFx0XHRyZWZlcmVuY2VQcm9wZXJ0eS5TZXRWYWx1ZSh0aGlzLlZhbHVlcy5BY3R1YWwuTW9kZWwsIHZhbHVlKTtcclxuXHRcdC8vIFx0XHRcdHJlZmVyZW5jZVByb3BlcnR5LlNldFZhbHVlKHRoaXMuVmFsdWVzLkFjdHVhbC5EYXRhLCB2YWx1ZSlcclxuXHRcdC8vIFx0XHR9XHJcblx0XHQvLyBcdH1cclxuXHRcdC8vIFx0cmV0dXJuO1xyXG5cdFx0Ly8gfVxyXG5cdFx0Ly8gZWxzZXtcclxuXHRcdC8vIFx0dmFyIHJlcG9zaXRvcnkgPSB0aGlzLkNvbnRleHQuR2V0UmVwb3NpdG9yeShwcm9wZXJ0eS5Qcm9wZXJ0eVR5cGUpO1xyXG5cdFx0XHRcclxuXHRcdC8vIH1cclxuXHRcdFxyXG5cdH1cclxuXHJcblx0cHVibGljIGdlbmVyYXRlUmVsYXRpb25zaGlwRmlsdGVyKHZhbHVlOnN0cmluZ3xQcm9wZXJ0eSk6YW55IHtcclxuICAgICAgICB2YXIgcHJvcGVydHk6UHJvcGVydHl8dW5kZWZpbmVkXHJcbiAgICAgICAgaWYgKHR5cGVvZih2YWx1ZSk9PT1cInN0cmluZ1wiKVxyXG4gICAgICAgICAgICBwcm9wZXJ0eSA9IHRoaXMuTW9kZWwuR2V0VHlwZSgpLkdldFByb3BlcnR5KDxzdHJpbmc+dmFsdWUpO1xyXG4gICAgICAgIGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgUHJvcGVydHkpXHJcbiAgICAgICAgICAgIHByb3BlcnR5ID0gdmFsdWU7XHJcbiAgICAgICAgaWYgKHByb3BlcnR5IGluc3RhbmNlb2YgUHJvcGVydHkpe1xyXG4gICAgICAgICAgICB2YXIgc2NoZW1hTW9kZWwgPSB0aGlzLk1vZGVsLkdldFNjaGVtYSgpO1xyXG4gICAgICAgICAgICB2YXIgc2NoZW1hUHJvcGVydHkgPSBzY2hlbWFNb2RlbC5HZXRQcm9wZXJ0eShwcm9wZXJ0eS5OYW1lKTtcclxuICAgICAgICAgICAgaWYgKHNjaGVtYVByb3BlcnR5ICE9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICAgICAgaWYgKHNjaGVtYVByb3BlcnR5LlJlbGF0aW9uc2hpcCAhPT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0ge307XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbG9jYWxOYW1lIGluIHNjaGVtYVByb3BlcnR5LlJlbGF0aW9uc2hpcCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmb3JlaWduUHJvcGVydHlTY2hlbWEgPSBzY2hlbWFQcm9wZXJ0eS5SZWxhdGlvbnNoaXBbbG9jYWxOYW1lXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZvcmVpZ25Nb2RlbFNjaGVtYSA9IGZvcmVpZ25Qcm9wZXJ0eVNjaGVtYS5Nb2RlbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZvcmVpZ25Qcm9wZXJ0eSA9IGZvcmVpZ25Nb2RlbFNjaGVtYS5UeXBlLkdldFByb3BlcnR5KGZvcmVpZ25Qcm9wZXJ0eVNjaGVtYS5OYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZvcmVpZ25Qcm9wZXJ0eSAhPT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yZWlnblByb3BlcnR5LlNldFZhbHVlKHJlc3VsdCwgcHJvcGVydHkuR2V0VmFsdWUodGhpcy5Nb2RlbCkpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblx0XHR0aHJvdyBuZXcgRXJyb3IoYGApO1xyXG5cdH1cclxuXHRwdWJsaWMgTG9hZCh2YWx1ZXM6IFBhcnRpYWw8VE1vZGVsPiwgZnJvbVNlcnZlcj86Ym9vbGVhbikge1xyXG5cdFx0Zm9yICh2YXIga2V5IGluIHZhbHVlcyl7XHJcblx0XHRcdHZhciBwcm9wZXJ0eTpQcm9wZXJ0eXx1bmRlZmluZWQgPSB0aGlzLk1vZGVsLkdldFR5cGUoKS5HZXRQcm9wZXJ0eShrZXkpO1xyXG5cdFx0XHRpZiAocHJvcGVydHkgIT09IHVuZGVmaW5lZCl7XHJcblx0XHRcdFx0dmFyIHZhbHVlID0gcHJvcGVydHkuR2V0VmFsdWUodmFsdWVzKTtcdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMuU2V0VmFsdWUocHJvcGVydHksIHZhbHVlLCBmcm9tU2VydmVyKTtcdFxyXG5cdFx0XHR9XHRcdFx0XHJcblx0XHR9XHJcblx0XHRpZiAoZnJvbVNlcnZlcilcclxuXHRcdFx0dGhpcy5TdGF0dXMuU2VydmVyLk1vZGVsID0gU2VydmVyU3RhdHVzLlNlcnZlZDtcdFxyXG5cdFx0dGhpcy5VcGRhdGVDaGFuZ2VTdGF0dXMoZnJvbVNlcnZlcik7XHRcclxuXHR9XHJcblx0cHVibGljIFVwZGF0ZUNoYW5nZVN0YXR1cyhmcm9tU2VydmVyPzpib29sZWFuKXtcclxuXHRcdGlmICh0aGlzLlN0YXR1cy5DaGFuZ2UuTW9kZWwgPT09IENoYW5nZVN0YXR1cy5EZXRhY2hlZClcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0aWYgKGZyb21TZXJ2ZXIpXHJcblx0XHRcdHRoaXMuU3RhdHVzLkNoYW5nZS5Nb2RlbCA9IENoYW5nZVN0YXR1cy5VbmNoYW5nZWQ7XHJcblxyXG5cdFx0Zm9yICh2YXIgcHJvcGVydHkgb2YgdGhpcy5Nb2RlbC5HZXRUeXBlKCkuUHJvcGVydGllcyl7XHJcblx0XHRcdHRoaXMuU3RhdHVzLkNoYW5nZS5Qcm9wZXJ0aWVzW3Byb3BlcnR5Lk5hbWVdID0gQ2hhbmdlU3RhdHVzLlVuY2hhbmdlZDtcclxuXHRcdFx0dmFyIHNlcnZlclZhbHVlID0gcHJvcGVydHkuR2V0VmFsdWUodGhpcy5WYWx1ZXMuU2VydmVyKTtcclxuXHRcdFx0dmFyIGxvY2FsVmFsdWUgPSBwcm9wZXJ0eS5HZXRWYWx1ZSh0aGlzLlZhbHVlcy5Mb2NhbCk7XHJcblx0XHRcdGlmIChzZXJ2ZXJWYWx1ZSA9PT0gdW5kZWZpbmVkKXtcclxuXHRcdFx0XHRpZiAobG9jYWxWYWx1ZSAhPT0gdW5kZWZpbmVkKVxyXG5cdFx0XHRcdFx0dGhpcy5TdGF0dXMuQ2hhbmdlLlByb3BlcnRpZXNbcHJvcGVydHkuTmFtZV0gPSBDaGFuZ2VTdGF0dXMuQWRkZWQ7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZXtcclxuXHRcdFx0XHRpZiAobG9jYWxWYWx1ZSA9PT0gdW5kZWZpbmVkKVxyXG5cdFx0XHRcdFx0dGhpcy5TdGF0dXMuQ2hhbmdlLlByb3BlcnRpZXNbcHJvcGVydHkuTmFtZV0gPSBDaGFuZ2VTdGF0dXMuRGVsZXRlZDtcclxuXHRcdFx0XHRlbHNlIGlmIChsb2NhbFZhbHVlICE9PSBzZXJ2ZXJWYWx1ZSlcclxuXHRcdFx0XHRcdHRoaXMuU3RhdHVzLkNoYW5nZS5Qcm9wZXJ0aWVzW3Byb3BlcnR5Lk5hbWVdID0gQ2hhbmdlU3RhdHVzLk1vZGlmaWVkO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5TdGF0dXMuQ2hhbmdlLk1vZGVsICE9PSBDaGFuZ2VTdGF0dXMuQWRkZWQgJiYgdGhpcy5TdGF0dXMuQ2hhbmdlLk1vZGVsICE9PSBDaGFuZ2VTdGF0dXMuRGVsZXRlZCl7XHJcblx0XHRcdHRoaXMuU3RhdHVzLkNoYW5nZS5Nb2RlbCA9IENoYW5nZVN0YXR1cy5VbmNoYW5nZWQ7XHJcblx0XHRcdGZvciAodmFyIGtleSBpbiB0aGlzLlN0YXR1cy5DaGFuZ2UuUHJvcGVydGllcyl7XHJcblx0XHRcdFx0aWYgKHRoaXMuU3RhdHVzLkNoYW5nZS5Qcm9wZXJ0aWVzW2tleV0gIT09IENoYW5nZVN0YXR1cy5VbmNoYW5nZWQpe1xyXG5cdFx0XHRcdFx0dGhpcy5TdGF0dXMuQ2hhbmdlLk1vZGVsID0gQ2hhbmdlU3RhdHVzLk1vZGlmaWVkO1xyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdH1cdFx0XHRcdFx0XHRcdFxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdHB1YmxpYyBVbmRvKHByb3BlcnR5VmFsdWU/OnN0cmluZ3xQcm9wZXJ0eSl7XHJcbiAgICAgICAgdmFyIHByb3BlcnR5OlByb3BlcnR5fHVuZGVmaW5lZFxyXG4gICAgICAgIGlmICh0eXBlb2YocHJvcGVydHlWYWx1ZSk9PT1cInN0cmluZ1wiKVxyXG4gICAgICAgICAgICBwcm9wZXJ0eSA9IHRoaXMuTW9kZWwuR2V0VHlwZSgpLkdldFByb3BlcnR5KDxzdHJpbmc+cHJvcGVydHlWYWx1ZSk7XHJcbiAgICAgICAgZWxzZSBpZiAocHJvcGVydHlWYWx1ZSBpbnN0YW5jZW9mIFByb3BlcnR5KVxyXG4gICAgICAgICAgICBwcm9wZXJ0eSA9IHByb3BlcnR5VmFsdWU7XHJcbiAgICAgICAgaWYgKHByb3BlcnR5IGluc3RhbmNlb2YgUHJvcGVydHkpe1xyXG5cdFx0XHR2YXIgc2VydmVyVmFsdWUgPSBwcm9wZXJ0eS5HZXRWYWx1ZSh0aGlzLlZhbHVlcy5TZXJ2ZXIpO1xyXG5cdFx0XHR0aGlzLlNldFZhbHVlKHByb3BlcnR5LCBzZXJ2ZXJWYWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHByb3BlcnR5ID09PSB1bmRlZmluZWQpe1xyXG5cdFx0XHRmb3IgKHZhciBwIG9mIHRoaXMuTW9kZWwuR2V0VHlwZSgpLlByb3BlcnRpZXMpe1xyXG5cdFx0XHRcdHRoaXMuVW5kbyhwKTtcclxuXHRcdFx0fVxyXG4gICAgICAgIH1cclxuXHR9XHJcblxyXG5cdHB1YmxpYyB0b1N0cmluZygpOnN0cmluZ3tcclxuXHRcdHJldHVybiB0aGlzLk1vZGVsLkdldFR5cGUoKS5OYW1lO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGFzeW5jIER1cGxpY2F0ZSgpOlByb21pc2U8TW9kZWx8dW5kZWZpbmVkPntcclxuXHRcdC8vIHZhciByZXBvc2l0b3J5ID0gdGhpcy5Db250ZXh0LkdldFJlcG9zaXRvcnkodGhpcy5TY2hlbWEpO1xyXG5cdFx0Ly8gdmFyIGZpbHRlcnM6e1NlcnZlcjpib29sZWFuLCBWYWx1ZTphbnl9W10gPSBbXTtcclxuXHRcdC8vIGZvciAodmFyIGtleSBvZiB0aGlzLlNjaGVtYS5BZGRpdGlvbmFsS2V5cyl7XHJcblx0XHQvLyBcdHZhciBpdGVtID0ge1NlcnZlcjp0cnVlLCBWYWx1ZTp7fX07XHJcblx0XHQvLyBcdGZvciAodmFyIHByb3BlcnR5IG9mIGtleS5Qcm9wZXJ0aWVzKXtcdFx0XHRcdFxyXG5cdFx0Ly8gXHRcdHZhciB2YWx1ZSA9IHByb3BlcnR5LkdldFZhbHVlKHRoaXMuVmFsdWVzLkFjdHVhbC5EYXRhKTtcdFx0XHRcdFxyXG5cdFx0Ly8gXHRcdHByb3BlcnR5LlNldFZhbHVlKGl0ZW0uVmFsdWUsIHZhbHVlKTtcclxuXHRcdC8vIFx0XHRpZiAodHlwZW9mKHZhbHVlKSAhPT0gcHJvcGVydHkuUHJvcGVydHlUeXBlLk5hbWUpXHJcblx0XHQvLyBcdFx0aXRlbS5TZXJ2ZXIgPSBmYWxzZTtcclxuXHRcdC8vIFx0fVxyXG5cdFx0Ly8gXHRmaWx0ZXJzLnB1c2goaXRlbSk7XHJcblx0XHQvLyB9XHJcblxyXG5cdFx0Ly8gdmFyIGR1cGxpY2F0ZXM7XHJcblx0XHQvLyBmb3IgKHZhciBmaWx0ZXIgb2YgZmlsdGVycyl7XHJcblx0XHQvLyBcdGR1cGxpY2F0ZXMgPSByZXBvc2l0b3J5LkxvY2FsLlNlYXJjaChmaWx0ZXIuVmFsdWUpO1xyXG5cdFx0Ly8gXHRpZiAoZHVwbGljYXRlcy5sZW5ndGggPiAwKVxyXG5cdFx0Ly8gXHRcdGR1cGxpY2F0ZXMgPSBkdXBsaWNhdGVzLmZpbHRlcih4ID0+IHsgcmV0dXJuIHggIT09IHRoaXMuVmFsdWVzLlByb3h5OyB9KTtcclxuXHRcdC8vIFx0c3dpdGNoIChkdXBsaWNhdGVzLmxlbmd0aCl7XHJcblx0XHQvLyBcdFx0Y2FzZSAwOiBcclxuXHRcdC8vIFx0XHRcdGJyZWFrO1xyXG5cdFx0Ly8gXHRcdGRlZmF1bHQ6XHJcblx0XHQvLyBcdFx0XHRyZXR1cm4gZHVwbGljYXRlc1swXTtcclxuXHRcdC8vIFx0fVxyXG5cdFx0Ly8gfVxyXG5cdFx0Ly8gZm9yICh2YXIgZmlsdGVyIG9mIGZpbHRlcnMpe1xyXG5cdFx0Ly8gXHRpZiAoZmlsdGVyLlNlcnZlcil7XHJcblx0XHQvLyBcdFx0ZHVwbGljYXRlcyA9IGF3YWl0IHJlcG9zaXRvcnkuU2VydmVyLlNlYXJjaChmaWx0ZXIuVmFsdWUpO1xyXG5cdFx0Ly8gXHRcdGlmIChkdXBsaWNhdGVzLmxlbmd0aCA+IDApXHJcblx0XHQvLyBcdFx0XHRkdXBsaWNhdGVzID0gZHVwbGljYXRlcy5maWx0ZXIoeCA9PiB7IHJldHVybiB4ICE9PSB0aGlzLlZhbHVlcy5Qcm94eTsgfSk7XHJcblx0XHQvLyBcdFx0c3dpdGNoIChkdXBsaWNhdGVzLmxlbmd0aCl7XHJcblx0XHQvLyBcdFx0XHRjYXNlIDA6XHJcblx0XHQvLyBcdFx0XHRcdGJyZWFrO1xyXG5cdFx0Ly8gXHRcdFx0ZGVmYXVsdDpcclxuXHRcdC8vIFx0XHRcdFx0cmV0dXJuIGR1cGxpY2F0ZXNbMF07XHJcblx0XHQvLyBcdFx0fVxyXG5cdFx0Ly8gXHR9XHJcblx0XHQvLyB9XHJcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xyXG5cdFxyXG5cdH1cclxuXHJcblx0cHVibGljIFZhbGlkYXRlKHByb3BlcnR5PzpzdHJpbmd8UHJvcGVydHkpe1xyXG5cdFx0Ly8gaWYgKHByb3BlcnR5ID09PSB1bmRlZmluZWQpe1xyXG5cdFx0Ly8gXHR0aGlzLkVycm9yID0gbmV3IExNUy5FcnJvcigpO1xyXG5cdFx0Ly8gXHR0aGlzLkVycm9yLklubmVyRXJyb3JzID0ge307XHJcblx0XHQvLyBcdHZhciBwcm9wZXJ0aWVzID0gdGhpcy5TY2hlbWEuUHJvcGVydGllcy5maWx0ZXIoeCA9PiB7IHJldHVybiB4LlJlbGF0aW9uc2hpcCA9PT0gdW5kZWZpbmVkfSk7XHJcblx0XHQvLyBcdGZvciAodmFyIHAgb2YgcHJvcGVydGllcyl7XHJcblx0XHQvLyBcdFx0dGhpcy5WYWxpZGF0ZShwKTtcclxuXHRcdC8vIFx0fVxyXG5cclxuXHRcdFx0XHJcblx0XHQvLyBcdGlmICh0aGlzLkVycm9yICE9PSB1bmRlZmluZWQgJiYgdGhpcy5FcnJvci5Jbm5lckVycm9ycyAhPT0gdW5kZWZpbmVkICYmIE9iamVjdC5rZXlzKHRoaXMuRXJyb3IuSW5uZXJFcnJvcnMpLmxlbmd0aCA9PT0gMCl7XHJcblx0XHQvLyBcdFx0Y29uc29sZS5sb2codGhpcy5FcnJvcik7XHJcblx0XHQvLyBcdFx0dGhpcy5FcnJvciA9IHVuZGVmaW5lZDtcdFx0XHRcdFxyXG5cdFx0Ly8gXHR9XHRcdFx0XHRcclxuXHRcdC8vIFx0ZWxzZXtcclxuXHRcdC8vIFx0XHR0aGlzLkVycm9yLk1lc3NhZ2UgPSBcIkludmFsaWRcIjtcclxuXHRcdC8vIFx0XHR0aGlzLkVycm9yLkRlc2NyaXB0aW9uID0gXCJTZWUgSW5uZXJFcnJvcnNcIjtcclxuXHRcdC8vIFx0XHRjb25zb2xlLmxvZyh0aGlzLkVycm9yKTtcclxuXHRcdC8vIFx0fVxyXG5cdFx0Ly8gfVxyXG5cdFx0Ly8gZWxzZXtcdFx0XHRcclxuXHRcdC8vIFx0aWYgKHByb3BlcnR5ID09PSB0aGlzLlNjaGVtYS5QcmltYXJ5S2V5UHJvcGVydHkpXHJcblx0XHQvLyBcdFx0cmV0dXJuO1xyXG5cdFx0Ly8gXHR2YXIgdmFsdWUgPSBwcm9wZXJ0eS5HZXRWYWx1ZSh0aGlzLkFjdHVhbC5Nb2RlbCk7XHJcblx0XHQvLyBcdGlmIChwcm9wZXJ0eS5SZXF1aXJlZCl7XHJcblx0XHQvLyBcdFx0aWYgKHZhbHVlID09PSB1bmRlZmluZWQpe1xyXG5cdFx0Ly8gXHRcdFx0aWYgKHRoaXMuRXJyb3IgPT09IHVuZGVmaW5lZClcclxuXHRcdC8vIFx0XHRcdFx0dGhpcy5FcnJvciA9IG5ldyBMTVMuRXJyb3IoKTtcclxuXHRcdC8vIFx0XHRcdGlmICh0aGlzLkVycm9yLklubmVyRXJyb3JzID09IHVuZGVmaW5lZClcclxuXHRcdC8vIFx0XHRcdFx0dGhpcy5FcnJvci5Jbm5lckVycm9ycyA9IHt9O1xyXG5cdFx0Ly8gXHRcdFx0dGhpcy5FcnJvci5Jbm5lckVycm9yc1twcm9wZXJ0eS5OYW1lXSA9IHtNZXNzYWdlOlwiUmVxdWlyZWQuXCIsIERlc2NyaXB0aW9uOmBQbGVhc2UgcHJvdmlkZSBhIHZhbHVlIGZvciAke3Byb3BlcnR5Lk5hbWV9YH07XHJcblx0XHQvLyBcdFx0fVx0XHRcdFx0XHRcclxuXHRcdC8vIFx0fVx0XHRcdFx0XHRcdFx0XHRcclxuXHRcdC8vIH1cclxuXHRcdFx0XHJcblx0fVxyXG59XHJcbiJdfQ==