import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../app.routes';
import { DemoRoleStore } from '../services/demo-role.store';
import { RoleSelectionPage } from './role-selection-page';

describe('RoleSelectionPage', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('explains both demo modes and that they are not authenticated accounts', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/inicio', RoleSelectionPage);
    harness.detectChanges();

    const text = harness.routeNativeElement?.textContent ?? '';
    expect(text).toContain('Comprador');
    expect(text).toContain('Productor');
    expect(text).toContain('No hay cuentas ni contraseñas');
    expect(page.roleStore.role()).toBeNull();
  });

  it('selects the buyer mode and opens the Marketplace', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/inicio', RoleSelectionPage);

    await page.chooseRole('buyer');

    expect(TestBed.inject(DemoRoleStore).role()).toBe('buyer');
    expect(TestBed.inject(Router).url).toBe('/marketplace');
  });

  it('selects the producer mode and opens its publications', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/inicio', RoleSelectionPage);

    await page.chooseRole('producer');

    expect(TestBed.inject(DemoRoleStore).role()).toBe('producer');
    expect(TestBed.inject(Router).url).toBe('/mis-publicaciones');
  });

  it('redirects direct access to a role-specific route back to mode selection', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/carrito', RoleSelectionPage);

    expect(TestBed.inject(Router).url).toBe('/inicio');
  });

  it('blocks buyer routes while the producer mode is selected', async () => {
    TestBed.inject(DemoRoleStore).chooseRole('producer');
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/carrito', RoleSelectionPage);

    expect(TestBed.inject(Router).url).toBe('/inicio');
  });

  it('blocks producer routes while the buyer mode is selected', async () => {
    TestBed.inject(DemoRoleStore).chooseRole('buyer');
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/mis-publicaciones', RoleSelectionPage);

    expect(TestBed.inject(Router).url).toBe('/inicio');
  });
});
