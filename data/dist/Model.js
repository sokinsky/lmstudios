"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
const Controller_1 = require("./Controller");
let Model = class Model {
    constructor(context, data) {
        this.__context = context;
        this.__type = (this.__proto__).type;
        var proxy = new Proxy(this, {
            get: (target, propertyName, reciever) => {
                let property = this.GetType().GetProperty(propertyName);
                if (property === undefined)
                    return Reflect.get(target, propertyName, reciever);
                return this.__controller.GetValue(property);
            },
            set: (target, propertyName, propertyValue, reciever) => {
                let property = this.GetType().GetProperty(propertyName);
                if (property !== undefined) {
                    this.__controller.SetValue(property, propertyValue);
                    return true;
                }
                return true;
            }
        });
        this.Server = new Proxy(this, {
            get: (target, propertyName, reciever) => __awaiter(this, void 0, void 0, function* () {
                let property = this.GetType().GetProperty(propertyName);
                if (property === undefined)
                    return Reflect.get(target, propertyName, reciever);
                return this.__controller.GetValueAsync(property);
            })
        });
        var createController = (this.__proto__).modelController;
        if (createController !== undefined)
            this.__controller = new (createController())(context, this, proxy);
        else
            this.__controller = new Controller_1.Controller(context, this, proxy);
        return proxy;
    }
    GetType() {
        return this.__type;
    }
    GetSchema() {
        var result = this.__context.Schema.Models.find(x => { return x.Type === this.GetType(); });
        if (result !== undefined)
            return result;
        throw new Error(`Model.GetSchema():Unable to find Schema`);
    }
    Delete() {
        var repository = this.__controller.Context.GetRepository(this.GetSchema());
        repository.Remove(this);
    }
    Load(value, server) {
        this.__controller.Load(value, server);
    }
    GetValue(property) {
        return this.__controller.GetValue(property);
    }
    SetValue(property, value) {
        this.__controller.SetValue(property, value);
    }
    toString() {
        return this.__controller.toString();
    }
    toJson() {
        return JSON.stringify(this.__controller.Values.Local, null, "\t");
    }
    Undo(property) {
        this.__controller.Undo(property);
    }
    Validate() {
        this.__controller.Validate();
    }
    Duplicate() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.__controller.Duplicate();
        });
    }
};
Model = __decorate([
    types_1.TypeDecorator("LMS.Data.Model")
], Model);
exports.Model = Model;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvTW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDRDQUFpRTtBQUdqRSw2Q0FBMEM7QUFJMUMsSUFBYSxLQUFLLEdBQWxCLE1BQWEsS0FBSztJQUNqQixZQUFZLE9BQWUsRUFBRSxJQUFvQjtRQUMxQyxJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQztRQUMvQixJQUFJLENBQUMsTUFBTSxHQUFHLENBQU8sSUFBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUUzQyxJQUFJLEtBQUssR0FBbUIsSUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFO1lBQzNDLEdBQUcsRUFBRSxDQUFDLE1BQU0sRUFBRSxZQUFvQixFQUFFLFFBQVEsRUFBRSxFQUFFO2dCQUMvQyxJQUFJLFFBQVEsR0FBc0IsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDM0UsSUFBSSxRQUFRLEtBQUssU0FBUztvQkFDekIsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQ3BELE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDN0MsQ0FBQztZQUNELEdBQUcsRUFBRSxDQUFDLE1BQU0sRUFBRSxZQUFtQixFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUUsRUFBRTtnQkFDN0QsSUFBSSxRQUFRLEdBQXNCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQzNFLElBQUksUUFBUSxLQUFLLFNBQVMsRUFBQztvQkFDMUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDO29CQUNwRCxPQUFPLElBQUksQ0FBQztpQkFD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U0FBUzs7WUFDckIsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3RDLENBQUM7S0FBQTtDQUNELENBQUE7QUFyRlksS0FBSztJQURqQixxQkFBYSxDQUFDLGdCQUFnQixDQUFDO0dBQ25CLEtBQUssQ0FxRmpCO0FBckZZLHNCQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVHlwZSwgVHlwZURlY29yYXRvciwgUHJvcGVydHkgfSBmcm9tIFwiQGxtc3R1ZGlvcy90eXBlc1wiO1xyXG5pbXBvcnQgKiBhcyBTY2hlbWEgZnJvbSBcIkBsbXN0dWRpb3Mvc2NoZW1hXCI7XHJcbmltcG9ydCB7IENvbnRleHQgfSBmcm9tIFwiLi9Db250ZXh0XCI7XHJcbmltcG9ydCB7IENvbnRyb2xsZXIgfSBmcm9tIFwiLi9Db250cm9sbGVyXCI7XHJcblxyXG5cclxuQFR5cGVEZWNvcmF0b3IoXCJMTVMuRGF0YS5Nb2RlbFwiKVxyXG5leHBvcnQgY2xhc3MgTW9kZWwge1xyXG5cdGNvbnN0cnVjdG9yKGNvbnRleHQ6Q29udGV4dCwgZGF0YT86UGFydGlhbDxNb2RlbD4pXHR7XHJcbiAgICAgICAgdGhpcy5fX2NvbnRleHQgPSBjb250ZXh0O1xyXG5cdFx0dGhpcy5fX3R5cGUgPSAoKDxhbnk+dGhpcykuX19wcm90b19fKS50eXBlO1x0XHJcblxyXG5cdFx0dmFyIHByb3h5Ok1vZGVsfHVuZGVmaW5lZCA9IG5ldyBQcm94eSh0aGlzLCB7XHJcblx0XHRcdGdldDogKHRhcmdldCwgcHJvcGVydHlOYW1lOiBzdHJpbmcsIHJlY2lldmVyKSA9PiB7XHJcblx0XHRcdFx0bGV0IHByb3BlcnR5OlByb3BlcnR5fHVuZGVmaW5lZCA9IHRoaXMuR2V0VHlwZSgpLkdldFByb3BlcnR5KHByb3BlcnR5TmFtZSk7XHJcblx0XHRcdFx0aWYgKHByb3BlcnR5ID09PSB1bmRlZmluZWQpXHJcblx0XHRcdFx0XHRyZXR1cm4gUmVmbGVjdC5nZXQodGFyZ2V0LCBwcm9wZXJ0eU5hbWUsIHJlY2lldmVyKTtcclxuXHRcdFx0XHRyZXR1cm4gdGhpcy5fX2NvbnRyb2xsZXIuR2V0VmFsdWUocHJvcGVydHkpO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRzZXQ6ICh0YXJnZXQsIHByb3BlcnR5TmFtZTpzdHJpbmcsIHByb3BlcnR5VmFsdWUsIHJlY2lldmVyKSA9PiB7XHJcblx0XHRcdFx0bGV0IHByb3BlcnR5OlByb3BlcnR5fHVuZGVmaW5lZCA9IHRoaXMuR2V0VHlwZSgpLkdldFByb3BlcnR5KHByb3BlcnR5TmFtZSk7XHJcblx0XHRcdFx0aWYgKHByb3BlcnR5ICE9PSB1bmRlZmluZWQpe1xyXG5cdFx0XHRcdFx0dGhpcy5fX2NvbnRyb2xsZXIuU2V0VmFsdWUocHJvcGVydHksIHByb3BlcnR5VmFsdWUpO1xyXG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdHRoaXMuU2VydmVyID0gPGFueT5uZXcgUHJveHkodGhpcywge1xyXG5cdFx0XHRnZXQ6IGFzeW5jICh0YXJnZXQsIHByb3BlcnR5TmFtZTogc3RyaW5nLCByZWNpZXZlcikgPT4ge1xyXG5cdFx0XHRcdGxldCBwcm9wZXJ0eTpQcm9wZXJ0eXx1bmRlZmluZWQgPSB0aGlzLkdldFR5cGUoKS5HZXRQcm9wZXJ0eShwcm9wZXJ0eU5hbWUpO1xyXG5cdFx0XHRcdGlmIChwcm9wZXJ0eSA9PT0gdW5kZWZpbmVkKVxyXG5cdFx0XHRcdFx0cmV0dXJuIFJlZmxlY3QuZ2V0KHRhcmdldCwgcHJvcGVydHlOYW1lLCByZWNpZXZlcik7XHJcblx0XHRcdFx0cmV0dXJuIHRoaXMuX19jb250cm9sbGVyLkdldFZhbHVlQXN5bmMocHJvcGVydHkpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHQgXHR2YXIgY3JlYXRlQ29udHJvbGxlciA9ICgoPGFueT50aGlzKS5fX3Byb3RvX18pLm1vZGVsQ29udHJvbGxlcjtcclxuXHQgXHRpZiAoY3JlYXRlQ29udHJvbGxlciAhPT0gdW5kZWZpbmVkKVxyXG5cdCBcdFx0dGhpcy5fX2NvbnRyb2xsZXIgPSBuZXcgKGNyZWF0ZUNvbnRyb2xsZXIoKSkoY29udGV4dCwgdGhpcywgcHJveHkpO1x0XHJcblx0IFx0ZWxzZVxyXG5cdFx0XHQgdGhpcy5fX2NvbnRyb2xsZXIgPSBuZXcgQ29udHJvbGxlcihjb250ZXh0LCB0aGlzLCBwcm94eSk7XHJcblx0IFx0cmV0dXJuIHByb3h5O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgX19jb250ZXh0OkNvbnRleHQ7XHJcbiAgICBwdWJsaWMgX190eXBlOlR5cGU7XHJcbiAgICBwdWJsaWMgX19jb250cm9sbGVyOkNvbnRyb2xsZXI8TW9kZWw+O1xyXG4gICAgcHVibGljIFNlcnZlcjp7W3AgaW4ga2V5b2YgdGhpc106UHJvbWlzZTx0aGlzW3BdPn07XHJcblxyXG4gICAgXHJcbiAgICBwdWJsaWMgR2V0VHlwZSgpOlR5cGV7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX190eXBlO1xyXG4gICAgfVxyXG4gICAgcHVibGljIEdldFNjaGVtYSgpOlNjaGVtYS5Nb2RlbHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5fX2NvbnRleHQuU2NoZW1hLk1vZGVscy5maW5kKHggPT4geyByZXR1cm4geC5UeXBlID09PSB0aGlzLkdldFR5cGUoKX0pO1xyXG4gICAgICAgIGlmIChyZXN1bHQgIT09IHVuZGVmaW5lZClcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE1vZGVsLkdldFNjaGVtYSgpOlVuYWJsZSB0byBmaW5kIFNjaGVtYWApO1xyXG4gICAgfVxyXG4gXHJcblxyXG5cclxuXHRwdWJsaWMgRGVsZXRlKCl7XHJcblx0XHR2YXIgcmVwb3NpdG9yeSA9IHRoaXMuX19jb250cm9sbGVyLkNvbnRleHQuR2V0UmVwb3NpdG9yeSh0aGlzLkdldFNjaGVtYSgpKTtcclxuXHRcdHJlcG9zaXRvcnkuUmVtb3ZlKHRoaXMpO1xyXG5cdH1cclxuXHRwdWJsaWMgTG9hZCh2YWx1ZTphbnksIHNlcnZlcj86Ym9vbGVhbil7XHJcblx0XHR0aGlzLl9fY29udHJvbGxlci5Mb2FkKHZhbHVlLCBzZXJ2ZXIpO1xyXG5cdH1cclxuXHRwdWJsaWMgR2V0VmFsdWUocHJvcGVydHk6c3RyaW5nfFByb3BlcnR5KXtcclxuXHRcdHJldHVybiB0aGlzLl9fY29udHJvbGxlci5HZXRWYWx1ZShwcm9wZXJ0eSk7XHJcblx0fVxyXG5cdHB1YmxpYyBTZXRWYWx1ZShwcm9wZXJ0eTpzdHJpbmd8UHJvcGVydHksIHZhbHVlOmFueSl7XHJcblx0XHR0aGlzLl9fY29udHJvbGxlci5TZXRWYWx1ZShwcm9wZXJ0eSwgdmFsdWUpO1xyXG5cdH1cclxuXHRwdWJsaWMgdG9TdHJpbmcoKTpzdHJpbmd7XHJcblx0XHRyZXR1cm4gdGhpcy5fX2NvbnRyb2xsZXIudG9TdHJpbmcoKTtcclxuXHR9XHJcblx0cHVibGljIHRvSnNvbigpOnN0cmluZ3tcclxuXHRcdHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLl9fY29udHJvbGxlci5WYWx1ZXMuTG9jYWwsIG51bGwsIFwiXFx0XCIpO1xyXG5cdH1cclxuXHRwdWJsaWMgVW5kbyhwcm9wZXJ0eT86c3RyaW5nfFByb3BlcnR5KXtcclxuXHRcdHRoaXMuX19jb250cm9sbGVyLlVuZG8ocHJvcGVydHkpO1xyXG5cclxuXHR9XHJcblxyXG5cdHB1YmxpYyBWYWxpZGF0ZSgpe1xyXG5cdFx0dGhpcy5fX2NvbnRyb2xsZXIuVmFsaWRhdGUoKTtcclxuXHR9XHJcblx0cHVibGljIGFzeW5jIER1cGxpY2F0ZSgpOlByb21pc2U8TW9kZWx8dW5kZWZpbmVkPntcclxuXHRcdHJldHVybiB0aGlzLl9fY29udHJvbGxlci5EdXBsaWNhdGUoKTtcclxuXHR9XHJcbn1cclxuXHJcblxyXG5cclxuIl19