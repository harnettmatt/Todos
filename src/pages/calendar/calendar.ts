import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { Preference } from '../preferences/preferences';
import { Task } from '../tasks/tasks';

interface CalendarIncrement {
    label:  string;
    time:   number;
    border: string;
    color:  string;
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
            let totalMins = x*15;
            let time = this.minsToMilitary(totalMins);
            if (totalMins % 60 == 0) {
                label = this.minsToString(totalMins);
            }
            if (totalMins % 60 == 45) {
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
                let preference = a.payload.doc.data() as Preference;
                const id = a.payload.doc.id;
                preference.id = id
                return preference;
            });
        });
        this.preferencesSnapshot.subscribe(preferences => {
             preferences.forEach(preference => {
                if (preference.name == 'sleep') {
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
            });
        });
    }

    buildTasks() {
        this.tasksCollection = this.afs.collection('tasks');
        this.tasksSnapshot = this.tasksCollection.snapshotChanges().map(actions => {
            return actions.map(a => {
                let task = a.payload.doc.data() as Task;
                const id = a.payload.doc.id;
                task.id = id
                return task;
            });
        });
        let updateTasks = [];
        let promise = new Promise((resolve, reject) => {
            this.tasksSnapshot.subscribe(tasks => {
                tasks.forEach(task => {
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
                    // this is assuming that every task can be scheduled on this day. This needs to be changed
                    for (let i=startingIncrementIndex; i<endingIncrementIndex; i++) {
                        this.calendar[i].color='blue';
                    }
                    let total_mins = startingIncrementIndex * 15;
                    let mins = total_mins % 60;
                    let hours = Math.floor(total_mins / 60);
                    task.scheduled = (hours*100) + mins;
                    updateTasks.push(task);
                });
                resolve();
            });
        });

        promise.then(() => {
            for (let task of updateTasks){
                console.log(task);
                let taskDoc = this.afs.doc<Task>('tasks/' + task.id);
                taskDoc.update(task);
            }
        });
    }

    minsToString(totalMins: number): string {
        let mins = totalMins % 60;
        let hours = Math.floor(totalMins / 60);
        let abrv = 'am';
        if (hours >= 12) {
            abrv = 'pm';
            hours = hours % 12;
        }
        if (hours == 0) {
            hours = 12;
        }

        if (mins == 0) {
            return String(hours) + ":" + String(mins) + "0" + abrv;
        }
        else {
            return String(hours) + ":" + String(mins) + abrv;
        }
    }

    minsToMilitary(totalMins: number): number {
        let mins = totalMins % 60;
        let hours = Math.floor(totalMins / 60);
        return (hours*100) + mins;
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
