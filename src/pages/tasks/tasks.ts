import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

interface Task {
    text: string;
    id?: string;
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

}
