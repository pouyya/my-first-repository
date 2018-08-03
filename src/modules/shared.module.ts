import { LocalDatePipe } from './../pipes/local-date.pipe';
import { GroupByPipe } from './../pipes/group-by.pipe';
import { KeysPipe } from './../pipes/keys.pipe';
import { NgModule } from '@angular/core';
import { ClickStopPropagation } from './../directives/clickStopPropagation.directive';
import {TranslatorPipe} from "../pipes/translator.pipe";

@NgModule({
    imports: [],
    exports: [ClickStopPropagation, KeysPipe, GroupByPipe, LocalDatePipe, TranslatorPipe],
    declarations: [ClickStopPropagation, KeysPipe, GroupByPipe, LocalDatePipe, TranslatorPipe],
    providers: [],
})
export class SharedModule { }