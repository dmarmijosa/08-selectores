import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountriesService } from '../../services/countries.service';
import {
  Region,
  SmallCountry,
  Country,
} from '../../interfaces/country.interfaces';
import { filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: ``,
})
export class SelectorPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private countriesService = inject(CountriesService);
  public countriesByRegion: SmallCountry[] = [];

  public borders: SmallCountry[] = [];

  ngOnInit(): void {
    this.onRegionChange();
    this.onCountryChange();
  }

  myForm: FormGroup = this.fb.group({
    region: ['', [Validators.required]],
    country: ['', Validators.required],
    border: ['', [Validators.required]],
  });

  get regions(): Region[] {
    return this.countriesService.regions;
  }
  onRegionChange(): void {
    this.myForm
      .get('region')!
      .valueChanges.pipe(
        tap(() => this.myForm.get('country')?.setValue('')),
        tap(() => (this.borders = [])),
        switchMap((region) =>
          this.countriesService.getCountriesByRegion(region),
        ),
      )
      .subscribe((countries) => {
        this.countriesByRegion = countries;
      });
  }

  onCountryChange(): void {
    this.myForm
      .get('country')!
      .valueChanges.pipe(
        tap(() => this.myForm.get('border')?.setValue('')),
        tap((countryValue) => console.log(countryValue)),
        filter((countryValue: string) => countryValue.length > 0),
        switchMap((alphacode) =>
          this.countriesService.getCountryByAlphaCode(alphacode),
        ),
        switchMap((countries) =>
          this.countriesService.getCountryBorderByCodes(countries.borders),
        ),
      )
      .subscribe((countries) => {
        this.borders=countries;
      });
  }
}
