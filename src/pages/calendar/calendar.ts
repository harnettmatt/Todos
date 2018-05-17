import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable'

interface CalendarIncrement {
    label: string;
    time: Number;
    border: string;
    color: string;
}

interface Preference {
    id: string;
    name: string;
    from: Number;
    to:   Number;
}

@IonicPage()
@Component({
    selector: 'page-calendar',
    templateUrl: 'calendar.html',
})
export class CalendarPage {

    calendar: CalendarIncrement[];
    date: any;
    preferencesCollection: AngularFirestoreCollection<Preference>;
    preferencesSnapshot: Observable<Preference[]>;
    preferences = [];

    constructor(public navCtrl: NavController, public navParams: NavParams, private afs: AngularFirestore) {
        if (this.navParams.get('date')) {
            this.date = this.navParams.get('date');
        }
        else {
            this.date = new Date();
        }
        this.buildCalendar();
        this.buildPreferences();
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
                'border': border,
                'color': 'white'
            }
            this.calendar.push(increment);
        }
    }

    buildPreferences() {
        this.preferencesCollection = this.afs.collection('preferences');
        this.preferencesSnapshot = this.preferencesCollection.snapshotChanges().map(actions => {
            return actions.map(a => {
                let data = a.payload.doc.data() as Preference;
                const id = a.payload.doc.id;
                data.id = id
                return { id, ...data };
            });
        });
        this.preferencesSnapshot.forEach(array => {
            for (let preference of array) {
                if (preference.name == 'sleep'){
                    for (let increment of this.calendar) {
                        if (preference.to > increment.time && increment.time >= 0) {
                            increment.color = 'gray';
                        }
                        if (2400 >= increment.time && increment.time >= preference.from){
                            increment.color = 'gray';
                        }
                    }
                }
                else if (preference.name == 'work') {
                    for (let increment of this.calendar) {
                        if (preference.to > increment.time && increment.time >= preference.from) {
                            increment.color = 'lightblue';
                        }
                    }
                }
                this.preferences.push(preference);
            }
        });


        // determine the increments needed for each preference
        // change color and borders of increment of calendar to reflect the event
    }

    previousDay() {
        this.date.setDate(this.date.getDate() - 1);
        this.navCtrl.setRoot(CalendarPage, {date: this.date}, {animate: false});
    }

    nextDay() {
        this.date.setDate(this.date.getDate() + 1);
        this.navCtrl.setRoot(CalendarPage, {date: this.date}, {animate: false});
    }
}
