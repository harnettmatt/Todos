import { NgModule } from '@angular/core';
import { MilitaryToAmPmPipe } from './military-to-am-pm/military-to-am-pm';
@NgModule({
	declarations: [MilitaryToAmPmPipe],
	imports: [],
	exports: [MilitaryToAmPmPipe]
})
export class PipesModule {}
