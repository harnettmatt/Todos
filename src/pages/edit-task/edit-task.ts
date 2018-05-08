import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';

interface Task {
    id: string;
    completed: boolean;
    name: string;
    description?: string;
    due?: string;
    duration?: number;
    durationUnit?: string;
    priority?: number;
}

@IonicPage()
@Component({
  selector: 'page-edit-task',
  templateUrl: 'edit-task.html',
})
export class EditTaskPage {

    editTaskForm: FormGroup;
    editTask: Task;
    editTaskID: string;
    tasksCollection: AngularFirestoreCollection<Task>;

    constructor(public navCtrl: NavController, public navParams: NavParams, private formBuilder: FormBuilder, private afs: AngularFirestore) {
        this.editTask = this.navParams.get('data');
        this.editTaskID = this.editTask.id;
        this.editTaskForm = this.formBuilder.group({
            name: [this.editTask.name],
            description: [this.editTask.description],
            due: [this.editTask.due],
            duration: [this.editTask.duration],
            durationUnit: [this.editTask.durationUnit],
            priority: [this.editTask.priority]
        });
        this.tasksCollection = this.afs.collection('tasks');
    }

    submitForm() {
        this.editTask = {
            id: this.editTaskID,
            completed: false,
            name: this.editTaskForm.value['name'],
            due: this.editTaskForm.value['due'],
            duration: this.editTaskForm.value['duration'],
            durationUnit: this.editTaskForm.value['durationUnit'],
            priority: this.editTaskForm.value['priority']
        }
        let taskDoc = this.afs.doc<Task>('tasks/' + this.editTaskID);
        taskDoc.update(this.editTask);
        this.navCtrl.pop();
    }

  }
