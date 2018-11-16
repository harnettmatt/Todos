import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Event } from '../events/events';

@IonicPage()
@Component({
  selector: 'page-new-event',
  templateUrl: 'new-event.html',
})
export class NewEventPage {

    newEventForm: FormGroup;
    newEvent: Event;
    eventsCollection: AngularFirestoreCollection<Event>;

    constructor(public navCtrl: NavController, public navParams: NavParams, private formBuilder: FormBuilder, private afs: AngularFirestore) {
        this.newEventForm = this.formBuilder.group({
            name: [''],
            from: [''],
            to: [''],
            common: [''],
            days: [''],

        });
        this.eventsCollection = this.afs.collection('events');
    }

    submitForm() {
        this.newEvent = {
            name: this.newEventForm.value['name'],
            from: this.newEventForm.value['name'],
            to: this.newEventForm.value['name'],
            common: false,
            days: this.newEventForm.value['name'],
        }
        this.eventsCollection.add(this.newEvent);
        this.navCtrl.pop();
    }
}
