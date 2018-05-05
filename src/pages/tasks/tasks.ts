import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { NewTaskPage } from '../new-task/new-task';

interface Task {
    name: string;
    description: string;
    due: string;
    duration: number;
    durationUnit: string;
    priority: number;
}

@IonicPage()
@Component({
  selector: 'page-tasks',
  templateUrl: 'tasks.html',
})

export class TasksPage {
    tasksCollection: AngularFirestoreCollection<Task>;
    tasks: Observable<Task[]>;

    constructor(public navCtrl: NavController, public navParams: NavParams, private afs: AngularFirestore) {
        this.tasksCollection = afs.collection('tasks');
        this.tasks = this.tasksCollection.valueChanges();
    }

    addTask() {
        this.navCtrl.push(NewTaskPage);
    }

}
