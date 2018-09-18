import _ from 'lodash';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { barberIcons } from '@simplepos/core/dist/metadata/BarberIcons';
import { coffeeIcons } from '@simplepos/core/dist/metadata/CoffeeIcons';
import { icons } from '@simplepos/core/dist/metadata/itemIcons';
import { SyncContext } from "../../services/SyncContext";

@Component({
  selector: 'icon-select',
  templateUrl: 'icon-select.html'
})
export class IconSelectComponent {

  @Input() selectedIcon: string;
  @Output() confirmSelection: EventEmitter<any> = new EventEmitter<any>();
  public icons: Array<any>;
  private noIcon: string = "No icon";
  public businessType: string;

  constructor(
    private syncContext: SyncContext
  ) {
    this.businessType = this.syncContext.currentStore.businessType;
    this.icons = _.values(icons);
    if (this.businessType == "barber")
      this.icons = _.values(barberIcons);
    if (this.businessType == "coffee-shop")
      this.icons = _.values(coffeeIcons);

    this.icons.unshift({ name: 'No icon', type: '' });
  }

  public ngAfterViewInit() {
    !this.selectedIcon && (this.selectedIcon = this.noIcon);
  }

  public select() {
    this.confirmSelection.emit({ selectedIcon: this.selectedIcon });
  }

}