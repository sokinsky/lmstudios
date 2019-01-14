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
const types_1 = require("@lmstudios/types");
const Schema = require("@lmstudios/schema");
const API_1 = require("./API");
const ChangeTracker_1 = require("./ChangeTracker");
const Model_1 = require("./Model");
const Repository_1 = require("./Repository");
class Context {
    constructor() {
        this.API = new API_1.API('');
        this.Tracker = new ChangeTracker_1.ChangeTracker(this);
        this.Schema = new Schema.Context({});
        this.Repositories = [];
        // console.log(apiDomain);
        // this.API = new API(apiDomain);
        // this.API = new API('');
        // this.Schema = new Schema.Context({});
        // this.Schema = new Schema.Context(schemaData);
        var proxy = new Proxy(this, {
            set: (target, propertyName, propertyValue, reciever) => {
                if (propertyValue instanceof Repository_1.Repository) {
                    propertyValue.Name = propertyName;
                    if (this.Repositories.find(x => { return x === propertyValue; }) === undefined) {
                        this.Repositories.push(propertyValue);
                    }
                }
                return Reflect.set(target, propertyName, propertyValue, reciever);
            }
        });
        //this.Initialize();
        return proxy;
        console.log("here");
    }
    Initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            var response = yield this.API.Post("Model/Search", {});
            if (response !== undefined) {
                try {
                    var responseResult = yield response.json();
                    if (responseResult !== undefined && responseResult.Result !== undefined)
                        this.Load(responseResult.Result);
                }
                catch (_a) {
                    console.warn("Initialize returned non json");
                }
            }
        });
    }
    GetRepository(type) {
        var result;
        switch (typeof (type)) {
            case "string":
                result = this.Repositories.find(x => { return x.ModelSchema.Type.FullName == type; });
            case "object":
                if (type instanceof Model_1.Model)
                    result = this.Repositories.find(x => { return x.ModelSchema === type.GetSchema(); });
                else if (type instanceof types_1.Type)
                    result = this.Repositories.find(x => { return x.ModelSchema.Type === type; });
                else if (type instanceof Schema.Model)
                    result = this.Repositories.find(x => { return x.ModelSchema === type; });
                break;
            case "function":
                result = this.Repositories.find(x => { return x.ModelSchema.Type.Constructor === type; });
                break;
        }
        if (result !== undefined)
            return result;
        throw new Error(``);
    }
    Load(models, fromServer) {
        return __awaiter(this, void 0, void 0, function* () {
            models.forEach((bridgeModel) => {
                var dataModel = undefined;
                var dataEntry = this.Tracker.Entries.find(x => x.Model.__controller.ID === bridgeModel.ID);
                if (dataEntry !== undefined)
                    dataModel = dataEntry.Model;
                if (dataModel === undefined) {
                    var dataRepository = this.GetRepository(bridgeModel.Type);
                    dataModel = dataRepository.Local.Select(bridgeModel.Value);
                    if (dataModel === undefined)
                        dataModel = dataRepository.Add(bridgeModel.Value, true);
                    else
                        dataModel.Load(bridgeModel.Value, true);
                }
                else {
                    dataModel.Load(bridgeModel.Value, true);
                }
            });
        });
    }
    SaveChanges() {
        return __awaiter(this, void 0, void 0, function* () {
            let bridgeModels = this.Tracker.GetBridgeChanges();
            var response = yield this.API.Post("Context/SaveChanges", bridgeModels);
            if (response !== undefined) {
                try {
                    var responseResult = yield response.json();
                    if (responseResult !== undefined && responseResult.Result !== undefined)
                        this.Load(responseResult.Result);
                }
                catch (_a) {
                    console.warn("Initialize returned non json");
                }
            }
            return true;
        });
    }
}
exports.Context = Context;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9Db250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSw0Q0FBd0M7QUFDeEMsNENBQTRDO0FBRTVDLCtCQUE0QjtBQUM1QixtREFBZ0Q7QUFDaEQsbUNBQWdDO0FBQ2hDLDZDQUEwQztBQUUxQyxNQUFhLE9BQU87SUFDbkI7UUF1Qk8sUUFBRyxHQUFPLElBQUksU0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RCLFlBQU8sR0FBaUIsSUFBSSw2QkFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hELFdBQU0sR0FBa0IsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRS9DLGlCQUFZLEdBQXVCLEVBQUUsQ0FBQztRQTFCdEMsMEJBQTBCO1FBQzFCLGlDQUFpQztRQUNqQywwQkFBMEI7UUFDMUIsd0NBQXdDO1FBQzlDLGdEQUFnRDtRQUNoRCxJQUFJLEtBQUssR0FBVyxJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUU7WUFDbkMsR0FBRyxFQUFFLENBQUMsTUFBTSxFQUFFLFlBQW1CLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRSxFQUFFO2dCQUM3RCxJQUFJLGFBQWEsWUFBWSx1QkFBVSxFQUFDO29CQUN2QyxhQUFhLENBQUMsSUFBSSxHQUFHLFlBQVksQ0FBQztvQkFDbEMsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLE9BQU8sQ0FBQyxLQUFLLGFBQWEsQ0FBQSxDQUFBLENBQUMsQ0FBQyxLQUFLLFNBQVMsRUFBRTt3QkFDN0UsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7cUJBQ3RDO2lCQUVEO2dCQUNELE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQztZ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QzthQUNKO1lBQ1AsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO0tBQUE7Q0FDRDtBQWxHRCwwQkFrR0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBUeXBlIH0gZnJvbSBcIkBsbXN0dWRpb3MvdHlwZXNcIjtcclxuaW1wb3J0ICogYXMgU2NoZW1hIGZyb20gXCJAbG1zdHVkaW9zL3NjaGVtYVwiO1xyXG5cclxuaW1wb3J0IHsgQVBJIH0gZnJvbSBcIi4vQVBJXCI7XHJcbmltcG9ydCB7IENoYW5nZVRyYWNrZXIgfSBmcm9tIFwiLi9DaGFuZ2VUcmFja2VyXCI7XHJcbmltcG9ydCB7IE1vZGVsIH0gZnJvbSBcIi4vTW9kZWxcIjtcclxuaW1wb3J0IHsgUmVwb3NpdG9yeSB9IGZyb20gXCIuL1JlcG9zaXRvcnlcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBDb250ZXh0IHtcclxuXHRjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhhcGlEb21haW4pO1xyXG4gICAgICAgIC8vIHRoaXMuQVBJID0gbmV3IEFQSShhcGlEb21haW4pO1xyXG4gICAgICAgIC8vIHRoaXMuQVBJID0gbmV3IEFQSSgnJyk7XHJcbiAgICAgICAgLy8gdGhpcy5TY2hlbWEgPSBuZXcgU2NoZW1hLkNvbnRleHQoe30pO1xyXG5cdFx0Ly8gdGhpcy5TY2hlbWEgPSBuZXcgU2NoZW1hLkNvbnRleHQoc2NoZW1hRGF0YSk7XHJcblx0XHR2YXIgcHJveHk6Q29udGV4dCA9IG5ldyBQcm94eSh0aGlzLCB7XHJcblx0XHRcdHNldDogKHRhcmdldCwgcHJvcGVydHlOYW1lOnN0cmluZywgcHJvcGVydHlWYWx1ZSwgcmVjaWV2ZXIpID0+IHtcclxuXHRcdFx0XHRpZiAocHJvcGVydHlWYWx1ZSBpbnN0YW5jZW9mIFJlcG9zaXRvcnkpe1xyXG5cdFx0XHRcdFx0cHJvcGVydHlWYWx1ZS5OYW1lID0gcHJvcGVydHlOYW1lO1xyXG5cdFx0XHRcdFx0aWYgKHRoaXMuUmVwb3NpdG9yaWVzLmZpbmQoeCA9PiB7IHJldHVybiB4ID09PSBwcm9wZXJ0eVZhbHVlfSkgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLlJlcG9zaXRvcmllcy5wdXNoKHByb3BlcnR5VmFsdWUpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHR9XHRcdFx0XHRcdFxyXG5cdFx0XHRcdHJldHVybiBSZWZsZWN0LnNldCh0YXJnZXQsIHByb3BlcnR5TmFtZSwgcHJvcGVydHlWYWx1ZSwgcmVjaWV2ZXIpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdC8vdGhpcy5Jbml0aWFsaXplKCk7XHJcbiAgICAgICAgcmV0dXJuIHByb3h5O1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiaGVyZVwiKTtcclxuICAgIH1cclxuICAgIFxyXG5cdHB1YmxpYyBBUEk6QVBJID0gbmV3IEFQSSgnJyk7XHJcblx0cHVibGljIFRyYWNrZXI6Q2hhbmdlVHJhY2tlciA9IG5ldyBDaGFuZ2VUcmFja2VyKHRoaXMpO1xyXG5cdHB1YmxpYyBTY2hlbWE6U2NoZW1hLkNvbnRleHQgPSBuZXcgU2NoZW1hLkNvbnRleHQoe30pO1xyXG5cclxuXHRwdWJsaWMgUmVwb3NpdG9yaWVzOlJlcG9zaXRvcnk8TW9kZWw+W10gPSBbXTtcclxuXHRwdWJsaWMgYXN5bmMgSW5pdGlhbGl6ZSgpe1xyXG4gICAgICAgIHZhciByZXNwb25zZSA9IGF3YWl0IHRoaXMuQVBJLlBvc3QoXCJNb2RlbC9TZWFyY2hcIiwge30pO1xyXG4gICAgICAgIGlmIChyZXNwb25zZSAhPT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHZhciByZXNwb25zZVJlc3VsdCA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcclxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZVJlc3VsdCAhPT0gdW5kZWZpbmVkICYmIHJlc3BvbnNlUmVzdWx0LlJlc3VsdCAhPT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuTG9hZChyZXNwb25zZVJlc3VsdC5SZXN1bHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkluaXRpYWxpemUgcmV0dXJuZWQgbm9uIGpzb25cIilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHR9XHJcblx0cHVibGljIEdldFJlcG9zaXRvcnkodHlwZTpzdHJpbmd8VHlwZXxTY2hlbWEuTW9kZWx8TW9kZWx8KG5ldyAoLi4uYXJnczogYW55W10pID0+IE1vZGVsKSk6UmVwb3NpdG9yeTxNb2RlbD4ge1xyXG4gICAgICAgIHZhciByZXN1bHQ6UmVwb3NpdG9yeTxNb2RlbD58dW5kZWZpbmVkO1xyXG5cdFx0c3dpdGNoICh0eXBlb2YodHlwZSkpe1xyXG5cdFx0XHRjYXNlIFwic3RyaW5nXCI6XHJcblx0XHRcdFx0cmVzdWx0ID0gdGhpcy5SZXBvc2l0b3JpZXMuZmluZCh4ID0+IHsgcmV0dXJuIHguTW9kZWxTY2hlbWEuVHlwZS5GdWxsTmFtZSA9PSA8c3RyaW5nPnR5cGUgfSk7XHRcdFx0XHRcdFxyXG4gICAgICAgICAgICBjYXNlIFwib2JqZWN0XCI6XHJcblx0XHRcdFx0aWYgKHR5cGUgaW5zdGFuY2VvZiBNb2RlbClcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB0aGlzLlJlcG9zaXRvcmllcy5maW5kKHggPT4geyByZXR1cm4geC5Nb2RlbFNjaGVtYSA9PT0gKDxNb2RlbD50eXBlKS5HZXRTY2hlbWEoKX0pO1xyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodHlwZSBpbnN0YW5jZW9mIFR5cGUpXHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5SZXBvc2l0b3JpZXMuZmluZCh4ID0+IHsgcmV0dXJuIHguTW9kZWxTY2hlbWEuVHlwZSA9PT0gdHlwZTsgfSlcclxuXHRcdFx0XHRlbHNlIGlmICh0eXBlIGluc3RhbmNlb2YgU2NoZW1hLk1vZGVsIClcclxuXHRcdFx0XHRcdHJlc3VsdCA9IHRoaXMuUmVwb3NpdG9yaWVzLmZpbmQoeCA9PiB7IHJldHVybiB4Lk1vZGVsU2NoZW1hID09PSB0eXBlOyB9KTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcImZ1bmN0aW9uXCI6XHJcblx0XHRcdFx0cmVzdWx0ID0gdGhpcy5SZXBvc2l0b3JpZXMuZmluZCh4ID0+IHsgcmV0dXJuIHguTW9kZWxTY2hlbWEuVHlwZS5Db25zdHJ1Y3RvciA9PT0gdHlwZTsgfSk7XHJcbiAgICBcdFx0XHRicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlc3VsdCAhPT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKGBgKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBhc3luYyBMb2FkKG1vZGVsczoge0lEOnN0cmluZyxUeXBlOnN0cmluZyxWYWx1ZTphbnl9W10sIGZyb21TZXJ2ZXI/OmJvb2xlYW4pIHtcdFxyXG5cdFx0bW9kZWxzLmZvckVhY2goKGJyaWRnZU1vZGVsOiBhbnkpID0+IHtcclxuXHRcdFx0dmFyIGRhdGFNb2RlbCA9IHVuZGVmaW5lZDtcclxuXHRcdFx0dmFyIGRhdGFFbnRyeSA9IHRoaXMuVHJhY2tlci5FbnRyaWVzLmZpbmQoeCA9PiB4Lk1vZGVsLl9fY29udHJvbGxlci5JRCA9PT0gYnJpZGdlTW9kZWwuSUQpO1xyXG5cdFx0XHRpZiAoZGF0YUVudHJ5ICE9PSB1bmRlZmluZWQpXHJcblx0XHRcdFx0ZGF0YU1vZGVsID0gZGF0YUVudHJ5Lk1vZGVsO1xyXG5cdFx0XHRpZiAoZGF0YU1vZGVsID09PSB1bmRlZmluZWQpe1xyXG5cdFx0XHRcdHZhciBkYXRhUmVwb3NpdG9yeSA9IHRoaXMuR2V0UmVwb3NpdG9yeShicmlkZ2VNb2RlbC5UeXBlKTtcclxuXHRcdFx0XHRkYXRhTW9kZWwgPSBkYXRhUmVwb3NpdG9yeS5Mb2NhbC5TZWxlY3QoYnJpZGdlTW9kZWwuVmFsdWUpO1xyXG5cdFx0XHRcdGlmIChkYXRhTW9kZWwgPT09IHVuZGVmaW5lZClcclxuXHRcdFx0XHRcdGRhdGFNb2RlbCA9IGRhdGFSZXBvc2l0b3J5LkFkZChicmlkZ2VNb2RlbC5WYWx1ZSwgdHJ1ZSk7XHRcclxuXHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRkYXRhTW9kZWwuTG9hZChicmlkZ2VNb2RlbC5WYWx1ZSwgdHJ1ZSk7XHRcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNle1xyXG5cdFx0XHRcdGRhdGFNb2RlbC5Mb2FkKGJyaWRnZU1vZGVsLlZhbHVlLCB0cnVlKTtcclxuXHRcdFx0fVx0XHRcdFx0XHRcdFx0XHJcblx0XHR9KTtcclxuXHR9XHJcblx0cHVibGljIGFzeW5jIFNhdmVDaGFuZ2VzKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgICAgIGxldCBicmlkZ2VNb2RlbHM6IGFueVtdID0gdGhpcy5UcmFja2VyLkdldEJyaWRnZUNoYW5nZXMoKTtcclxuICAgICAgICB2YXIgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLkFQSS5Qb3N0KFwiQ29udGV4dC9TYXZlQ2hhbmdlc1wiLCBicmlkZ2VNb2RlbHMpO1xyXG4gICAgICAgIGlmIChyZXNwb25zZSAhPT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHZhciByZXNwb25zZVJlc3VsdCA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcclxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZVJlc3VsdCAhPT0gdW5kZWZpbmVkICYmIHJlc3BvbnNlUmVzdWx0LlJlc3VsdCAhPT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuTG9hZChyZXNwb25zZVJlc3VsdC5SZXN1bHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkluaXRpYWxpemUgcmV0dXJuZWQgbm9uIGpzb25cIilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cdFxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG59XHJcblxyXG4iXX0=