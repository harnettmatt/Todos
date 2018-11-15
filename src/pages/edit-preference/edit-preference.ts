import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Preference } from '../preferences/preferences';

@IonicPage()
@Component({
    selector: 'page-edit-preference',
    templateUrl: 'edit-preference.html',
})
export class EditPreferencePage {

    editPreferenceForm: FormGroup;
    editPreference: Preference;
    editPreferenceID: string;
    preferencesCollection: AngularFirestoreCollection<Preference>;

    constructor(public navCtrl: NavController, public navParams: NavParams, private formBuilder: FormBuilder, private afs: AngularFirestore) {
        this.editPreference = this.navParams.get('preference');
        this.editPreferenceID = this.editPreference.id;
        this.editPreferenceForm = this.formBuilder.group({
            name: [this.editPreference.name],
            from: [this.editPreference.from],
            to:   [this.editPreference.to],
        });
        this.preferencesCollection = this.afs.collection('preferences');
    }

    submitForm() {
        this.editPreference  = {
            id:   this.editPreferenceID,
            name: this.editPreferenceForm.value['name'],
            from: Number(this.editPreferenceForm.value['from']),
            to:   Number(this.editPreferenceForm.value['to'])
        }
        let taskDoc = this.afs.doc<Preference>('preferences/' + this.editPreferenceID);
        taskDoc.update(this.editPreference);
        this.navCtrl.pop();
    }

}
