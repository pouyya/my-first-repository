import { KeysPipe } from './../pipes/keys.pipe';
import { NgModule } from '@angular/core';
import { ClickStopPropagation } from './../directives/clickStopPropagation.directive';

@NgModule({
    imports: [],
    exports: [ClickStopPropagation, KeysPipe],
    declarations: [ClickStopPropagation, KeysPipe],
    providers: [],
})
export class SharedModule { }