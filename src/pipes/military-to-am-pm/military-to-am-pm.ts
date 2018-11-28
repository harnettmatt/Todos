import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'militaryToAmPm',
})
export class MilitaryToAmPmPipe implements PipeTransform {
    transform(value: number, ...args) {
        let ampm = "am";
        let militaryString = value.toString();
        if (value > 1200) {
            value = value - 1200;
            militaryString = value.toString();
            ampm = "pm";
        }
        while (militaryString.length < 4) {
            militaryString = "0" + militaryString;
        }
        return militaryString.substr(0,2) + ":" + militaryString.substr(2,2) + " " + ampm;
    }
}
