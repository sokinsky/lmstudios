import * as LMSData from "@lmstudios/data";
import { Injectable } from "@angular/core";
import { Email, Person, PersonEmail, User } from "./Models";

const schema = {
  "Name": null,
  "Models": [
    {
      "FullName": "STA.Data.Models.Email",
      "Keys": [
        {
          "Name": "PK_Email",
          "Properties": [
            {
              "Model": "STA.Data.Models.Email",
              "Name": "ID"
            }
          ]
        }
      ],
      "Properties": [
        {
          "Name": "ID",
          "PropertyType": "number",
          "Required": true
        },
        {
          "Name": "Address",
          "PropertyType": "string"
        }
      ]
    },
    {
      "FullName": "STA.Data.Models.Person",
      "Keys": [
        {
          "Name": "PK_Person",
          "Properties": [
            {
              "Model": "STA.Data.Models.Person",
              "Name": "ID"
            }
          ]
        }
      ],
      "Properties": [
        {
          "Name": "PeopleEmails",
          "PropertyType": "Collection<api.sta.com.Data.Models.PersonEmail>",
          "Relationship": {
            "ID": {
              "Model": "STA.Data.Models.PersonEmail",
              "Name": "PersonID"
            }
          }
        },
        {
          "Name": "User",
          "PropertyType": "api.sta.com.Data.Models.User",
          "Relationship": {
            "ID": {
              "Model": "STA.Data.Models.User",
              "Name": "ID"
            }
          }
        },
        {
          "Name": "ID",
          "PropertyType": "number",
          "Required": true,
          "Optional": [
            {
              "Model": "STA.Data.Models.User",
              "Name": "ID"
            }
          ],
          "References": [
            {
              "Model": "STA.Data.Models.Person",
              "Name": "User"
            }
          ]
        },
        {
          "Name": "FirstName",
          "PropertyType": "string",
          "Required": true
        },
        {
          "Name": "MiddleName",
          "PropertyType": "string"
        },
        {
          "Name": "LastName",
          "PropertyType": "string",
          "Required": true
        },
        {
          "Name": "DOB",
          "PropertyType": "Date"
        }
      ]
    },
    {
      "FullName": "STA.Data.Models.PersonEmail",
      "Keys": [
        {
          "Name": "PK_PersonEmail",
          "Properties": [
            {
              "Model": "STA.Data.Models.PersonEmail",
              "Name": "ID"
            }
          ]
        }
      ],
      "Properties": [
        {
          "Name": "Email",
          "PropertyType": "api.sta.com.Data.Models.Email",
          "Relationship": {
            "EmailID": {
              "Model": "STA.Data.Models.Email",
              "Name": "ID"
            }
          }
        },
        {
          "Name": "Person",
          "PropertyType": "api.sta.com.Data.Models.Person",
          "Relationship": {
            "PersonID": {
              "Model": "STA.Data.Models.Person",
              "Name": "ID"
            }
          }
        },
        {
          "Name": "ID",
          "PropertyType": "number",
          "Required": true
        },
        {
          "Name": "Name",
          "PropertyType": "string"
        },
        {
          "Name": "PersonID",
          "PropertyType": "number",
          "References": [
            {
              "Model": "STA.Data.Models.PersonEmail",
              "Name": "Person"
            }
          ]
        },
        {
          "Name": "EmailID",
          "PropertyType": "number",
          "References": [
            {
              "Model": "STA.Data.Models.PersonEmail",
              "Name": "Email"
            }
          ]
        }
      ]
    },
    {
      "FullName": "STA.Data.Models.User",
      "Keys": [
        {
          "Name": "PK_User",
          "Properties": [
            {
              "Model": "STA.Data.Models.User",
              "Name": "ID"
            }
          ]
        }
      ],
      "Properties": [
        {
          "Name": "Person",
          "PropertyType": "api.sta.com.Data.Models.Person",
          "Relationship": {
            "ID": {
              "Model": "STA.Data.Models.Person",
              "Name": "ID"
            }
          }
        },
        {
          "Name": "ID",
          "PropertyType": "number",
          "Required": true,
          "Principal": {
            "Model": "STA.Data.Models.Person",
            "Name": "ID"
          },
          "References": [
            {
              "Model": "STA.Data.Models.User",
              "Name": "Person"
            }
          ]
        },
        {
          "Name": "Username",
          "PropertyType": "string"
        },
        {
          "Name": "Password",
          "PropertyType": "string"
        }
      ]
    }
  ]
};


@LMSData.Decorators.Class("STA.Data.Context")
@Injectable({ providedIn: "root" })
export class Context extends LMSData.Context {
	constructor(){
		super("", schema);
}
	public People?: LMSData.Repository<Person> = new LMSData.Repository(this, Person);
	public Users?:LMSData.Repository<User> = new LMSData.Repository(this, User);
	public Emails?:LMSData.Repository<Email> = new LMSData.Repository(this, Email);
	public PeopleEmails?:LMSData.Repository<PersonEmail> = new LMSData.Repository(this, PersonEmail);
}
