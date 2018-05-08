import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { CalendarPage } from '../pages/calendar/calendar';
import { TabsPage } from '../pages/tabs/tabs';
import { TasksPage } from '../pages/tasks/tasks';
import { NewTaskPage } from '../pages/new-task/new-task';
import { EditTaskPage } from '../pages/edit-task/edit-task';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HttpModule } from '@angular/http';
import { AngularFirestoreModule} from 'angularfire2/firestore';
import { AngularFireModule } from 'angularfire2';

const firebaseConfig = {
    apiKey: "AIzaSyCv0vHOydYpvBiIRcxV8pqeOkD5VP6vfgo",
    authDomain: "todos-c0125.firebaseapp.com",
    databaseURL: "https://todos-c0125.firebaseio.com",
    projectId: "todos-c0125",
    storageBucket: "todos-c0125.appspot.com",
    messagingSenderId: "358525145269"
  };

@NgModule({
  declarations: [
    MyApp,
    CalendarPage,
    TabsPage,
    TasksPage,
    NewTaskPage,
    EditTaskPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    CalendarPage,
    TabsPage,
    TasksPage,
    NewTaskPage,
    EditTaskPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
