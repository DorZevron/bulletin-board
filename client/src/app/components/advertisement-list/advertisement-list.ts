
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { AdvertisementApiService } from '../../services/advertisement-api.service';
import { Advertisement } from '../../models/advertisement';
import { AdvertisementQuery } from '../../models/advertisement-query';
import { AdvertisementCategory } from '../../models/advertisement-category';

import { Modal } from '../modal/modal';
import { AdvertisementForm } from '../advertisement-form/advertisement-form';
import { CreateAdvertisementRequest } from '../../models/create-advertisement-request';

@Component({
  selector: 'app-advertisement-list',
  imports: [Modal, AdvertisementForm, ReactiveFormsModule],
  templateUrl: './advertisement-list.html',
  styleUrl: './advertisement-list.scss'
})
export class AdvertisementList implements OnInit {
  private readonly api = inject(AdvertisementApiService);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly AdvertisementCategory = AdvertisementCategory;
  protected readonly categories = [
    AdvertisementCategory.BuySell,
    AdvertisementCategory.Events,
    AdvertisementCategory.Rent,
    AdvertisementCategory.Travel,
    AdvertisementCategory.Other
  ];

  readonly items = signal<Advertisement[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly totalCount = signal(0);
  readonly totalPages = signal(0);


  showFormModal = false;
  editingItem: Advertisement | null = null;

  readonly selectedItem = signal<Advertisement | null>(null);
  readonly mapUrl = computed<SafeResourceUrl>(() => {
    const selected = this.selectedItem();
    const query = selected?.location?.address
      ?? (selected?.location ? `${selected.location.latitude},${selected.location.longitude}` : 'Israel');
    const url = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  private query: AdvertisementQuery = { page: 1, pageSize: 10 };
  private readonly fb = new FormBuilder();

  filterForm = this.fb.nonNullable.group({
    search: [''],
    category: this.fb.control<AdvertisementCategory | null>(null),
    minPrice: this.fb.control<number | null>(null),
    maxPrice: this.fb.control<number | null>(null)
  });

  ngOnInit(): void {
    this.load();

    this.filterForm.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        switchMap((filters) => {
          this.query = {
            ...this.query,
            page: 1,
            search: filters.search || undefined,
            category: filters.category ?? undefined,
            minPrice: filters.minPrice ?? undefined,
            maxPrice: filters.maxPrice ?? undefined
          };
          this.loading.set(true);
          this.error.set(null);
          return this.api.getAll(this.query);
        })
      )
      .subscribe({
        next: (result) => {
          this.items.set(result.items);
          this.totalCount.set(result.totalCount);
          this.totalPages.set(result.totalPages);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('שגיאה בטעינת המודעות. נסה שוב.');
          this.loading.set(false);
        }
      });
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.getAll(this.query).subscribe({
      next: (result) => {
        this.items.set(result.items);
        this.totalCount.set(result.totalCount);
        this.totalPages.set(result.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('שגיאה בטעינת המודעות. נסה שוב.');
        this.loading.set(false);
      }
    });
  }


  selectItem(item: Advertisement): void {
    this.selectedItem.set(item);
  }


  deleteItem(item: Advertisement): void {
    if (!confirm(`למחוק את "${item.title}"?`)) {
      return;
    }

    this.api.delete(item.id).subscribe({
      next: () => this.load(),
      error: () => this.error.set('שגיאה במחיקת המודעה. נסה שוב.')
    });
  }



  // -- MOdal -- //

  openCreateModal(): void {
    this.editingItem = null;
    this.showFormModal = true;
  }

  openEditModal(item: Advertisement): void {
    this.editingItem = item;
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.editingItem = null;
  }

  onFormSubmitted(request: CreateAdvertisementRequest): void {
    const action = this.editingItem
      ? this.api.update(this.editingItem.id, request)
      : this.api.create(request);

    action.subscribe({
      next: () => {
        this.closeFormModal();
        this.load();
      },
      error: () => {
        this.error.set('שגיאה בשמירת המודעה. נסה שוב.');
      }
    });
  }
}