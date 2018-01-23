import { NavController, Searchbar, NavParams } from 'ionic-angular';
import { SearchableIonSelectComponent } from './../searchable-ion-select.component';
import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'searchable-ion-select-view',
  templateUrl: 'searchable-ion-select-view.html'
})
export class SearchableIonSelectView {

  public searchableIonSelect: SearchableIonSelectComponent;
  public filteredItems: any[] = [];
  public selectedItems: any[] = [];
  public navCtrl: NavController;
  @ViewChild('searchBar') searchBar: Searchbar;

  constructor(
    private navParams: NavParams
  ) {
    this.searchableIonSelect = <SearchableIonSelectComponent>this.navParams.get('selectComponent');
    this.navCtrl = <NavController>this.navParams.get('navController');
    this.filteredItems = this.searchableIonSelect.items;
    this.filterItems();

    if (this.searchableIonSelect.value) {
      if (this.searchableIonSelect.multiple) {
        this.searchableIonSelect.value.forEach(item => {
          this.selectedItems.push(item);
        });
      } else {
        this.selectedItems.push(this.searchableIonSelect.value);
      }
    }
  }

  ngAfterViewInit() {
    if (this.searchableIonSelect) {
      // Focus after a delay because focus doesn't work without it.
      setTimeout(() => {
        // this.searchableIonSelect.setFocus();
      }, 1000);
    }
  }

  isItemSelected(item: any) {
    return this.selectedItems.find(selectedItem => {
      if (this.searchableIonSelect.valueField) {
        return item[this.searchableIonSelect.valueField] === selectedItem[this.searchableIonSelect.valueField];
      }

      return item === selectedItem;
    }) !== undefined;
  }

  deleteSelectedItem(item: any) {
    let itemToDeleteIndex;

    this.selectedItems.forEach((selectedItem, itemIndex) => {
      if (this.searchableIonSelect.valueField) {
        if (item[this.searchableIonSelect.valueField] === selectedItem[this.searchableIonSelect.valueField]) {
          itemToDeleteIndex = itemIndex;
        }
      } else if (item === selectedItem) {
        itemToDeleteIndex = itemIndex;
      }
    });

    this.selectedItems.splice(itemToDeleteIndex, 1);
  }

  public addSelectedItem(item: any) {
    this.selectedItems.push(item);
  }

  select(item: any) {
    if (this.searchableIonSelect.multiple) {
      if (this.isItemSelected(item)) {
        this.deleteSelectedItem(item);
      } else {
        this.addSelectedItem(item);
      }
    } else {
      if (!this.isItemSelected(item)) {
        this.selectedItems = [];
        this.addSelectedItem(item);
        this.searchableIonSelect.select(item);
      }

      this.close();
    }
  }

  public ok() {
    this.searchableIonSelect.select(this.selectedItems.length ? this.selectedItems : null);
    this.close();
  }

  public close() {
    // Focused input interferes with the animation.
    // Blur it first, wait a bit and then close the page.
    if (this.searchBar) {
      this.searchBar._fireBlur();
    }

    setTimeout(() => {
      this.navCtrl.pop();

      if (!this.searchableIonSelect.hasSearchEvent) {
        this.searchableIonSelect.filterText = '';
      }
    });
  }

  public filterItems() {
    if (this.searchableIonSelect.hasSearchEvent) {
      // Delegate filtering to the event.
      this.searchableIonSelect.emitSearch();
    } else {
      let items = [];

      // Default filtering.
      if (!this.searchableIonSelect.filterText || !this.searchableIonSelect.filterText.trim()) {
        items = this.searchableIonSelect.items;
      } else {
        let filterText = this.searchableIonSelect.filterText.trim().toLowerCase();

        items = this.searchableIonSelect.items.filter(item => {
          return (this.searchableIonSelect.textField ? item[this.searchableIonSelect.textField] : item)
            .toLowerCase().indexOf(filterText) !== -1;
        });
      }

      this.filteredItems = items;
    }
  }

}