import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';

interface Task {
    name?: string;
    description?: string;
    due?: string;
    duration?: number;
    durationUnit?: string;
    priority?: number;
}

@IonicPage()
@Component({
  selector: 'page-new-task',
  templateUrl: 'new-task.html',
})
export class NewTaskPage {

    newTask: Task;
    tasksCollection: AngularFirestoreCollection<Task>;

    constructor(public navCtrl: NavController, public navParams: NavParams, private afs: AngularFirestore) {
        this.newTask = {};
        this.tasksCollection = this.afs.collection('tasks');
    }

    submitForm() {
        this.tasksCollection.add(this.newTask);
        this.navCtrl.pop();
    }

}
