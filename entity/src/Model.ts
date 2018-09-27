import { ConstructorInfo, Type } from "@lmstudios/Reflection";
import { Guid } from "@lmstudios/utilities";
import { Application, Context, Controller } from "./"

export class Model {
	constructor()	{
		var proxy:Model|undefined = new Proxy(this, {
			get: (target, propertyName: string | number | symbol, reciever) => {								
				if (typeof (propertyName) != "string" || propertyName.match(/^_/))
					return Reflect.get(target, propertyName, reciever);
				let value = (<any>this)[propertyName];
				if (value && typeof(value) == "function")
					return Reflect.get(target, propertyName, reciever);
				console.log(propertyName);
				var result = this.__controller.ReadProperty(propertyName);
				return result;
			},
			set: (target, propertyName, propertyValue, reciever) => {
				if (typeof (propertyName) != "string" || propertyName.match(/^_/))
					return Reflect.set(target, propertyName, propertyValue, reciever);	
				return this.__controller.UpdateProperty(propertyName, propertyValue);
			}
		});

		var application = Application.Retrieve();
		if (! application)
			throw new Error("Unable to locate application");
		
		var context = application.Context;
		if (! context)
			throw new Error("Unable to locate context");
		
		var assembly = context.Assembly;
		if (!assembly)
			throw new Error("Unable to locate assembly");
		
		var type = assembly.GetType(this);
		if (! type)
			throw new Error("Unable to locate type");
		this.__type = type;

		var controllerType = assembly.GetType(`${assembly.Name}.Data.Controllers.${type.Name}`);
		if (controllerType) {
			var result = controllerType.Create(context, this);
			this.__controller = <Controller<Context, Model>>result;
		}
		else{
			this.__controller =  new Controller(context, this);
		}

		return proxy;
	}
	public __controller: Controller<Context, Model>;
	public __type:Type;
	public GetType() : Type {
		let result: Type | undefined = this.__controller.Context.Assembly.GetType(this);
		return this.__type;
	}
	public static get __properties():any {
		return {
			ID: Number
		};
	}
}

