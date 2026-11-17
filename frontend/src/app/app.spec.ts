import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the local demo notice', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand')?.textContent).toContain('AgriGo');
    expect(compiled.querySelector('.local-data-notice')?.textContent).toContain(
      'No se realizan cobros ni despachos',
    );
  });

  it('shows the cart link and the current number of units', () => {
    const fixture = TestBed.createComponent(App);
    fixture.componentInstance.roleStore.chooseRole('buyer');
    fixture.componentInstance.cartStore.addProduct('seed-papa');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('a[routerLink="/carrito"]')?.textContent).toContain('1');
    expect(compiled.querySelector('a[routerLink="/mis-pedidos"]')?.textContent).toContain(
      'Mis pedidos',
    );
    expect(compiled.querySelector('a[routerLink="/mis-publicaciones"]')).toBeNull();
    expect(compiled.textContent).toContain('Modo comprador');
  });

  it('shows producer navigation without buyer purchase links', () => {
    const fixture = TestBed.createComponent(App);
    fixture.componentInstance.roleStore.chooseRole('producer');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('a[routerLink="/mis-publicaciones"]')).not.toBeNull();
    expect(compiled.querySelector('a[routerLink="/carrito"]')).toBeNull();
    expect(compiled.querySelector('a[routerLink="/mis-pedidos"]')).toBeNull();
    expect(compiled.textContent).toContain('Héctor Riascos');
  });
});
