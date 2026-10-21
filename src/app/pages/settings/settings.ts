
import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  saved = false;

  save(): void {
    this.saved = true;

    setTimeout(() => {
      this.saved = false;
    }, 3000);
  }
}
