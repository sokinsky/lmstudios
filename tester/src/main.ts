import "bootstrap/dist/css/bootstrap.min.css";
import "reflect-metadata";
import "zone.js";
import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { Application } from "./STA/";
const rootElemTagName = "app"; // Update this if you change your root component selector

import Module from "./module";

const application:Application = new Application();
application.Start(()=>{
	const platform = platformBrowserDynamic();
	function bootApplication() {
		return platform.bootstrapModule(Module);
	}

	(async function () {
		try {
			await bootApplication();
		}
		catch (e) {
			console.error(e);
		}
	}());
});

