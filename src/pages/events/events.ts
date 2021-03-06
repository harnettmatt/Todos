import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { EditEventPage } from '../edit-event/edit-event';
import { NewEventPage } from '../new-event/new-event'
import { FirestoreProvider } from '../../providers/firestore/firestore';

export interface Event {
    id?:            string;
    name:           string;
    from:           number;
    to:             number;
    common:         boolean;
    primaryColor:   string;
    secondaryColor: string;
    days:           any;
    disable:        boolean;
}

@IonicPage()
@Component({
    selector: 'page-events',
    templateUrl: 'events.html',
})
export class EventsPage {

    isDataAvailable: boolean = false;
    commonEventsCollection: AngularFirestoreCollection<Event>;
    commonEventsSnapshot: Observable<Event[]>;
    sortedCommonEvents: Event[];
    commonEventsSubscription: any;
    customEventsCollection: AngularFirestoreCollection<Event>;
    customEventsSnapshot: Observable<Event[]>;
    sortedCustomEvents: Event[];
    customEventsSubscription: any;

    constructor(public navCtrl: NavController, public navParams: NavParams, private afs: AngularFirestore, private firestoreProvider: FirestoreProvider) {
    }

    ngOnInit() {
        let commonEventsPromise = this.fetchCommonEvents();
        let customEventsPromise = this.fetchCustomEvents();
        Promise.all([commonEventsPromise, customEventsPromise]).then(() => {
            this.isDataAvailable = true;
        });
    }

    fetchCommonEvents() {
        this.commonEventsCollection = this.afs.collection('events', ref => ref.where('common', '==', true));
        this.commonEventsSnapshot = this.firestoreProvider.getEventSnapshotChanges(this.commonEventsCollection);
        let commonEventsPromise = new Promise((resolve, reject) => {
            this.commonEventsSubscription = this.commonEventsSnapshot.subscribe(events => {
                events.sort(function (a, b) { return a.from - b.from });
                this.sortedCommonEvents = events;
                resolve();
            });
        });
        return commonEventsPromise;
    }

    fetchCustomEvents() {
        this.customEventsCollection = this.afs.collection('events', ref => ref.where('common', '==', false));
        this.customEventsSnapshot = this.firestoreProvider.getEventSnapshotChanges(this.customEventsCollection);
        let customEventsPromise = new Promise((resolve, reject) => {
            this.customEventsSubscription = this.customEventsSnapshot.subscribe(events => {
                events.sort(function (a, b) { return a.from - b.from });
                this.sortedCustomEvents = events;
                resolve();
            });
        });
        return customEventsPromise;
    }

    addEvent() {
        this.navCtrl.push(NewEventPage);
    }

    editEvent(event) {
        this.navCtrl.push(EditEventPage, { event: event });
    }

    deleteEvent(event) {
        let eventDoc = this.afs.doc<Event>('events/' + event.id);
        eventDoc.delete();
    }

}
