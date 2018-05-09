import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

interface CalendarIncrement {
    label: string;
    time: Number;
    border: string;
}

@IonicPage()
@Component({
    selector: 'page-calendar',
    templateUrl: 'calendar.html',
})
export class CalendarPage {

    calendar: CalendarIncrement[];

    constructor(public navCtrl: NavController, public navParams: NavParams) {
        this.buildCalendar();

    }

    buildCalendar() {
        this.calendar = [];
        for (let x=0; x<=96; x++) {
            let border = '0px solid';
            let label = '';
            let total_mins = x*15;
            let mins = total_mins % 60;
            let hours = Math.floor(total_mins / 60);
            let time = (hours*100) + mins;
            if (mins == 0) {
                label = String(hours) + ":" + String(mins) + "0";
            }
            if (mins == 45) {
                border = '1px solid';
            }
            let increment = {
                'label': label,
                'time': time,
                'border': border
            }
            console.log(increment);
            this.calendar.push(increment);
        }
    }
}
