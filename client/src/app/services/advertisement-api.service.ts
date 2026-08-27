import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Advertisement } from '../models/advertisement';
import { AdvertisementQuery } from '../models/advertisement-query';
import { CreateAdvertisementRequest } from '../models/create-advertisement-request';
import { UpdateAdvertisementRequest } from '../models/update-advertisement-request';
import { PagedResult } from '../models/paged-result';

const BASE_URL = `${environment.apiUrl}/advertisements`;

@Injectable({ providedIn: 'root' })
export class AdvertisementApiService {
    private readonly http = inject(HttpClient);

    getAll(query: AdvertisementQuery): Observable<PagedResult<Advertisement>> {
        let params = new HttpParams()
            .set('page', query.page)
            .set('pageSize', query.pageSize);

        if (query.search) params = params.set('search', query.search);
        if (query.category != null) params = params.set('category', query.category);
        if (query.minPrice != null) params = params.set('minPrice', query.minPrice);
        if (query.maxPrice != null) params = params.set('maxPrice', query.maxPrice);
        if (query.mineOnly != null) params = params.set('mineOnly', query.mineOnly);
        if (query.latitude != null) params = params.set('latitude', query.latitude);
        if (query.longitude != null) params = params.set('longitude', query.longitude);
        if (query.radiusKm != null) params = params.set('radiusKm', query.radiusKm);

        return this.http.get<PagedResult<Advertisement>>(BASE_URL, { params });
    }

    getById(id: string): Observable<Advertisement> {
        return this.http.get<Advertisement>(`${BASE_URL}/${id}`);
    }

    create(request: CreateAdvertisementRequest): Observable<Advertisement> {
        return this.http.post<Advertisement>(BASE_URL, request);
    }

    update(id: string, request: UpdateAdvertisementRequest): Observable<Advertisement> {
        return this.http.put<Advertisement>(`${BASE_URL}/${id}`, request);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${BASE_URL}/${id}`);
    }
}