import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable'

interface CalendarIncrement {
    label: string;
    time: number;
    border: string;
    color: string;
}

interface Preference {
    id: string;
    name: string;
    from: number;
    to:   number;
}

interface Task {
    id: string;
    completed: boolean;
    name: string;
    description: string;
    due: string;
    duration: number;
    durationUnit: string;
    priority: number;
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
    tasksCollection: AngularFirestoreCollection<Task>;
    tasksSnapshot: Observable<Task[]>;

    constructor(public navCtrl: NavController, public navParams: NavParams, private afs: AngularFirestore) {
        if (this.navParams.get('date')) {
            this.date = this.navParams.get('date');
        }
        else {
            this.date = new Date();
        }
        this.buildCalendar();
        this.buildPreferences();
        this.buildTasks();
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
    }

    buildTasks() {
        this.tasksCollection = this.afs.collection('tasks');
        this.tasksSnapshot = this.tasksCollection.snapshotChanges().map(actions => {
            return actions.map(a => {
                let data = a.payload.doc.data() as Task;
                const id = a.payload.doc.id;
                data.id = id
                return { id, ...data };
            });
        });
        this.tasksSnapshot.forEach(array => {
            for (let task of array) {
                let durationIncrements = task.duration/15
                let incrementCounter = 0;
                let startingIncrementIndex = 0;
                let endingIncrementIndex = 0;
                // finding a free set of increments for the task
                for (let increment of this.calendar) {
                    if (increment.color == 'white') {
                        if (incrementCounter == 0) {
                            startingIncrementIndex = this.calendar.indexOf(increment);
                        }
                        incrementCounter++;
                    }
                    else if (increment.color != 'white' && incrementCounter < durationIncrements) {
                        incrementCounter = 0;
                    }
                    if (incrementCounter >= durationIncrements) {
                        endingIncrementIndex = startingIncrementIndex + durationIncrements;
                        break;
                    }
                }
                for (let i=startingIncrementIndex; i<endingIncrementIndex; i++) {
                    this.calendar[i].color='blue';
                }
            }

        });
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
