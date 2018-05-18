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
            durationUnit: [''],
            priority: ['']
        });
        this.tasksCollection = this.afs.collection('tasks');
    }

    submitForm() {
        this.newTask = {
            completed: false,
            name: this.newTaskForm.value['name'],
            description: '',
            due: this.newTaskForm.value['due'],
            duration: this.newTaskForm.value['duration'],
            durationUnit: this.newTaskForm.value['durationUnit'],
            priority: this.newTaskForm.value['priority']
        }
        this.tasksCollection.add(this.newTask);
        this.navCtrl.pop();
    }

}
