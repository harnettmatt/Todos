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

    taskForm: FormGroup;
    task: Task;
    taskID: string;
    tasksCollection: AngularFirestoreCollection<Task>;
    editTask: Boolean;
    deleteButton: Boolean;
    submitButtonText: string;
    headerText: string;

    constructor(public navCtrl: NavController, public navParams: NavParams, private formBuilder: FormBuilder, private afs: AngularFirestore, private alertCtrl: AlertController) {
        console.log('editTaskPage');
        this.task = this.navParams.get('data');
        this.tasksCollection = this.afs.collection('tasks');
        // setting form values based on the
        if (this.task) {
            this.editTask = true;
            this.submitButtonText = 'Update';
            this.deleteButton = true;
            this.headerText = 'Update Task';
            this.taskID = this.task.id;
            this.taskForm = this.formBuilder.group({
                name: [this.task.name],
                due: [this.task.due.toISOString().substring(0,10)],
                duration: [this.task.duration],
                type: [this.task.type]
            });
        }
        else {
            this.editTask = false;
            this.submitButtonText = 'Create Task';
            this.deleteButton = false;
            this.headerText = 'New Task';
            this.taskForm = this.formBuilder.group({
                name: [],
                due: [],
                duration: [],
                type: []
            });
        }
    }

    submitForm() {
        let permissionToUpdate = true;
        if (this.editTask) {
            let scheduledDate = this.task.scheduledDate;
            let scheduledTime = this.task.scheduledTime;
            let completed = this.task.completed;
        }
        else {
            let scheduledDate = -1;
            let scheduledTime = -1;
            let completed = false;
        }
        // if the task duration is being changed and the task has already been scheduled
        if (this.editTask && Number(this.taskForm.value['duration']) != this.task.duration && this.task.scheduledDate > -1) {
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
            let due = new Date(this.taskForm.value['due']);
            due.setHours(0,0,0,0);
            let primaryColor = 'lightgreen'
            let secondaryColor = 'green';
            if (this.taskForm.value['type'] == 'work') {
                primaryColor = 'lightblue';
                secondaryColor = 'blue';
            }
            this.task = {
                completed: completed,
                due: due,
                duration: Number(this.task.value['duration']),
                name: this.task.value['name'],
                type: this.task.value['type'],
                scheduledDate: scheduledDate,
                scheduledTime: scheduledTime,
                primaryColor: primaryColor,
                secondaryColor: secondaryColor
            }
            if (this.editTask) {
                let taskDoc = this.afs.doc<Task>('tasks/' + this.taskID);
                taskDoc.update(this.task);
            }
            else {
                this.tasksCollection.add(this.newTask);
            }
            this.navCtrl.pop();
        }
    }

    deleteTask() {
        let taskDoc = this.afs.doc<Task>('tasks/' + this.task.id);
        taskDoc.delete();
        this.navCtrl.pop();
    }

  }
