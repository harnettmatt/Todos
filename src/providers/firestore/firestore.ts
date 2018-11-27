import { Injectable } from '@angular/core';
import { AngularFirestoreCollection } from 'angularfire2/firestore';
import { Event } from '../../pages/events/events';
import { Task } from '../../pages/tasks/tasks';

@Injectable()
export class FirestoreProvider {

    getTaskSnapshotChanges(taskCollection: AngularFirestoreCollection<Task>) {
        return taskCollection.snapshotChanges().map(actions => {
            return actions.map(a => {
                const task = a.payload.doc.data() as Task;
                const id = a.payload.doc.id;
                task.id = id;
                return task;
            });
        });
    }

    getEventSnapshotChanges(eventCollection: AngularFirestoreCollection<Event>) {
        return eventCollection.snapshotChanges().map(actions => {
            return actions.map(a => {
                const event = a.payload.doc.data() as Event;
                const id = a.payload.doc.id;
                event.id = id;
                return event;
            });
        });
    }

}
