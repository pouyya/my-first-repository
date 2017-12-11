import { Component } from '@angular/core';
import { BackOfficeModule } from '../../modules/backOfficeModule';
import { PageModule } from '../../metadata/pageModule';

@PageModule(() => BackOfficeModule)
@Component({
  selector: 'page-variables',
  templateUrl: 'home.html'
})
export class HomePage {
  constructor() {
  }
}
