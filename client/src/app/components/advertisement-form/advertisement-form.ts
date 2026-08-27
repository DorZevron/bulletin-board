import { Component, EventEmitter, Input, OnInit, Output, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { AdvertisementCategory } from '../../models/advertisement-category';
import { Advertisement } from '../../models/advertisement';
import { CreateAdvertisementRequest } from '../../models/create-advertisement-request';

interface NominatimReverseResult {
  display_name?: string;
  address?: {
    road?: string;
    house_number?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
  };
}

@Component({
  selector: 'app-advertisement-form',
  imports: [ReactiveFormsModule],
  templateUrl: './advertisement-form.html',
  styleUrl: './advertisement-form.scss',
})
export class AdvertisementForm implements OnInit {
  @Input() editingItem: Advertisement | null = null;
  @Output() submitted = new EventEmitter<CreateAdvertisementRequest>();
  @Output() cancelled = new EventEmitter<void>();


  protected readonly AdvertisementCategory = AdvertisementCategory;
  protected readonly categories = [
    AdvertisementCategory.BuySell,
    AdvertisementCategory.Events,
    AdvertisementCategory.Rent,
    AdvertisementCategory.Travel,
    AdvertisementCategory.Other
  ];

  protected readonly locationCoords = signal<{ latitude: number; longitude: number } | null>(null);
  protected readonly locationLoading = signal(false);
  protected readonly locationError = signal<string | null>(null);

  private readonly fb = new FormBuilder();
  private readonly http = inject(HttpClient);

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.maxLength(500)]],
    category: [AdvertisementCategory.Other, Validators.required],
    price: this.fb.control<number | null>(null),
    address: ['']
  });

  ngOnInit(): void {
    if (this.editingItem) {
      this.form.patchValue({
        title: this.editingItem.title,
        description: this.editingItem.description,
        category: this.editingItem.category,
        price: this.editingItem.price ?? null,
        address: this.editingItem.location?.address ?? ''
      });

      if (this.editingItem.location) {
        this.locationCoords.set({
          latitude: this.editingItem.location.latitude,
          longitude: this.editingItem.location.longitude
        });
      }
    }
  }

  detectLocation(): void {
    if (!navigator.geolocation) {
      this.locationError.set('הדפדפן לא תומך באיתור מיקום');
      return;
    }

    this.locationLoading.set(true);
    this.locationError.set(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.locationCoords.set({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        this.locationLoading.set(false);

        this.http.get<NominatimReverseResult>(
          `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
        ).subscribe({
          next: (result) => {
            const shortAddress = this.buildShortAddress(result.address);
            if (shortAddress && !this.form.controls.address.value) {
              this.form.patchValue({ address: shortAddress });
            }
          },
          error: (err) => {
            console.log('Reverse geocoding error', err);
          }
        });
      },
      () => {
        this.locationError.set('לא הצלחנו לאתר את המיקום שלך, וודא ששירותי המיקום דולקים');
        this.locationLoading.set(false);
      },
      { timeout: 8000, maximumAge: 300_000 }
    );
  }

  private buildShortAddress(address: NominatimReverseResult['address']): string | null {
    if (!address) {
      return null;
    }

    const streetPart = [address.road, address.house_number].filter(Boolean).join(' ');
    const cityPart = address.city ?? address.town ?? address.village ?? address.suburb ?? address.neighbourhood;

    const parts = [streetPart, cityPart].filter(Boolean);
    return parts.length ? parts.join(', ') : null;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const request: CreateAdvertisementRequest = {
      title: value.title,
      description: value.description,
      category: value.category,
      price: value.price ?? undefined,
      location: this.locationCoords()
        ? {
          address: value.address || undefined,
          latitude: this.locationCoords()!.latitude,
          longitude: this.locationCoords()!.longitude
        }
        : undefined
    };

    this.submitted.emit(request);
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
