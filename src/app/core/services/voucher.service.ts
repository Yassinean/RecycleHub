import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Voucher } from '../models/voucher.model';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class VoucherService {
  constructor(
    private storageService: StorageService,
    private authService: AuthService
  ) {}

  createVoucher(points: number, value: number): Observable<Voucher> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const voucher: Voucher = {
      id: Date.now().toString(),
      userId: currentUser.email,
      code: this.generateVoucherCode(),
      points,
      value,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expire dans 30 jours
      isUsed: false
    };

    return this.storageService.saveVoucher(voucher);
  }

  getUserVouchers(): Observable<Voucher[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    return this.storageService.getUserVouchers(currentUser.email);
  }

  private generateVoucherCode(): string {
    return 'BON-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}