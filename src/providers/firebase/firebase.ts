import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';

/*
  Generated class for the FirebaseProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class FirebaseProvider {

  constructor(public afd: AngularFireDatabase) { }

  getTasks() {
    return this.afd.list('/tasks/');
  }

  addTask(task) {
    this.afd.list('/tasks/').push(task);
  }

  removeTask(id) {
    this.afd.list('/tasks/').remove(id);
  }

}
