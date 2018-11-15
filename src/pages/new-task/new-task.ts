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
            due: [''],
            duration: [''],
            type: [''],
            primaryColor: [''],
            secondaryColor: ['']
        });
        this.tasksCollection = this.afs.collection('tasks');
    }

    submitForm() {
        let due = new Date(this.newTaskForm.value['due']);
        due.setHours(0,0,0,0);
        // determine colors:
        let primaryColor = 'lightgreen'
        let secondaryColor = 'green';
        if (this.newTaskForm.value['type'] == 'work') {
            primaryColor = 'lightblue';
            secondaryColor = 'blue';
        }
        this.newTask = {
            completed: false,
            due: due,
            duration: Number(this.newTaskForm.value['duration']),
            name: this.newTaskForm.value['name'],
            type: this.newTaskForm.value['type'],
            primaryColor: primaryColor,
            secondaryColor: secondaryColor,
            scheduledDate: -1,
            scheduledTime: -1
        }
        this.tasksCollection.add(this.newTask);
        this.navCtrl.pop();
    }

}
