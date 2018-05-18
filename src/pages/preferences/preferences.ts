import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { EditPreferencePage } from '../edit-preference/edit-preference';


export interface Preference {
    id:   string;
    name: string;
    from: number;
    to:   number;
}

@IonicPage()
@Component({
    selector: 'page-preferences',
    templateUrl: 'preferences.html',
})
export class PreferencesPage {

    preferencesCollection: AngularFirestoreCollection<Preference>;
    preferences: Observable<Preference[]>;

    constructor(public navCtrl: NavController, public navParams: NavParams, private afs: AngularFirestore) {
        this.preferencesCollection = this.afs.collection('preferences');
        this.preferences = this.preferencesCollection.snapshotChanges().map(actions => {
            return actions.map(a => {
                const preference = a.payload.doc.data() as Preference;
                const id = a.payload.doc.id;
                preference.id = id;
                return preference;
            });
        });
    }

    editPreference(preference) {
        this.navCtrl.push(EditPreferencePage, { preference: preference });
    }

}
