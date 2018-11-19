import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { Event } from '../events/events';
import { Task } from '../tasks/tasks';
import { EditTaskPage } from '../edit-task/edit-task';
import { EditEventPage } from '../edit-event/edit-event';

interface CalendarIncrement {
    timeLabel:      string;
    label:          string;
    time:           number;
    cssClass:       string;
    task?:          Task;
    event?:         Event;
    labelColor:     string;
    incrementColor: string;
    incrementBorderColor: string;
    type:           string;
}

@IonicPage()
@Component({
    selector: 'page-calendar',
    templateUrl: 'calendar.html',
})
export class CalendarPage {

    calendar: CalendarIncrement[];
    date: any;
    eventsCollection: AngularFirestoreCollection<Event>;
    eventsSnapshot: Observable<Event[]>;
    eventsSubscription: any;
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
        this.buildEvents();
        this.buildTasks();
    }

    buildCalendar() {
        this.calendar = [];
        for (let x=0; x<96; x++) {
            let label = '';
            let cssClass = 'unscheduled';
            let incrementBorderColor = 'white';
            let totalMins = x*15;
            let time = this.minsToMilitary(totalMins);
            if (totalMins % 60 == 0 && time != 0) {
                label = this.minsToString(totalMins);
            }
            if (totalMins % 60 == 45) {
                incrementBorderColor = 'black';
                cssClass = 'unscheduled-time';
            }
            let increment = {
                'timeLabel': label,
                'label': '',
                'time': time,
                'cssClass': cssClass,
                'labelColor': 'green',
                'incrementColor': 'white',
                'incrementBorderColor': incrementBorderColor,
                'type': 'Personal'
            }
            this.calendar.push(increment);
        }
    }

    buildEvents() {
        let dayList = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        let whereClause = 'days.' + dayList[this.date.getDay()];
        this.eventsCollection = this.afs.collection('events', ref => ref.where(whereClause, '==', true));
        this.eventsSnapshot = this.eventsCollection.snapshotChanges().map(actions => {
            return actions.map(a => {
                let event = a.payload.doc.data() as Event;
                const id = a.payload.doc.id;
                event.id = id
                return event;
            });
        });
        let promise = new Promise((resolve, reject) => {
            this.eventsSubscription = this.eventsSnapshot.subscribe(events => {
                events.forEach(event => {
                    for (let increment of this.calendar) {
                        // begining of the interval
                        if (event.from == increment.time) {
                            increment.label = event.name;
                            this.setIncrementEvent(increment, event, 'top-increment-scheduled');
                        }
                        // end of the interval
                        else if (event.to == increment.time) {
                            let previousIncrementIndex = this.calendar.indexOf(increment) - 1;
                            this.setIncrementEvent(this.calendar[previousIncrementIndex], event, 'bottom-increment-scheduled');
                        }
                        // middle increment for sleep (this is a one-off because the interval goes between days)
                        else if (event.name == 'Sleep' && ((event.to > increment.time && increment.time > 0) || (2400 >= increment.time && increment.time >= event.from))) {
                            this.setIncrementEvent(increment, event, 'middle-increment-scheduled');
                        }
                        // case where sleep overlaps onto the 'next day'
                        else if (event.name == 'Sleep' && increment.time == 0) {
                            increment.label = event.name;
                            this.setIncrementEvent(increment, event, 'top-increment-scheduled')
                        }
                        // middle increment
                        else if (event.name != 'Sleep' && event.to > increment.time && increment.time >= event.from) {
                            this.setIncrementEvent(increment, event, 'middle-increment-scheduled');
                        }
                    }
                });
                resolve();
            });
        });
        promise.then(() => {
            this.eventsSubscription.unsubscribe();
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
                    increment.cssClass = 'unscheduled-time';
                }
                else {
                    increment.cssClass = 'unscheduled';
                }
                increment.label = '';
                increment.task = null;

            }
        }
    }

    hardTaskSchedule() {
        this.buildCalendar();
        this.buildEvents();
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
                        if (!increment.task && increment.type == task.type) {
                            if (incrementCounter == 0) {
                                startingIncrementIndex = this.calendar.indexOf(increment);
                            }
                            incrementCounter++;
                        }
                        else if ((increment.task || increment.type != task.type) && incrementCounter < durationIncrements) {
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
            this.calendar[startingIncrementIndex].task = task;
            this.calendar[startingIncrementIndex].incrementColor = task.primaryColor;
            this.calendar[startingIncrementIndex].incrementBorderColor = task.secondaryColor;
            this.calendar[startingIncrementIndex].cssClass = 'top-bottom-increment-scheduled';
            this.calendar[startingIncrementIndex].label = task.name;
        }
        else {
            let endingIncrementIndex = startingIncrementIndex + (task.duration/15);
            for (let i=startingIncrementIndex; i<endingIncrementIndex; i++) {
                if (i == startingIncrementIndex) {
                    this.calendar[i].cssClass = 'top-increment-scheduled';
                    this.calendar[i].label = task.name;
                }
                else if (i + 1 == endingIncrementIndex) {
                    this.calendar[i].cssClass = 'bottom-increment-scheduled';
                }
                else {
                    this.calendar[i].cssClass = 'middle-increment-scheduled';
                }
                this.calendar[i].task = task;
                this.calendar[i].incrementColor = task.primaryColor;
                this.calendar[i].incrementBorderColor = task.secondaryColor;
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

    setIncrementEvent(increment: CalendarIncrement, event: Event, cssClass: string) {
        increment.cssClass = cssClass;
        increment.type = event.name;
        increment.event = event;
        increment.labelColor = event.secondaryColor;
        increment.incrementColor = event.primaryColor;
        increment.incrementBorderColor = event.secondaryColor;
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
        else if (increment.event) {
            this.navCtrl.push(EditEventPage, { event: increment.event })
        }
    }
}
