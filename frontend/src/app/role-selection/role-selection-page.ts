import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DemoRole } from '../models/demo-role.model';
import { DemoRoleStore } from '../services/demo-role.store';

@Component({
  selector: 'app-role-selection-page',
  imports: [CommonModule],
  templateUrl: './role-selection-page.html',
  styleUrl: './role-selection-page.scss',
})
export class RoleSelectionPage {
  private readonly router = inject(Router);
  readonly roleStore = inject(DemoRoleStore);
  readonly errorMessage = signal('');

  async chooseRole(role: DemoRole): Promise<void> {
    this.errorMessage.set('');
    try {
      this.roleStore.chooseRole(role);
      const destination = role === 'buyer' ? '/marketplace' : '/mis-publicaciones';
      const navigated = await this.router.navigateByUrl(destination);
      if (!navigated) {
        this.errorMessage.set('No se pudo abrir la sección seleccionada. Inténtalo de nuevo.');
      }
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'No se pudo guardar el modo de demostración.',
      );
    }
  }
}
