import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Event, EventsPage } from '../events/events';

@IonicPage()
@Component({
    selector: 'page-edit-event',
    templateUrl: 'edit-event.html',
})
export class EditEventPage {

    editEventForm: FormGroup;
    editEvent: Event;
    editEventID: string;
    eventsCollection: AngularFirestoreCollection<Event>;
    days: any;
    disableButtonText: string;

    constructor(public navCtrl: NavController, public navParams: NavParams, private formBuilder: FormBuilder, private afs: AngularFirestore) {
        this.editEvent = this.navParams.get('event');
        this.editEventID = this.editEvent.id;
        this.disableButtonText = 'Delete Event';
        if (this.editEvent.common) {
            this.disableButtonText = 'Disable Event';
        }
        this.editEventForm = this.formBuilder.group({
            name: [this.editEvent.name],
            from: [this.editEvent.from],
            to:   [this.editEvent.to],
            sunday: [this.editEvent.days.sunday],
            monday: [this.editEvent.days.monday],
            tuesday: [this.editEvent.days.tuesday],
            wednesday: [this.editEvent.days.wednesday],
            thursday: [this.editEvent.days.thursday],
            friday: [this.editEvent.days.friday],
            saturday: [this.editEvent.days.saturday]
        });
        this.eventsCollection = this.afs.collection('events');
    }

    submitForm() {
        this.days = {
            sunday: this.editEventForm.value['sunday'],
            monday: this.editEventForm.value['monday'],
            tuesday: this.editEventForm.value['tuesday'],
            wednesday: this.editEventForm.value['wednesday'],
            thursday: this.editEventForm.value['thursday'],
            friday: this.editEventForm.value['friday'],
            saturday: this.editEventForm.value['saturday']
        }
        this.editEvent  = {
            id:   this.editEventID,
            name: this.editEventForm.value['name'],
            from: Number(this.editEventForm.value['from']),
            to:   Number(this.editEventForm.value['to']),
            common: this.editEvent.common,
            disable: this.editEvent.disable,
            days: this.days,
            primaryColor: this.editEvent.primaryColor,
            secondaryColor: this.editEvent.secondaryColor
        }
        let eventDoc = this.afs.doc<Event>('events/' + this.editEventID);
        eventDoc.update(this.editEvent);
        this.navCtrl.pop();
    }

    disableEvent() {
        let eventDoc = this.afs.doc<Event>('events/' + this.editEventID);
        if (this.editEvent.common) {
            this.editEvent.disable = true;
            eventDoc.update(this.editEvent);
        }
        else {
            eventDoc.delete();
        }
        this.navCtrl.pop();
    }
}
