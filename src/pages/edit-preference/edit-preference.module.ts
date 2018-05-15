import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditPreferencePage } from './edit-preference';

@NgModule({
  declarations: [
    EditPreferencePage,
  ],
  imports: [
    IonicPageModule.forChild(EditPreferencePage),
  ],
})
export class EditPreferencePageModule {}
