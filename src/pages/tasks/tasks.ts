import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { NewTaskPage } from '../new-task/new-task';
import { EditTaskPage } from '../edit-task/edit-task';

export interface Task {
    id?:            string;
    completed:      boolean;
    name:           string;
    description:    string;
    due:            Date;
    scheduledDate?: number;
    scheduledTime?: number;
    duration:       number;
    durationUnit:   string;
    priority:       number;
}

@IonicPage()
@Component({
  selector: 'page-tasks',
  templateUrl: 'tasks.html',
})

export class TasksPage {
    tasksCollection: AngularFirestoreCollection<Task>;
    tasksSnapshot: Observable<Task[]>;
    date: Date;
    overdue: Task[];
    completed: Task[];
    otherTasks: Task[];
    tasksSubscription: any;

    constructor(public navCtrl: NavController, public navParams: NavParams, private afs: AngularFirestore) {
        this.date = new Date();
        this.overdue = [];
        this.completed = [];
        this.otherTasks = [];
        this.tasksCollection = afs.collection('tasks');
        this.tasksSnapshot = this.tasksCollection.snapshotChanges().map(actions => {
            return actions.map(a => {
                const task = a.payload.doc.data() as Task;
                const id = a.payload.doc.id;
                task.id = id;
                return task;
            });
        });
        let promise = new Promise((resolve, reject) => {
            this.tasksSubscription = this.tasksSnapshot.subscribe(tasks => {
                tasks.forEach(task => {
                    console.log(task);
                    if (task.completed) {
                        this.completed.push(task);
                    }
                    else if (task.due < this.date) {
                        this.overdue.push(task);
                    }
                    else {
                        this.otherTasks.push(task);
                    }
                });
                resolve();
            });

        });
        promise.then(() => {
            this.tasksSubscription.unsubscribe();
        });
    }

    addTask() {
        this.navCtrl.push(NewTaskPage);
    }

    editTask(task) {
        this.navCtrl.push(EditTaskPage, { data: task });
    }

    completeTask(task) {
        task.completed = true;
        let taskDoc = this.afs.doc<Task>('tasks/' + task.id);
        taskDoc.update(task);
        let overdueIndex = this.overdue.indexOf(task);
        if (overdueIndex > -1) {
            this.overdue.splice(overdueIndex, 1);
            this.completed.push(task);
        }
        let otherTasksIndex = this.overdue.indexOf(task);
        if (otherTasksIndex > -1) {
            this.otherTasks.splice(otherTasksIndex, 1);
            this.completed.push(task);
        }
    }

    deleteTask(task) {
        let taskDoc = this.afs.doc<Task>('tasks/' + task.id);
        taskDoc.delete();
    }
}
