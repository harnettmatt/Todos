import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { Preference } from '../preferences/preferences';
import { Task } from '../tasks/tasks';
import { EditTaskPage } from '../edit-task/edit-task';
import { EditPreferencePage } from '../edit-preference/edit-preference';

interface CalendarIncrement {
    timeLabel:      string;
    eventLabel:     string;
    time:           number;
    borderColor:    string;
    cssClass:       string;
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
        this.date.setHours(0,0,0,0);

        let time = 1230;
        let hours = Number(time.toString().slice(0,2));
        let mins = Number(time.toString().slice(2,4));
        let totalMins = (hours * 60) + mins;
        let incrementIndex = totalMins/15;

        this.buildCalendar();
        this.buildPreferences();
        this.buildTasks();
    }

    buildCalendar() {
        this.calendar = [];
        for (let x=0; x<96; x++) {
            let borderColor = 'white';
            let label = '';
            let cssClass = 'unscheduled';
            let totalMins = x*15;
            let time = this.minsToMilitary(totalMins);
            if (totalMins % 60 == 0 && time != 0) {
                label = this.minsToString(totalMins);
            }
            if (totalMins % 60 == 45) {
                borderColor = 'black';
                cssClass = 'unscheduled-time';
            }
            let increment = {
                'timeLabel': label,
                'eventLabel': '',
                'time': time,
                'borderColor': borderColor,
                'color': 'white',
                'cssClass': cssClass
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
                    for (let increment of this.calendar) {
                        // begining of the interval
                        if (preference.from == increment.time) {
                            this.setIncrementPreferenceStyle(increment, preference, 'top-increment-scheduled');
                        }
                        // end of the interval
                        else if (preference.to == increment.time) {
                            let previousIncrementIndex = this.calendar.indexOf(increment) - 1;
                            this.setIncrementPreferenceStyle(this.calendar[previousIncrementIndex], preference, 'bottom-increment-scheduled');
                        }
                        // middle increment for sleep (this is a one-off because the interval goes between days)
                        else if (preference.name == 'sleep' && ((preference.to > increment.time && increment.time >= 0) || (2400 >= increment.time && increment.time >= preference.from))) {
                            this.setIncrementPreferenceStyle(increment, preference, 'middle-increment-scheduled');
                        }
                        // middle increment
                        else if (preference.name != 'sleep' && preference.to > increment.time && increment.time >= preference.from) {
                            this.setIncrementPreferenceStyle(increment, preference, 'middle-increment-scheduled');
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
        this.tasksCollection = this.afs.collection('tasks', ref => ref.where('scheduledDate', '==', this.date));
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

    clearCalendarTasks() {
        for (let increment of this.calendar) {
            if (increment.task) {
                if (increment.time % 60 == 45) {
                    increment.borderColor = 'black';
                    increment.cssClass = 'unscheduled-time';
                }
                else {
                    increment.cssClass = 'unscheduled';
                    increment.borderColor = 'white';
                }
                increment.color = 'white';
                increment.eventLabel = '';
                increment.task = null;

            }
        }
    }

    hardTaskSchedule() {
        this.clearCalendarTasks();
        // this block below is unscheduling the tasks for today
        this.tasksCollection = this.afs.collection('tasks', ref => ref.where('scheduledDate', '==', this.date));
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
            this.tasksSubscription = this.tasksSnapshot.subscribe(tasks => {
                tasks.forEach(task => {
                    task.scheduledDate = -1;
                    task.scheduledTime = -1;
                    updateTasks.push(task);
                });
                resolve();
            });
        });

        promise.then(() => {
            this.tasksSubscription.unsubscribe();
            let updatePromises = [];
            for (let task of updateTasks) {
                let taskDoc = this.afs.doc<Task>('tasks/' + task.id);
                updatePromises.push(taskDoc.update(task));
                console.log('updating task' + task.name + " " + task.scheduledDate);
            }
            Promise.all(updatePromises).then(() => {
                this.scheduleTasks();
            });
        });
    }

    scheduleTasks() {
        this.tasksCollection = this.afs.collection('tasks', ref => ref.where('completed', '==', false));
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
            this.unscheduledTasksSubscription = this.tasksSnapshot.subscribe(tasks => {
                tasks.sort(function (a, b) {
                    // sort function natively sorts in ascending order
                    // by subtracting dates we are creating our own score to sort on
                    // if the score is 0, use the next metric, duration
                    return a.due.getTime() - b.due.getTime() || b.duration - a.duration;
                });
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
                    task.scheduledDate = this.date;
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
        if (task.duration == 15) {
            this.calendar[startingIncrementIndex].color = 'lightgreen';
            this.calendar[startingIncrementIndex].borderColor = 'green';
            this.calendar[startingIncrementIndex].task = task;
            this.calendar[startingIncrementIndex].cssClass = 'top-bottom-increment-scheduled';
            this.calendar[startingIncrementIndex].eventLabel = task.name;
        }
        else {
            let endingIncrementIndex = startingIncrementIndex + (task.duration/15);
            for (let i=startingIncrementIndex; i<endingIncrementIndex; i++) {
                if (i == startingIncrementIndex) {
                    this.calendar[i].cssClass = 'top-increment-scheduled';
                    this.calendar[i].eventLabel = task.name;
                }

                else if (i + 1 == endingIncrementIndex) {
                    this.calendar[i].cssClass = 'bottom-increment-scheduled';
                }
                else {
                    this.calendar[i].cssClass = 'middle-increment-scheduled';
                }
                this.calendar[i].color = 'lightgreen';
                this.calendar[i].borderColor = 'green';
                this.calendar[i].task = task;
            }
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

    setIncrementPreferenceStyle(increment: CalendarIncrement, preference: Preference, cssClass: string) {
        increment.cssClass = cssClass;
        increment.borderColor = preference.borderColor;
        increment.color = preference.color;
        increment.preference = preference;
    }

    previousDay() {
        this.date.setDate(this.date.getDate() - 1);
        this.navCtrl.setRoot(CalendarPage, {date: this.date}, {animate: false});
    }

    nextDay() {
        this.date.setDate(this.date.getDate() + 1);
        this.navCtrl.setRoot(CalendarPage, {date: this.date}, {animate: false});
    }

    displayTask(increment: CalendarIncrement) {
        if (increment.task) {
            this.navCtrl.push(EditTaskPage, { data: increment.task });
        }
        else if (increment.preference) {
            this.navCtrl.push(EditPreferencePage, { preference: increment.preference })
        }
    }
}
