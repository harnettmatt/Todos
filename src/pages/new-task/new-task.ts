import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Task } from '../tasks/tasks';

@IonicPage()
@Component({
  selector: 'page-new-task',
  templateUrl: 'new-task.html',
})
export class NewTaskPage {

    newTaskForm: FormGroup;
    newTask: Task;
    tasksCollection: AngularFirestoreCollection<Task>;

    constructor(public navCtrl: NavController, public navParams: NavParams, private formBuilder: FormBuilder, private afs: AngularFirestore) {
        this.newTaskForm = this.formBuilder.group({
            name: [''],
            description: [''],
            due: [''],
            duration: [''],
            type: ['']
        });
        this.tasksCollection = this.afs.collection('tasks');
    }

    submitForm() {
        let due = new Date(this.newTaskForm.value['due']);
        due.setHours(0,0,0,0);
        this.newTask = {
            completed: false,
            description: this.newTaskForm.value['description'],
            due: due,
            duration: Number(this.newTaskForm.value['duration']),
            name: this.newTaskForm.value['name'],
            type: this.newTaskForm.value['type'],
            scheduledDate: -1,
            scheduledTime: -1
        }
        this.tasksCollection.add(this.newTask);
        this.navCtrl.pop();
    }

}
