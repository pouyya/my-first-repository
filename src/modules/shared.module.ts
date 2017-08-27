import { GroupByPipe } from './../pipes/group-by.pipe';
import { KeysPipe } from './../pipes/keys.pipe';
import { NgModule } from '@angular/core';
import { ClickStopPropagation } from './../directives/clickStopPropagation.directive';

@NgModule({
    imports: [],
    exports: [ClickStopPropagation, KeysPipe, GroupByPipe],
    declarations: [ClickStopPropagation, KeysPipe, GroupByPipe],
    providers: [],
})
export class SharedModule { }