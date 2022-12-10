import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Params, Router } from '@angular/router';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent {
  constructor(private router: Router) {}

  onSubmit(form: NgForm) {
    const queryParams: Params = {};

    if (form.value.search.trim()) {
      queryParams['search'] = form.value.search;
    }

    this.router.navigate(['games'], {
      queryParams,
    });
  }
}
