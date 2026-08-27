import { Injectable } from '@angular/core';

const STORAGE_KEY = 'bulletin-board.userId';

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
    readonly userId: string;

    constructor() {
        this.userId = this.loadOrCreateUserId();
    }

    private loadOrCreateUserId(): string {
        const existing = localStorage.getItem(STORAGE_KEY);
        if (existing) {
            return existing;
        }
        const newId = crypto.randomUUID();
        localStorage.setItem(STORAGE_KEY, newId);
        return newId;
    }
}