import { Component, OnInit, Output, Input, EventEmitter, HostListener } from '@angular/core';

@Component({
  selector: 'barcode-scanner',
  template: ``,
  styles: [``]
})
export class BarcodeScannerComponent implements OnInit {

  @Input() scanDuration: number = 400;
  @Input() prefix: string = '';
  @Input() length: number = -1;

  @Output() scan: EventEmitter<string> = new EventEmitter<string>();

  private finishScanTimeoutId: any = null;
  private barcode: string = '';

  @HostListener('document:keydown', ['$event'])
  public readBarcode(e: KeyboardEvent) {
    if (this.finishScanTimeoutId = null) {
      this.finishScanTimeoutId = setTimeout(this.resetScanState, this.scanDuration);
    }

    if (e.keyCode === 13) {
      if (this.checkLenght() && this.checkPrefix()) {
        let currentBarcode = this.barcode;
        clearTimeout(this.finishScanTimeoutId);
        this.scan.emit(currentBarcode);
        this.resetScanState();
      }
    } else {
      this.barcode += e.key;
    }
  }

  ngOnInit() {
  }

  private resetScanState() {
    this.finishScanTimeoutId = null;
    this.barcode = '';
  }

  private checkPrefix() {
    return !this.prefix || this.prefix.length == 0 || (this.barcode && this.barcode.startsWith(this.prefix));
  }

  private checkLenght() {
    return length < 1 || (this.barcode && this.barcode.length == length);
  }
}