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
    daysForm: FormGroup;
    newEvent: Event;
    eventsCollection: AngularFirestoreCollection<Event>;
    days: any;

    constructor(public navCtrl: NavController, public navParams: NavParams, private formBuilder: FormBuilder, private afs: AngularFirestore) {
        this.newEventForm = this.formBuilder.group({
            name: [''],
            from: [''],
            to: [''],
            common: [''],
            sunday: ['false'],
            monday: ['false'],
            tuesday: ['false'],
            wednesday: ['false'],
            thursday: ['false'],
            friday: ['false'],
            saturday: ['false']
        });
        this.eventsCollection = this.afs.collection('events');
    }

    submitForm() {
        this.days = {
            sunday: this.newEventForm.value['sunday'],
            monday: this.newEventForm.value['monday'],
            tuesday: this.newEventForm.value['tuesday'],
            wednesday: this.newEventForm.value['wednesday'],
            thursday: this.newEventForm.value['thursday'],
            friday: this.newEventForm.value['friday'],
            saturday: this.newEventForm.value['saturday']
        }

        this.newEvent = {
            name: this.newEventForm.value['name'],
            from: this.newEventForm.value['from'],
            to: this.newEventForm.value['to'],
            common: false,
            days: this.days
        }

        this.eventsCollection.add(this.newEvent);
        this.navCtrl.pop();
    }

    updateDays() {
        console.log(this.days);
    }
}
