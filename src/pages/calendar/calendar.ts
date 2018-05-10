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
    today: any;

    constructor(public navCtrl: NavController, public navParams: NavParams) {
        this.buildCalendar();
        this.today = new Date();
    }

    buildCalendar() {
        this.calendar = [];
        for (let x=0; x<96; x++) {
            let border = '0px solid';
            let label = '';
            let total_mins = x*15;
            let mins = total_mins % 60;
            let hours = Math.floor(total_mins / 60);
            let time = (hours*100) + mins;
            let abrv = 'am';

            if (hours >= 12) {
                abrv = 'pm';
                hours = hours % 12;
            }

            if (hours == 0) {
                hours = 12;
            }

            if (mins == 0) {
                label = String(hours) + ":" + String(mins) + "0" + abrv;
            }
            if (mins == 45) {
                border = '1px solid';
            }
            let increment = {
                'label': label,
                'time': time,
                'border': border
            }
            this.calendar.push(increment);
        }
    }
}
