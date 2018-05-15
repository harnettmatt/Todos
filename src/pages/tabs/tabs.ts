import { Component } from '@angular/core';

import { CalendarPage } from '../calendar/calendar';
import { TasksPage } from '../tasks/tasks';
import { PreferencesPage } from '../preferences/preferences';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = CalendarPage;
  tab2Root = TasksPage;
  tab3Root = PreferencesPage;

  constructor() {

  }
}
