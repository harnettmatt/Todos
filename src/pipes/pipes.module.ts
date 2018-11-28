import { NgModule } from '@angular/core';
import { MilitaryToAmPmPipe } from './military-to-am-pm/military-to-am-pm';
import { MinutesToAmPmPipe } from './minutes-to-am-pm/minutes-to-am-pm';
@NgModule({
	declarations: [MilitaryToAmPmPipe,
    MinutesToAmPmPipe],
	imports: [],
	exports: [MilitaryToAmPmPipe,
    MinutesToAmPmPipe]
})
export class PipesModule {}
