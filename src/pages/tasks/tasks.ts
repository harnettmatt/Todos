import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireList } from 'angularfire2/database';
import { FirebaseProvider } from '../../providers/firebase/firebase';

@IonicPage()
@Component({
  selector: 'page-tasks',
  templateUrl: 'tasks.html',
})
export class TasksPage {
    tasks: AngularFireList<{}>;
    newTask: string;

    constructor(public navCtrl: NavController, public navParams: NavParams, public firebaseProvider: FirebaseProvider) {
        this.tasks = this.firebaseProvider.getTasks();
    }

    addItem() {
        this.firebaseProvider.addTask(this.newTask);
    }

    removeItem(id) {
        this.firebaseProvider.removeTask(this.newTask);
    }

}
