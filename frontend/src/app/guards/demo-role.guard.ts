import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { DemoRole } from '../models/demo-role.model';
import { DemoRoleStore } from '../services/demo-role.store';

export function requireDemoRole(requiredRole: DemoRole): CanActivateFn {
  return () => {
    const roleStore = inject(DemoRoleStore);
    const router = inject(Router);

    return roleStore.role() === requiredRole ? true : router.createUrlTree(['/inicio']);
  };
}
