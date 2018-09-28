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

		var application = <Application>(<any>window).Application;
		if (! application)
			throw new Error("Unable to locate application");
		if (! application.Context)
			throw new Error("Application does not have a context");
		var type = application.GetType(this);
		if (! type)
			throw new Error("Application does not have type");
		this.__type = type;
	
		this.__controller =  new Controller(application.Context, this);

		return proxy;
	}
	public __controller: Controller<Context, Model>;
	public __type:Type;
	public GetType() : Type {
		return this.__type;
	}
}

