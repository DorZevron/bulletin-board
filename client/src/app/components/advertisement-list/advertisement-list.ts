
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { AdvertisementApiService } from '../../services/advertisement-api.service';
import { Advertisement } from '../../models/advertisement';
import { AdvertisementQuery } from '../../models/advertisement-query';
import { AdvertisementCategory } from '../../models/advertisement-category';

@Component({
  selector: 'app-advertisement-list',
  imports: [],
  templateUrl: './advertisement-list.html',
  styleUrl: './advertisement-list.scss'
})
export class AdvertisementList implements OnInit {
  private readonly api = inject(AdvertisementApiService);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly AdvertisementCategory = AdvertisementCategory;

  readonly items = signal<Advertisement[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly totalCount = signal(0);
  readonly totalPages = signal(0);

  readonly selectedItem = signal<Advertisement | null>(null);
  readonly mapUrl = computed<SafeResourceUrl>(() => {
    const selected = this.selectedItem();
    const query = selected?.location?.address
      ?? (selected?.location ? `${selected.location.latitude},${selected.location.longitude}` : 'Israel');
    const url = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  private query: AdvertisementQuery = { page: 1, pageSize: 10 };

  ngOnInit(): void {
    this.load();
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
}