import {NavController, Item, ModalController} from 'ionic-angular';
import { Component, OnDestroy, OnChanges, OnInit, Input, Output, EventEmitter, HostListener, SimpleChanges, Optional, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SearchableIonSelectView } from './searchable-ion-select-view/searchable-ion-select-view';
import { Form } from 'ionic-angular/util/form';

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
  set items(items: any[]) {
    this._items.splice(0, this._items.length);
    Array.prototype.push.apply(this._items, items);
  }

  @Input() title: string;
  @Input() isSearching: boolean;
  @Input() valueField: string;
  @Input() textField: string;
  @Input() searchPlaceholder: string = 'Search';
  @Input() multiple: boolean;
  @Input() isModal: boolean;

  @Output() onChange: EventEmitter<any> = new EventEmitter();
  @Output() onSearch: EventEmitter<any> = new EventEmitter();

  constructor(
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private ionForm: Form,
    @Optional() private ionItem: Item
  ) {
  }

  ngOnInit() {
    this.ionForm.register(this);

    if (this.ionItem) {
      this.ionItem.setElementClass('item-select-searchable', true);
    }
  }

  ngOnDestroy() {
    this.ionForm.deregister(this);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['items'] && this.items.length > 0) {
      this.setValue(this.value);
    }
  }

  initFocus() { }

  @HostListener('click', ['$event'])
  _click(event: UIEvent) {
    if (event.detail === 0) {
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

  formatItem(value: any): string {
    if (this.isNullOrWhiteSpace(value)) {
      return null;
    }
    if(value.map){
      return this.textField ? value.map(val => val[this.textField]) : value.toString()
    }
    return this.textField ? value[this.textField] : value.toString();
  }

  formatValue(): string {
    if (!this.value) {
      return null;
    }

    return this.formatItem(this.value);
  }

  private open() {
    if(this.isModal){
        let modal = this.modalCtrl.create(SearchableIonSelectView, {selectComponent: this});
        modal.present();
    }else{
        this.navCtrl.push(SearchableIonSelectView, {
          selectComponent: this,
          navController: this.navCtrl
        });
    }
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
    this.setValue(obj);
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {

  }
}