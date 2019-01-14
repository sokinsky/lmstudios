"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Type_1 = require("./Type");
function TypeDecorator(uid) {
    return function (target) {
        console.log(target);
        console.log(typeof (target));
        target.prototype.typeUID = uid;
        Type_1.Type.Create(target);
    };
}
exports.TypeDecorator = TypeDecorator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHlwZURlY29yYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9UeXBlRGVjb3JhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQThCO0FBRTlCLFNBQWdCLGFBQWEsQ0FBQyxHQUFVO0lBQ3BDLE9BQU8sVUFBUyxNQUFVO1FBQ3RCLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUM1QixNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUM7UUFDL0IsV0FBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN4QixDQUFDLENBQUM7QUFDTixDQUFDO0FBUEQsc0NBT0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBUeXBlIH0gZnJvbSBcIi4vVHlwZVwiO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIFR5cGVEZWNvcmF0b3IodWlkOnN0cmluZyl7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24odGFyZ2V0OmFueSl7ICBcclxuICAgICAgICBjb25zb2xlLmxvZyh0YXJnZXQpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHR5cGVvZih0YXJnZXQpKTtcclxuICAgICAgICB0YXJnZXQucHJvdG90eXBlLnR5cGVVSUQgPSB1aWQ7XHJcbiAgICAgICAgVHlwZS5DcmVhdGUodGFyZ2V0KTsgICAgICBcclxuICAgIH07XHJcbn0iXX0=