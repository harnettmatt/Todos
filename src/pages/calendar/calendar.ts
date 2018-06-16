import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { Preference } from '../preferences/preferences';
import { Task } from '../tasks/tasks';

interface CalendarIncrement {
    timeLabel:      string;
    eventLabel:     string;
    time:           number;
    eventBorder:    string;
    color:          string;
    task?:          Task;
    preference?:    Preference;
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
    preferencesSubscription: any;
    tasksCollection: AngularFirestoreCollection<Task>;
    tasksSnapshot: Observable<Task[]>;
    tasksSubscription: any;
    unscheduledTasksSubscription: any;

    constructor(public navCtrl: NavController, public navParams: NavParams, private afs: AngularFirestore) {
        if (this.navParams.get('date')) {
            this.date = this.navParams.get('date');
        }
        else {
            this.date = new Date();
        }

        let time = 1230;
        let hours = Number(time.toString().slice(0,2));
        let mins = Number(time.toString().slice(2,4));
        let totalMins = (hours * 60) + mins;
        let incrementIndex = totalMins/15;

        this.buildCalendar();
        this.buildPreferences();
        this.buildTasks();
        // this.scheduleTasks();
    }

    buildCalendar() {
        this.calendar = [];
        for (let x=0; x<96; x++) {
            let eventBorder = '0px solid';
            let label = '';
            let totalMins = x*15;
            let time = this.minsToMilitary(totalMins);
            if (totalMins % 60 == 0 && time != 0) {
                label = this.minsToString(totalMins);
            }
            if (totalMins % 60 == 45) {
                eventBorder = '1px dashed';
            }
            let increment = {
                'timeLabel': label,
                'eventLabel': '',
                'time': time,
                'eventBorder': eventBorder,
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
        let promise = new Promise((resolve, reject) => {
            this.preferencesSubscription = this.preferencesSnapshot.subscribe(preferences => {
                 preferences.forEach(preference => {
                    if (preference.name == 'sleep') {
                        for (let increment of this.calendar) {
                            if (preference.to > increment.time && increment.time >= 0) {
                                increment.color = 'gray';
                                increment.preference = preference;
                            }
                            if (2400 >= increment.time && increment.time >= preference.from) {
                                increment.color = 'gray';
                                increment.preference = preference;
                            }
                        }
                    }
                    else if (preference.name == 'work') {
                        for (let increment of this.calendar) {
                            if (preference.to > increment.time && increment.time >= preference.from) {
                                increment.color = 'lightblue';
                                increment.preference = preference;
                            }
                        }
                    }
                });
                resolve();
            });
        });
        promise.then(() => {
            this.preferencesSubscription.unsubscribe();
        })
    }

    buildTasks() {
        let todayNumber = (((this.date.getFullYear() * 100) + this.date.getMonth() + 1) * 100) + this.date.getDate();
        this.tasksCollection = this.afs.collection('tasks', ref => ref.where('scheduledDate', '==', todayNumber));
        this.tasksSnapshot = this.tasksCollection.snapshotChanges().map(actions => {
            return actions.map(a => {
                let task = a.payload.doc.data() as Task;
                const id = a.payload.doc.id;
                task.id = id
                return task;
            });
        });
        let promise = new Promise((resolve, reject) => {
            this.tasksSubscription = this.tasksSnapshot.subscribe(tasks => {
                tasks.forEach(task => {
                    this.addTaskToCalendar(task);
                });
                resolve();
            });
        });

        promise.then(() => {
            this.tasksSubscription.unsubscribe();
        });
    }

    scheduleTasks() {
        this.tasksCollection = this.afs.collection('tasks', ref => ref.where('scheduledDate', '==', -1));
        this.tasksSnapshot = this.tasksCollection.snapshotChanges().map(actions => {
            return actions.map(a => {
                let task = a.payload.doc.data() as Task;
                const id = a.payload.doc.id;
                task.id = id
                return task;
            });
        });
        let updateTasks = [];
        let tasksSubscription = false;
        let promise = new Promise((resolve, reject) => {
            this.unscheduledTasksSubscription = this.tasksSnapshot.subscribe(tasks => {
                tasks.forEach(task => {
                    let durationIncrements = task.duration/15
                    let incrementCounter = 0;
                    let startingIncrementIndex = 0;
                    let endingIncrementIndex = 0;
                    // finding a free set of increments for the task
                    for (let increment of this.calendar) {
                        if (!increment.task && !increment.preference) {
                            if (incrementCounter == 0) {
                                startingIncrementIndex = this.calendar.indexOf(increment);
                            }
                            incrementCounter++;
                        }
                        else if ((increment.task || increment.preference) && incrementCounter < durationIncrements) {
                            incrementCounter = 0;
                        }
                        if (incrementCounter >= durationIncrements) {
                            endingIncrementIndex = startingIncrementIndex + durationIncrements;
                            break;
                        }
                    }
                    let totalMins = startingIncrementIndex * 15;
                    task.scheduledTime = this.minsToMilitary(totalMins);
                    this.addTaskToCalendar(task);
                    task.scheduledDate = (((this.date.getFullYear() * 100) + this.date.getMonth() + 1) * 100) + this.date.getDate();
                    updateTasks.push(task);
                });
                resolve();
            });

        });

        promise.then(() => {
            if (this.unscheduledTasksSubscription) {
                this.unscheduledTasksSubscription.unsubscribe();
            }
            for (let task of updateTasks){
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

    addTaskToCalendar(task: Task) {
        let totalMins = this.militarytoMins(task.scheduledTime);
        let startingIncrementIndex = totalMins/15;
        let endingIncrementIndex = startingIncrementIndex + (task.duration/15);
        for (let i=startingIncrementIndex; i<endingIncrementIndex; i++) {
            if (i == startingIncrementIndex) {
                this.calendar[i].eventLabel = task.name;
            }
            if (i + 1 == endingIncrementIndex) {
                this.calendar[i].eventBorder = '1px solid white';
            }
            this.calendar[i].color='blue';
            this.calendar[i].task = task;
        }
    }
    minsToMilitary(totalMins: number): number {
        let mins = totalMins % 60;
        let hours = Math.floor(totalMins / 60);
        return (hours * 100) + mins;
    }

    militarytoMins(time: number): number {
        let timeString = time.toString();
        while (timeString.length < 4) {
            timeString = '0' + timeString;
        }
        let hours = Number(timeString.slice(0,2));
        let mins = Number(timeString.slice(2,4));
        return (hours * 60) + mins;
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
