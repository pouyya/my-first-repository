import { Component, OnInit, Output, Input, EventEmitter, HostListener } from '@angular/core';

@Component({
  selector: 'barcode-scanner',
  template: ``,
  styles: [``]
})
export class BarcodeScannerComponent implements OnInit {

  @Input() barcodeValueRegExp: string = '';
  @Input() scanDuration: number = 500;
  @Input() finishScanOnMatch: boolean = true;

  public finishScanTimeoutId: number = 0;
  public valueBuffer: string = '';
  public barcodeValueTest = new RegExp(this.barcodeValueRegExp);
  public barcode: string = '';

  @Output() scan: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }

  @HostListener('document:keydown', ['$event'])
  public readBarcode(e: KeyboardEvent) {
    let code = e.keyCode;
    if (code === 13) { // Enter is pressed
      // console.warn("scan detected!");
      let currentBarcode = this.barcode;

      if (this.finishScanOnMatch && this.barcodeValueTest.test(currentBarcode)) {
        clearTimeout(this.finishScanTimeoutId);
        this.scan.emit(currentBarcode);
      } else {
        console.error("There was an error.");
      }

      this.resetScanState();

    } else {
      this.barcode += e.key;
      // console.warn(this.barcode);
      // this.barcode += String.fromCharCode(code);
    }
  }

  ngOnInit() {
    // let barcodePrefix = this.barcodePrefix;  
    let scanDuration = this.scanDuration;
    let finishScanOnMatch = this.finishScanOnMatch;

    if (finishScanOnMatch != null && typeof finishScanOnMatch !== 'boolean') {
      throw new TypeError('finishScanOnMatch must be a boolean');
    }

    if (scanDuration && typeof scanDuration !== 'number') {
      throw new TypeError('scanDuration must be a number');
    }

  }

  private resetScanState() {
    this.finishScanTimeoutId = null;
    this.valueBuffer = '';
    this.barcode = '';
  }
}