import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Voucher } from '../../../../core/models/voucher.model';
import { VoucherService } from '../../../../core/services/voucher.service';

@Component({
  selector: 'app-vouchers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">
            Mes bons d'achat
          </h3>
        </div>
        <div class="border-t border-gray-200">
          <dl>
            <div *ngFor="let voucher of vouchers$ | async" 
                 class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
                 [class.opacity-50]="voucher.isUsed">
              <dt class="text-sm font-medium text-gray-500">
                Code du bon
              </dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ voucher.code }}
              </dd>
              
              <dt class="text-sm font-medium text-gray-500">
                Valeur
              </dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ voucher.value }} Dh
              </dd>
              
              <dt class="text-sm font-medium text-gray-500">
                Points utilisés
              </dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ voucher.points }} points
              </dd>
              
              <dt class="text-sm font-medium text-gray-500">
                Date d'expiration
              </dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ voucher.expiresAt | date:'dd/MM/yyyy' }}
              </dd>
              
              <dt class="text-sm font-medium text-gray-500">
                Statut
              </dt>
              <dd class="mt-1 text-sm sm:mt-0 sm:col-span-2">
                <span [class]="voucher.isUsed ? 'text-red-600' : 'text-green-600'">
                  {{ voucher.isUsed ? 'Utilisé' : 'Valide' }}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  `
})
export class VouchersComponent implements OnInit {
  vouchers$: Observable<Voucher[]>;

  constructor(private voucherService: VoucherService) {
    this.vouchers$ = this.voucherService.getUserVouchers();
  }

  ngOnInit(): void {}
}