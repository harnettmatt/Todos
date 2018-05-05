import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-new-task',
  templateUrl: 'new-task.html',
})
export class NewTaskPage {

    newTask = {};

    constructor(public navCtrl: NavController, public navParams: NavParams) {
    }

    sumbitForm() {
        console.log(this.newTask);
    }

}
