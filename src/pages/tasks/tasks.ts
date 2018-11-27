import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { NewTaskPage } from '../new-task/new-task';
import { EditTaskPage } from '../edit-task/edit-task';
import { FirestoreProvider } from '../../providers/firestore/firestore';

export interface Task {
    id?:            string;
    completed:      boolean;
    name:           string;
    due:            Date;
    scheduledDate?: number;
    scheduledTime?: number;
    duration:       number;
    type:           string;
    primaryColor:   string;
    secondaryColor: string;
}

@IonicPage()
@Component({
  selector: 'page-tasks',
  templateUrl: 'tasks.html',
})

export class TasksPage {
    overdueTasksCollection: AngularFirestoreCollection<Task>;
    overdueTasks: Observable<Task[]>;
    tasksCollection: AngularFirestoreCollection<Task>;
    tasks: Observable<Task[]>;
    completedTasksCollection: AngularFirestoreCollection<Task>;
    completedTasks: Observable<Task[]>;
    date: Date;

    constructor(public navCtrl: NavController, public navParams: NavParams, private afs: AngularFirestore, private firestoreProvider: FirestoreProvider) {
        this.date = new Date();
        this.date.setHours(0,0,0,0);

        this.overdueTasksCollection = afs.collection('tasks', ref => ref.where('due', '<', this.date).where('completed', '==', false));
        this.overdueTasks = firestoreProvider.getTaskSnapshotChanges(this.overdueTasksCollection);

        this.tasksCollection = afs.collection('tasks', ref => ref.where('due', '>=', this.date).where('completed', '==', false));
        this.tasks = firestoreProvider.getTaskSnapshotChanges(this.tasksCollection);

        this.completedTasksCollection = afs.collection('tasks', ref => ref.where('completed', '==', true));
        this.completedTasks = firestoreProvider.getTaskSnapshotChanges(this.completedTasksCollection);

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
    }

    deleteTask(task) {
        let taskDoc = this.afs.doc<Task>('tasks/' + task.id);
        taskDoc.delete();
    }
}
