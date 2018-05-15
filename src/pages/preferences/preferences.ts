import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';


interface Preference {
    name: string;
    from: string;
    to:   string;
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
        this.preferences = this.preferencesCollection.valueChanges();
    }

}
