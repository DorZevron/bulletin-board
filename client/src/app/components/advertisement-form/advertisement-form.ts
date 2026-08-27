import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AdvertisementCategory } from '../../models/advertisement-category';
import { Advertisement } from '../../models/advertisement';
import { CreateAdvertisementRequest } from '../../models/create-advertisement-request';

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

  protected locationCoords: { latitude: number; longitude: number } | null = null;
  protected locationLoading = false;
  protected locationError: string | null = null;

  private readonly fb = new FormBuilder();

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
        this.locationCoords = {
          latitude: this.editingItem.location.latitude,
          longitude: this.editingItem.location.longitude
        };
      }
    }
  }

  detectLocation(): void {
    if (!navigator.geolocation) {
      this.locationError = 'הדפדפן לא תומך באיתור מיקום';
      return;
    }

    this.locationLoading = true;
    this.locationError = null;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.locationCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        this.locationLoading = false;
      },
      () => {
        this.locationError = 'לא הצלחנו לאתר את המיקום שלך, וודא ששירותי המיקום דולקים';
        this.locationLoading = false;
      },
      { timeout: 8000, maximumAge: 300_000 }
    );
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
      location: this.locationCoords
        ? {
          address: value.address || undefined,
          latitude: this.locationCoords.latitude,
          longitude: this.locationCoords.longitude
        }
        : undefined
    };

    this.submitted.emit(request);
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
