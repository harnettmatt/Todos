import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Task } from '../tasks/tasks';
import { AlertController } from 'ionic-angular';

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

    constructor(public navCtrl: NavController, public navParams: NavParams, private formBuilder: FormBuilder, private afs: AngularFirestore, private alertCtrl: AlertController) {
        this.editTask = this.navParams.get('data');
        this.editTaskID = this.editTask.id;
        this.editTaskForm = this.formBuilder.group({
            name: [this.editTask.name],
            description: [this.editTask.description],
            due: [this.editTask.due],
            duration: [this.editTask.duration],
            priority: [this.editTask.priority]
        });
        this.tasksCollection = this.afs.collection('tasks');
    }

    submitForm() {
        let scheduledDate = this.editTask.scheduledDate;
        let scheduledTime = this.editTask.scheduledTime;
        let permissionToUpdate = true;
        // if the task duration is being changed and the task has already been scheduled
        if (Number(this.editTaskForm.value['duration']) != this.editTask.duration && this.editTask.scheduledDate > -1) {
            let alert = this.alertCtrl.create({
                title: 'Confirm changes',
                message: 'This task has already been scheduled, adjusting duration will require a reschedule.',
                buttons: [
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        handler: () => {
                            permissionToUpdate = false;
                        }
                    },
                    {
                        text: 'Confirm',
                        handler: () => {
                            scheduledDate = -1;
                            scheduledTime = -1;
                        }
                    }
                ]
            });
            alert.present();
        }
        if (permissionToUpdate) {
            let due = new Date(this.editTaskForm.value['due']);
            due.setHours(0,0,0,0);
            this.editTask = {
                id: this.editTaskID,
                completed: this.editTask.completed,
                description: this.editTaskForm.value['description'],
                due: due,
                duration: Number(this.editTaskForm.value['duration']),
                name: this.editTaskForm.value['name'],
                priority: this.editTaskForm.value['priority'],
                scheduledDate: scheduledDate,
                scheduledTime: scheduledTime
            }
            let taskDoc = this.afs.doc<Task>('tasks/' + this.editTaskID);
            taskDoc.update(this.editTask);
            this.navCtrl.pop();
        }
    }

  }
