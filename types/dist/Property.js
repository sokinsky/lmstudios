"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Property {
    constructor(name, type) {
        this.Name = name;
        this.PropertyType = type;
    }
    GetValue(item) {
        return item[this.Name];
    }
    SetValue(item, value) {
        item[this.Name] = value;
    }
}
exports.Property = Property;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvcGVydHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvUHJvcGVydHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSxNQUFhLFFBQVE7SUFDakIsWUFBWSxJQUFXLEVBQUUsSUFBUztRQUM5QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztJQUM3QixDQUFDO0lBSU0sUUFBUSxDQUFDLElBQVE7UUFDcEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFDTSxRQUFRLENBQUMsSUFBUSxFQUFFLEtBQVM7UUFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDNUIsQ0FBQztDQUNKO0FBZEQsNEJBY0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBUeXBlIH0gZnJvbSAnLi9UeXBlJztcclxuXHJcbmV4cG9ydCBjbGFzcyBQcm9wZXJ0eSB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lOnN0cmluZywgdHlwZTpUeXBlKXtcclxuICAgICAgICB0aGlzLk5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMuUHJvcGVydHlUeXBlID0gdHlwZTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBOYW1lOnN0cmluZztcclxuICAgIHB1YmxpYyBQcm9wZXJ0eVR5cGU6VHlwZTtcclxuXHJcbiAgICBwdWJsaWMgR2V0VmFsdWUoaXRlbTphbnkpe1xyXG4gICAgICAgIHJldHVybiBpdGVtW3RoaXMuTmFtZV07XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgU2V0VmFsdWUoaXRlbTphbnksIHZhbHVlOmFueSl7XHJcbiAgICAgICAgaXRlbVt0aGlzLk5hbWVdID0gdmFsdWU7XHJcbiAgICB9XHJcbn0iXX0=