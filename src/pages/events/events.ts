import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { EditEventPage } from '../edit-event/edit-event';


export interface Event {
    id:          string;
    name:        string;
    from:        number;
    to:          number;
}

@IonicPage()
@Component({
    selector: 'page-events',
    templateUrl: 'events.html',
})
export class EventsPage {

    eventsCollection: AngularFirestoreCollection<Event>;
    events: Observable<Event[]>;

    constructor(public navCtrl: NavController, public navParams: NavParams, private afs: AngularFirestore) {
        this.eventsCollection = this.afs.collection('events');
        this.events = this.eventsCollection.snapshotChanges().map(actions => {
            return actions.map(a => {
                const event = a.payload.doc.data() as Event;
                const id = a.payload.doc.id;
                event.id = id;
                return event;
            });
        });
    }

    editEvent(event) {
        this.navCtrl.push(EditEventPage, { event: event });
    }

}
