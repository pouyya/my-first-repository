import { Component } from '@angular/core';
import { ModuleBase } from './moduelBase';
import { HomePage } from './../pages/home/home';

export class SalesModule  implements ModuleBase {
  public pages: Array<any> = [
    { title: 'Sell', icon: 'home', component: HomePage },
    { title: 'Open/Close', icon: 'home', Component: HomePage },
    { title: 'Back Office', icon: 'home', component: HomePage }
  ];
}