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
class API {
    constructor(domain) {
        this.Responses = [];
        this.Domain = domain;
    }
    Post(path, body) {
        return __awaiter(this, void 0, void 0, function* () {
            var url = `${this.Domain}/${path}`;
            let input = {
                method: "POST",
                body: JSON.stringify(body)
            };
            let response = yield fetch(url, input);
            try {
                return yield response.json();
            }
            catch (_a) {
                return undefined;
            }
        });
    }
}
exports.API = API;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQVBJLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL0FQSS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsTUFBYSxHQUFHO0lBQ2YsWUFBWSxNQUFjO1FBSWhCLGNBQVMsR0FBYyxFQUFFLENBQUM7UUFIbkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDdEIsQ0FBQztJQUdZLElBQUksQ0FBQyxJQUFXLEVBQUUsSUFBUTs7WUFDaEMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksRUFBRSxDQUFBO1lBQ3hDLElBQUksS0FBSyxHQUFHO2dCQUNYLE1BQU0sRUFBRSxNQUFNO2dCQUNkLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQzthQUMxQixDQUFBO1lBQ0ssSUFBSSxRQUFRLEdBQUcsTUFBTSxLQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3ZDLElBQUc7Z0JBQ0MsT0FBTyxNQUFNLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQzthQUNoQztZQUNELFdBQUs7Z0JBQ0QsT0FBTyxTQUFTLENBQUM7YUFDcEI7UUFFUixDQUFDO0tBQUE7Q0FFRDtBQXRCRCxrQkFzQkMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgQVBJIHtcclxuXHRjb25zdHJ1Y3Rvcihkb21haW46IHN0cmluZykge1xyXG5cdFx0dGhpcy5Eb21haW4gPSBkb21haW47XHJcblx0fVxyXG4gICAgcHVibGljIERvbWFpbjogc3RyaW5nO1xyXG4gICAgcHVibGljIFJlc3BvbnNlczpSZXNwb25zZVtdID0gW107XHJcblx0cHVibGljIGFzeW5jIFBvc3QocGF0aDpzdHJpbmcsIGJvZHk6YW55KTogUHJvbWlzZTxSZXNwb25zZXx1bmRlZmluZWQ+IHtcclxuICAgICAgICB2YXIgdXJsID0gYCR7dGhpcy5Eb21haW59LyR7cGF0aH1gXHJcblx0XHRsZXQgaW5wdXQgPSB7XHJcblx0XHRcdG1ldGhvZDogXCJQT1NUXCIsXHJcblx0XHRcdGJvZHk6IEpTT04uc3RyaW5naWZ5KGJvZHkpXHJcblx0XHR9XHJcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCBpbnB1dCk7XHJcbiAgICAgICAgdHJ5e1xyXG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaHtcclxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDsgXHJcbiAgICAgICAgfSAgICAgICAgICAgIFxyXG5cclxuXHR9XHJcblxyXG59XHJcbiJdfQ==