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
    common:      boolean;
}

@IonicPage()
@Component({
    selector: 'page-events',
    templateUrl: 'events.html',
})
export class EventsPage {

    commonEventsCollection: AngularFirestoreCollection<Event>;
    commonEvents: Observable<Event[]>;
    customEventsCollection: AngularFirestoreCollection<Event>;
    customEvents: Observable<Event[]>;

    constructor(public navCtrl: NavController, public navParams: NavParams, private afs: AngularFirestore) {
        this.commonEventsCollection = this.afs.collection('events', ref => ref.where('common', '==', true));
        this.commonEvents = this.commonEventsCollection.snapshotChanges().map(actions => {
            return actions.map(a => {
                const event = a.payload.doc.data() as Event;
                const id = a.payload.doc.id;
                event.id = id;
                return event;
            });
        });
        this.customEventsCollection = this.afs.collection('events', ref => ref.where('common', '==', false));
        this.customEvents = this.customEventsCollection.snapshotChanges().map(actions => {
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
