import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Event } from '../events/events';

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

    constructor(public navCtrl: NavController, public navParams: NavParams, private formBuilder: FormBuilder, private afs: AngularFirestore) {
        this.editEvent = this.navParams.get('event');
        this.editEventID = this.editEvent.id;
        this.editEventForm = this.formBuilder.group({
            name: [this.editEvent.name],
            from: [this.editEvent.from],
            to:   [this.editEvent.to],
        });
        this.eventsCollection = this.afs.collection('events');
    }

    submitForm() {
        this.editEvent  = {
            id:   this.editEventID,
            name: this.editEventForm.value['name'],
            from: Number(this.editEventForm.value['from']),
            to:   Number(this.editEventForm.value['to'])
        }
        let taskDoc = this.afs.doc<Event>('events/' + this.editEventID);
        taskDoc.update(this.editEvent);
        this.navCtrl.pop();
    }

}
