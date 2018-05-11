import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { FormBuilder, FormGroup } from '@angular/forms';

interface Event {
    name: string;
    from: string; //should this be a date
    to: string; //should this be a date
    frequency: string[];
}

@IonicPage()
@Component({
    selector: 'page-new-event',
    templateUrl: 'new-event.html',
})
export class NewEventPage {

    eventsCollection: AngularFirestoreCollection<Event>;
    newEventForm: FormGroup;
    newEvent: Event;

    constructor(public navCtrl: NavController, public navParams: NavParams, private formBuilder: FormBuilder, private afs: AngularFirestore) {
        this.newEventForm = this.formBuilder.group({
            name: [''],
            frequency: [''],
            from: [''],
            to: ['']
        });
        this.eventsCollection = this.afs.collection('events');
    }

    submitForm() {
        this.newEvent = {
            name: this.newEventForm.value['name'],
            frequency: this.newEventForm.value['frequency'],
            from: this.newEventForm.value['from'],
            to: this.newEventForm.value['to']
        }
        this.eventsCollection.add(this.newEvent);
        this.navCtrl.pop();
    }

}
