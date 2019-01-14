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
const Model_1 = require("./Model");
const ChangeTracker_1 = require("./ChangeTracker");
class Repository {
    constructor(context, model) {
        this.__items = [];
        this.Name = "";
        this.Local = new LocalRepository(this);
        this.Server = new ServerRepository(this);
        this.Context = context;
        var modelSchema = undefined;
        var modelType = types_1.Type.GetType(model);
        if (modelType !== undefined)
            modelSchema = context.Schema.Models.find(x => { return x.Type === modelType; });
        if (modelSchema === undefined)
            throw new Error(``);
        this.ModelSchema = modelSchema;
    }
    GetType() {
        var result = types_1.Type.GetType(this.prototype);
        if (result !== undefined)
            return result;
        throw new Error(``);
    }
    get Items() {
        return this.__items;
    }
    *[Symbol.iterator]() {
        for (const value of this.Items) {
            yield value;
        }
    }
    Create() {
        if (this.ModelSchema.Type.Constructor !== undefined)
            return new this.ModelSchema.Type.Constructor(this.Context);
        throw new Error(``);
    }
    Add(value, fromServer) {
        let result;
        if (value === undefined) {
            result = this.Add({});
        }
        else if (value instanceof Model_1.Model) {
            if (this.ModelSchema.Type !== value.GetType())
                throw new Error(``);
            result = this.Items.find(x => { return x === value; });
            if (result === undefined) {
                result = value;
                this.Items.push(result);
                if (result.__controller.Status.Change.Model === ChangeTracker_1.ChangeStatus.Detached)
                    result.__controller.Status.Change.Model = ChangeTracker_1.ChangeStatus.Added;
            }
        }
        else {
            result = this.Local.Select(value);
            if (result === undefined) {
                result = this.Create();
                result.Load(value, fromServer);
                result = this.Add(result, fromServer);
            }
        }
        return result;
    }
    Remove(value) {
        var index = this.Items.indexOf(value);
        if (index >= 0)
            this.Items.splice(index, 1);
    }
    Select(value) {
        return __awaiter(this, void 0, void 0, function* () {
            var result = this.Local.Select(value);
            if (!result)
                result = yield this.Server.Select(value);
            return result;
        });
    }
    Search(...values) {
        return __awaiter(this, void 0, void 0, function* () {
            if (values === undefined || values.length === 0)
                return [];
            if (values.length === 1 && Array.isArray(values[0]))
                values = values[0];
            yield this.Server.Search(...values);
            return this.Local.Search(...values);
        });
    }
}
exports.Repository = Repository;
class LocalRepository {
    constructor(repository) {
        this.Repository = repository;
    }
    get Items() {
        return this.Repository.Items;
    }
    Select(value) {
        var filters = [];
        for (let key of this.Repository.ModelSchema.Keys) {
            var filter = {};
            for (let property of key.Properties) {
                if (property.GetValue(value) === undefined) {
                    filter = undefined;
                    break;
                }
                property.SetValue(filter, property.GetValue(value));
            }
            if (filter !== undefined) {
                var localResults = this.Search(filter);
                if (localResults.length == 1)
                    return localResults[0];
            }
        }
        return undefined;
    }
    Search(...values) {
        var results = [];
        for (let value of values) {
            for (let item of this.Repository.Items) {
                var include = true;
                for (var key in value) {
                    var property = this.Repository.ModelSchema.GetProperty(key);
                    if (property !== undefined) {
                        if (property.GetValue(item) !== property.GetValue(value))
                            include = false;
                    }
                }
                if (include) {
                    var included = results.find(x => { return (x === item); });
                    if (!included)
                        results.push(item);
                }
            }
        }
        return results;
    }
}
exports.LocalRepository = LocalRepository;
class ServerRepository {
    constructor(repository) {
        this.Repository = repository;
    }
    Select(value) {
        return __awaiter(this, void 0, void 0, function* () {
            var body = {
                Type: this.Repository.ModelSchema.Type.FullName,
                Value: value
            };
            var response = yield this.Repository.Context.API.Post("Model/Select", body);
            if (response !== undefined) {
                try {
                    var responseResult = yield response.json();
                    if (responseResult !== undefined && responseResult.Result !== undefined)
                        this.Repository.Context.Load(responseResult.Result);
                }
                catch (_a) {
                    console.warn("Select returned non json");
                }
            }
            return this.Repository.Local.Select(value);
        });
    }
    Search(...values) {
        return __awaiter(this, void 0, void 0, function* () {
            var body = {
                Type: this.Repository.ModelSchema.Type.FullName,
                Values: values
            };
            var response = yield this.Repository.Context.API.Post("Model/Search", body);
            if (response !== undefined) {
                try {
                    var responseResult = yield response.json();
                    if (responseResult !== undefined && responseResult.Result !== undefined)
                        this.Repository.Context.Load(responseResult.Result);
                }
                catch (_a) {
                    console.warn("Search returned non json");
                }
            }
            return this.Repository.Local.Search(...values);
        });
    }
}
exports.ServerRepository = ServerRepository;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVwb3NpdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9SZXBvc2l0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSw0Q0FBd0M7QUFHeEMsbUNBQWdDO0FBQ2hDLG1EQUErQztBQUUvQyxNQUFhLFVBQVU7SUFDdEIsWUFBWSxPQUFlLEVBQUUsS0FBdUM7UUFpQjVELFlBQU8sR0FBWSxFQUFFLENBQUM7UUFXdkIsU0FBSSxHQUFVLEVBQUUsQ0FBQztRQUVkLFVBQUssR0FBNEIsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUQsV0FBTSxHQUE2QixJQUFJLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBOUI5RCxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLFdBQVcsR0FBRyxTQUFTLENBQUM7UUFDNUIsSUFBSSxTQUFTLEdBQUcsWUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNwQyxJQUFJLFNBQVMsS0FBSyxTQUFTO1lBQ3ZCLFdBQVcsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxPQUFPLENBQUMsQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFBLENBQUEsQ0FBQyxDQUFDLENBQUM7UUFDbEYsSUFBSSxXQUFXLEtBQUssU0FBUztZQUN6QixNQUFNLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0lBQ25DLENBQUM7SUFFTSxPQUFPO1FBQ1YsSUFBSSxNQUFNLEdBQUcsWUFBSSxDQUFDLE9BQU8sQ0FBTyxJQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDakQsSUFBSSxNQUFNLEtBQUssU0FBUztZQUNwQixPQUFPLE1BQU0sQ0FBQztRQUNsQixNQUFNLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FB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NUUsSUFBSSxRQUFRLEtBQUssU0FBUyxFQUFDO2dCQUN2QixJQUFJO29CQUNBLElBQUksY0FBYyxHQUFHLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO29CQUMzQyxJQUFJLGNBQWMsS0FBSyxTQUFTLElBQUksY0FBYyxDQUFDLE1BQU0sS0FBSyxTQUFTO3dCQUNuRSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUMzRDtnQkFDRCxXQUFNO29CQUNGLE9BQU8sQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQTtpQkFDM0M7YUFDSjtZQUNQLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUM7UUFDaEQsQ0FBQztLQUFBO0NBQ0Q7QUF6Q0QsNENBeUNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVHlwZSB9IGZyb20gXCJAbG1zdHVkaW9zL3R5cGVzXCI7XHJcbmltcG9ydCAqIGFzIFNjaGVtYSBmcm9tIFwiQGxtc3R1ZGlvcy9zY2hlbWFcIjtcclxuaW1wb3J0IHsgQ29udGV4dCB9IGZyb20gXCIuL0NvbnRleHRcIjtcclxuaW1wb3J0IHsgTW9kZWwgfSBmcm9tIFwiLi9Nb2RlbFwiO1xyXG5pbXBvcnQgeyBDaGFuZ2VTdGF0dXMgfSBmcm9tIFwiLi9DaGFuZ2VUcmFja2VyXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgUmVwb3NpdG9yeTxUTW9kZWwgZXh0ZW5kcyBNb2RlbD4ge1xyXG5cdGNvbnN0cnVjdG9yKGNvbnRleHQ6Q29udGV4dCwgbW9kZWw6IChuZXcgKC4uLmFyZ3M6IGFueVtdKSA9PiBUTW9kZWwpKSB7XHJcbiAgICAgICAgdGhpcy5Db250ZXh0ID0gY29udGV4dDtcclxuICAgICAgICB2YXIgbW9kZWxTY2hlbWEgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgdmFyIG1vZGVsVHlwZSA9IFR5cGUuR2V0VHlwZShtb2RlbCk7XHJcbiAgICAgICAgaWYgKG1vZGVsVHlwZSAhPT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICBtb2RlbFNjaGVtYSA9IGNvbnRleHQuU2NoZW1hLk1vZGVscy5maW5kKHggPT4geyByZXR1cm4geC5UeXBlID09PSBtb2RlbFR5cGV9KTtcclxuICAgICAgICBpZiAobW9kZWxTY2hlbWEgPT09IHVuZGVmaW5lZClcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBgKTtcclxuICAgICAgICB0aGlzLk1vZGVsU2NoZW1hID0gbW9kZWxTY2hlbWE7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBHZXRUeXBlKCk6VHlwZXtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gVHlwZS5HZXRUeXBlKCg8YW55PnRoaXMpLnByb3RvdHlwZSk7XHJcbiAgICAgICAgaWYgKHJlc3VsdCAhPT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgYCk7XHJcbiAgICB9XHJcblx0cHJpdmF0ZSBfX2l0ZW1zOlRNb2RlbFtdID0gW107XHJcblx0cHVibGljIGdldCBJdGVtcygpOlRNb2RlbFtde1xyXG5cdFx0cmV0dXJuIHRoaXMuX19pdGVtcztcclxuXHR9XHJcblx0cHVibGljICpbU3ltYm9sLml0ZXJhdG9yXSgpIHtcclxuXHRcdGZvciAoY29uc3QgdmFsdWUgb2YgdGhpcy5JdGVtcykge1xyXG5cdFx0XHR5aWVsZCB2YWx1ZTtcclxuXHRcdH1cclxuXHR9XHJcbiAgICBwdWJsaWMgQ29udGV4dDpDb250ZXh0O1xyXG4gICAgcHVibGljIE1vZGVsU2NoZW1hOlNjaGVtYS5Nb2RlbDtcclxuXHRwdWJsaWMgTmFtZTpzdHJpbmcgPSBcIlwiO1xyXG5cclxuICAgIHB1YmxpYyBMb2NhbDogTG9jYWxSZXBvc2l0b3J5PFRNb2RlbD4gPSBuZXcgTG9jYWxSZXBvc2l0b3J5KHRoaXMpO1xyXG5cdHB1YmxpYyBTZXJ2ZXI6IFNlcnZlclJlcG9zaXRvcnk8VE1vZGVsPiA9IG5ldyBTZXJ2ZXJSZXBvc2l0b3J5KHRoaXMpO1xyXG5cclxuXHRwdWJsaWMgQ3JlYXRlKCk6VE1vZGVse1xyXG4gICAgICAgIGlmICh0aGlzLk1vZGVsU2NoZW1hLlR5cGUuQ29uc3RydWN0b3IgIT09IHVuZGVmaW5lZClcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzLk1vZGVsU2NoZW1hLlR5cGUuQ29uc3RydWN0b3IodGhpcy5Db250ZXh0KTtcclxuXHRcdHRocm93IG5ldyBFcnJvcihgYCk7XHJcblx0fVxyXG5cdHB1YmxpYyBBZGQodmFsdWU/OlRNb2RlbHxQYXJ0aWFsPFRNb2RlbD4sIGZyb21TZXJ2ZXI/OmJvb2xlYW4pOlRNb2RlbHtcdFxyXG4gICAgICAgIGxldCByZXN1bHQ6VE1vZGVsfHVuZGVmaW5lZDtcdFxyXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5BZGQoe30pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE1vZGVsKXtcclxuICAgICAgICAgICAgaWYgKHRoaXMuTW9kZWxTY2hlbWEuVHlwZSAhPT0gdmFsdWUuR2V0VHlwZSgpKVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBgKTtcclxuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5JdGVtcy5maW5kKHggPT4geyByZXR1cm4geCA9PT0gdmFsdWUgfSk7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuSXRlbXMucHVzaChyZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5fX2NvbnRyb2xsZXIuU3RhdHVzLkNoYW5nZS5Nb2RlbCA9PT0gQ2hhbmdlU3RhdHVzLkRldGFjaGVkKVxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5fX2NvbnRyb2xsZXIuU3RhdHVzLkNoYW5nZS5Nb2RlbCA9IENoYW5nZVN0YXR1cy5BZGRlZDsgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHRcclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5Mb2NhbC5TZWxlY3QodmFsdWUpO1xyXG4gICAgICAgICAgICBpZiAocmVzdWx0ID09PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5DcmVhdGUoKTtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5Mb2FkKHZhbHVlLCBmcm9tU2VydmVyKTtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuQWRkKHJlc3VsdCwgZnJvbVNlcnZlcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHRwdWJsaWMgUmVtb3ZlKHZhbHVlOlRNb2RlbCl7XHRcdFxyXG5cdFx0dmFyIGluZGV4ID0gdGhpcy5JdGVtcy5pbmRleE9mKHZhbHVlKTtcclxuXHRcdGlmIChpbmRleCA+PSAwKVxyXG5cdFx0XHR0aGlzLkl0ZW1zLnNwbGljZShpbmRleCwgMSk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgYXN5bmMgU2VsZWN0KHZhbHVlOlBhcnRpYWw8VE1vZGVsPik6UHJvbWlzZTxUTW9kZWx8dW5kZWZpbmVkPiB7XHJcblx0XHR2YXIgcmVzdWx0ID0gdGhpcy5Mb2NhbC5TZWxlY3QodmFsdWUpO1xyXG5cdFx0aWYgKCFyZXN1bHQpXHJcblx0XHRcdHJlc3VsdCA9IGF3YWl0IHRoaXMuU2VydmVyLlNlbGVjdCh2YWx1ZSk7XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHRwdWJsaWMgYXN5bmMgU2VhcmNoKC4uLnZhbHVlczphbnlbXSk6UHJvbWlzZTxUTW9kZWxbXT57XHJcblx0XHRpZiAodmFsdWVzID09PSB1bmRlZmluZWQgfHwgdmFsdWVzLmxlbmd0aCA9PT0gMClcclxuXHRcdFx0cmV0dXJuIFtdO1xyXG5cdFx0aWYgKHZhbHVlcy5sZW5ndGggPT09IDEgJiYgQXJyYXkuaXNBcnJheSh2YWx1ZXNbMF0pKVxyXG5cdFx0XHR2YWx1ZXMgPSB2YWx1ZXNbMF07XHJcblxyXG5cdFx0YXdhaXQgdGhpcy5TZXJ2ZXIuU2VhcmNoKC4uLnZhbHVlcyk7XHJcblx0XHRyZXR1cm4gdGhpcy5Mb2NhbC5TZWFyY2goLi4udmFsdWVzKTtcclxuXHR9XHJcbn1cclxuZXhwb3J0IGNsYXNzIExvY2FsUmVwb3NpdG9yeTxUTW9kZWwgZXh0ZW5kcyBNb2RlbD4ge1xyXG4gICAgY29uc3RydWN0b3IocmVwb3NpdG9yeTogUmVwb3NpdG9yeTxUTW9kZWw+KSB7XHJcbiAgICAgICAgdGhpcy5SZXBvc2l0b3J5ID0gcmVwb3NpdG9yeTtcclxuICAgIH1cclxuXHRwdWJsaWMgUmVwb3NpdG9yeTogUmVwb3NpdG9yeTxUTW9kZWw+O1xyXG5cdHB1YmxpYyBnZXQgSXRlbXMoKTpUTW9kZWxbXXtcclxuXHRcdHJldHVybiB0aGlzLlJlcG9zaXRvcnkuSXRlbXM7XHJcblx0fVxyXG5cclxuICAgIHB1YmxpYyBTZWxlY3QodmFsdWU6UGFydGlhbDxUTW9kZWw+KSA6IFRNb2RlbHx1bmRlZmluZWQge1x0XHRcdFx0XHJcbiAgICAgICAgdmFyIGZpbHRlcnM6QXJyYXk8UGFydGlhbDxUTW9kZWw+PiA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGtleSBvZiB0aGlzLlJlcG9zaXRvcnkuTW9kZWxTY2hlbWEuS2V5cyl7XHJcbiAgICAgICAgICAgIHZhciBmaWx0ZXI6UGFydGlhbDxUTW9kZWw+fHVuZGVmaW5lZCA9IHt9O1xyXG4gICAgICAgICAgICBmb3IgKGxldCBwcm9wZXJ0eSBvZiBrZXkuUHJvcGVydGllcyl7XHJcbiAgICAgICAgICAgICAgICBpZiAocHJvcGVydHkuR2V0VmFsdWUodmFsdWUpID09PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlciA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHByb3BlcnR5LlNldFZhbHVlKGZpbHRlciwgcHJvcGVydHkuR2V0VmFsdWUodmFsdWUpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZmlsdGVyICE9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICAgICAgdmFyIGxvY2FsUmVzdWx0cyA9IHRoaXMuU2VhcmNoKGZpbHRlcik7XHJcbiAgICAgICAgICAgICAgICBpZiAobG9jYWxSZXN1bHRzLmxlbmd0aCA9PSAxKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbFJlc3VsdHNbMF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xyXG5cdH1cclxuXHRwdWJsaWMgU2VhcmNoKC4uLnZhbHVlczphbnlbXSk6VE1vZGVsW117XHJcblx0XHR2YXIgcmVzdWx0czpUTW9kZWxbXSA9IFtdO1xyXG5cdFx0Zm9yIChsZXQgdmFsdWUgb2YgdmFsdWVzKXtcclxuXHRcdFx0Zm9yIChsZXQgaXRlbSBvZiB0aGlzLlJlcG9zaXRvcnkuSXRlbXMpe1xyXG5cdFx0XHRcdHZhciBpbmNsdWRlID0gdHJ1ZTtcclxuXHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gdmFsdWUpe1xyXG5cdFx0XHRcdFx0dmFyIHByb3BlcnR5ID0gdGhpcy5SZXBvc2l0b3J5Lk1vZGVsU2NoZW1hLkdldFByb3BlcnR5KGtleSk7XHJcblx0XHRcdFx0XHRpZiAocHJvcGVydHkgIT09IHVuZGVmaW5lZCl7XHJcblx0XHRcdFx0XHRcdGlmIChwcm9wZXJ0eS5HZXRWYWx1ZShpdGVtKSAhPT0gcHJvcGVydHkuR2V0VmFsdWUodmFsdWUpKVxyXG5cdFx0XHRcdFx0XHRcdGluY2x1ZGUgPSBmYWxzZTtcclxuXHRcdFx0XHRcdH1cdFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoaW5jbHVkZSl7XHJcblx0XHRcdFx0XHR2YXIgaW5jbHVkZWQgPSByZXN1bHRzLmZpbmQoeCA9PiB7IHJldHVybiAoeCA9PT0gaXRlbSk7IH0pO1xyXG5cdFx0XHRcdFx0aWYgKCFpbmNsdWRlZClcclxuXHRcdFx0XHRcdFx0cmVzdWx0cy5wdXNoKGl0ZW0pO1x0XHRcdFx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdH1cdFxyXG5cdFx0XHR9XHRcdFx0XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gcmVzdWx0cztcclxuXHR9XHJcbn1cclxuZXhwb3J0IGNsYXNzIFNlcnZlclJlcG9zaXRvcnk8VE1vZGVsIGV4dGVuZHMgTW9kZWw+IHtcclxuICAgIGNvbnN0cnVjdG9yKHJlcG9zaXRvcnk6IFJlcG9zaXRvcnk8VE1vZGVsPikge1xyXG4gICAgICAgIHRoaXMuUmVwb3NpdG9yeSA9IHJlcG9zaXRvcnk7XHJcbiAgICB9XHJcblx0cHVibGljIFJlcG9zaXRvcnk6IFJlcG9zaXRvcnk8VE1vZGVsPjtcclxuXHRwdWJsaWMgYXN5bmMgU2VsZWN0KHZhbHVlOiBQYXJ0aWFsPFRNb2RlbD4pIDogUHJvbWlzZTxUTW9kZWx8dW5kZWZpbmVkPiB7XHJcblx0XHR2YXIgYm9keSA9IHtcclxuXHRcdFx0VHlwZTogdGhpcy5SZXBvc2l0b3J5Lk1vZGVsU2NoZW1hLlR5cGUuRnVsbE5hbWUsXHJcblx0XHRcdFZhbHVlOiB2YWx1ZVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIHJlc3BvbnNlID0gYXdhaXQgdGhpcy5SZXBvc2l0b3J5LkNvbnRleHQuQVBJLlBvc3QoXCJNb2RlbC9TZWxlY3RcIiwgYm9keSk7XHJcbiAgICAgICAgaWYgKHJlc3BvbnNlICE9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlc3BvbnNlUmVzdWx0ID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlUmVzdWx0ICE9PSB1bmRlZmluZWQgJiYgcmVzcG9uc2VSZXN1bHQuUmVzdWx0ICE9PSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5SZXBvc2l0b3J5LkNvbnRleHQuTG9hZChyZXNwb25zZVJlc3VsdC5SZXN1bHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIlNlbGVjdCByZXR1cm5lZCBub24ganNvblwiKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLlJlcG9zaXRvcnkuTG9jYWwuU2VsZWN0KHZhbHVlKTtcclxuXHR9XHJcblx0cHVibGljIGFzeW5jIFNlYXJjaCguLi52YWx1ZXM6YW55W10pOlByb21pc2U8VE1vZGVsW10+e1xyXG5cdFx0dmFyIGJvZHkgPSB7XHJcblx0XHRcdFR5cGU6IHRoaXMuUmVwb3NpdG9yeS5Nb2RlbFNjaGVtYS5UeXBlLkZ1bGxOYW1lLFxyXG5cdFx0XHRWYWx1ZXM6dmFsdWVzXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciByZXNwb25zZSA9IGF3YWl0IHRoaXMuUmVwb3NpdG9yeS5Db250ZXh0LkFQSS5Qb3N0KFwiTW9kZWwvU2VhcmNoXCIsIGJvZHkpO1xyXG4gICAgICAgIGlmIChyZXNwb25zZSAhPT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHZhciByZXNwb25zZVJlc3VsdCA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcclxuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZVJlc3VsdCAhPT0gdW5kZWZpbmVkICYmIHJlc3BvbnNlUmVzdWx0LlJlc3VsdCAhPT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuUmVwb3NpdG9yeS5Db250ZXh0LkxvYWQocmVzcG9uc2VSZXN1bHQuUmVzdWx0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJTZWFyY2ggcmV0dXJuZWQgbm9uIGpzb25cIilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHRcdHJldHVybiB0aGlzLlJlcG9zaXRvcnkuTG9jYWwuU2VhcmNoKC4uLnZhbHVlcyk7XHJcblx0fVxyXG59Il19