import { NavController, Platform, Item, Form } from 'ionic-angular';
import { Component, OnDestroy, OnChanges, OnInit, Input, Output, EventEmitter, HostListener, SimpleChanges, Optional, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SearchableIonSelectView } from './searchable-ion-select-view/searchable-ion-select-view';

/**
 * @name SearchableIonSelectComponent
 * @description An extended stand-alone version of the Ionic's Select Element i.e. <ion-select>
 * The select view is searchable, and can only search the data currently being loaded
 * The select is not Async and doesn't not support Inifite Loading of data. The data needs to be loaded
 * at once.
 * 
 * ### Simple Search
 * ```html
 * <ion-item>
 *   <ion-label>Countries</ion-label>
 *   <searchable-ion-select
 *    [(ngModel)]="_country"
 *    title="Select Country"
 *    valueField="id"
 *    textField="countryName"
 *    [items]="countries"
 *    (onChange)="onSelect($event)">
 *   </searchable-ion-select>
 * </ion-item>
 * ```
 */
@Component({
  selector: 'searchable-ion-select',
  templateUrl: 'searchable-ion-select.html',
  styleUrls: ['/components/searchable-ion-select/searchable-ion-select.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchableIonSelectComponent),
      multi: true
    }
  ],
  host: {
    'class': 'select-searchable'
  }
})
export class SearchableIonSelectComponent implements ControlValueAccessor, OnDestroy, OnChanges, OnInit {

  public filterText = '';
  public value: any = null;
  public hasSearchEvent: boolean;

  private _items: any[] = [];
  get items(): any[] {
    return this._items;
  }
  @Input('items')
  set items(values: any[]) {
    this._items = values;
  }

  @Input() title: string;
  @Input() isSearching: boolean;
  @Input() valueField: string;
  @Input() textField: string;
  @Input() searchPlaceholder: string = 'Search';
  @Input() multiple: boolean;

  @Output() onChange: EventEmitter<any> = new EventEmitter();
  @Output() onSearch: EventEmitter<any> = new EventEmitter();

  constructor(
    private navCtrl: NavController,
    private ionForm: Form,
    private platform: Platform,
    @Optional() private ionItem: Item
  ) {
  }

  ngOnInit() {
    // this.ionForm.register()

    if (this.ionItem) {
      this.ionItem.setElementClass('item-select-searchable', true);
    }
  }

  ngOnDestroy() {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['items'] && this.items.length > 0) {
      this.setValue(this.value);
    }
  }

  @HostListener('click', ['$event'])
  _click(event: UIEvent) {
    if (event.detail === 0) {
      // Don't continue if the click event came from a form submit.
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.open();
  }

  public select(selectedItem: any) {
    this.value = selectedItem;
    this.emitChange();
  }

  /**
   * @event Emit Selection Change
   */
  public emitChange() {
    this.propagateChange(this.value);
    this.onChange.emit({
      component: this,
      value: this.value
    });
  }

  /**
   * @event Emit Search change
   */
  public emitSearch() {
    this.onSearch.emit({
      component: this,
      text: this.filterText
    });
  }

  private open() {
    this.navCtrl.push(SearchableIonSelectView, {
      selectComponent: this,
      navController: this.navCtrl
    });
  }

  private propagateChange = (_: any) => { }

  private isNullOrWhiteSpace(value: any): boolean {
    if (value === null || value === undefined) {
      return true;
    }

    return value.toString().replace(/\s/g, '').length < 1;
  }

  setValue(value: any) {
    this.value = value;

    if (this.value && !this.isNullOrWhiteSpace(this.value[this.valueField])) {
      let selectedItem = this.items.find(item => {
        return item[this.valueField] === this.value[this.valueField];
      });

      if (selectedItem) {
        this.value = selectedItem;
      }
    }
  }

  writeValue(obj: any): void {

  }

  registerOnChange(fn: any): void {

  }

  registerOnTouched(fn: any): void {

  }
}