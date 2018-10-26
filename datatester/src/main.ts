import * as STA from "./STA";
import * as LMSData from "@lmstudios/data";

(async function(){
    var context = new STA.Data.Context();
    var person = await context.People.Select(1);
    console.log(person);
    // if (person !== undefined){
    //     console.log(person);
    // }
    //var person = context.People.Add({});
    if (person !== undefined){ 
         console.log(await person.Server.PeopleEmails);
    }

}())