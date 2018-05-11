import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

interface Event {
    name: string;
    from: string; //should this be a date
    to: string; //should this be a date
    frequency: string[];
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
                const data = a.payload.doc.data() as Event;
                const id = a.payload.doc.id;
                return { id, ...data };
            });
        });
    }

    // addEvent() {
    //     this.navCtrl.push(NewEventPage);
    // }
    //
    // editTask(event) {
    //     this.navCtrl.push(EditEventPage, { data: event });
    // }

}
