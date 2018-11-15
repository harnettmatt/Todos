import { Component } from '@angular/core';

import { CalendarPage } from '../calendar/calendar';
import { TasksPage } from '../tasks/tasks';
import { EventsPage } from '../events/events';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = CalendarPage;
  tab2Root = TasksPage;
  tab3Root = EventsPage;

  constructor() {

  }
}
