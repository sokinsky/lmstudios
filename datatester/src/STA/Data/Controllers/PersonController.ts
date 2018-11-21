import { Controller } from "@lmstudios/data";
import { Person } from "../Models"; 

export class PersonController extends Controller<Person> {
	constructor(actual: Person, proxy: Person) {
		super(actual, proxy);
	}
}