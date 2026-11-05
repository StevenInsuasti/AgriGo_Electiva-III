import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { DemoRole } from '../models/demo-role.model';

const DEMO_ROLE_STORAGE_KEY = 'agrigo.demo-role';

@Injectable({ providedIn: 'root' })
export class DemoRoleStore {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly roleState = signal<DemoRole | null>(null);

  readonly role = this.roleState.asReadonly();
  readonly loadError = signal('');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadRole();
    }
  }

  chooseRole(role: DemoRole): void {
    if (isPlatformBrowser(this.platformId)) {
      window.localStorage.setItem(DEMO_ROLE_STORAGE_KEY, role);
    }
    this.roleState.set(role);
    this.loadError.set('');
  }

  private loadRole(): void {
    const savedRole = window.localStorage.getItem(DEMO_ROLE_STORAGE_KEY);
    if (savedRole === null) {
      return;
    }
    if (!isDemoRole(savedRole)) {
      this.loadError.set(
        'El modo guardado no es válido. Elige un modo para continuar con la demostración.',
      );
      return;
    }

    this.roleState.set(savedRole);
  }
}

function isDemoRole(value: string): value is DemoRole {
  return value === 'buyer' || value === 'producer';
}
