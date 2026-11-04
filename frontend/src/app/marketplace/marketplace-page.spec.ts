import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MarketplacePage } from './marketplace-page';

describe('MarketplacePage', () => {
  let fixture: ComponentFixture<MarketplacePage>;

  beforeEach(async () => {
    window.localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [MarketplacePage],
    }).compileComponents();
    fixture = TestBed.createComponent(MarketplacePage);
    fixture.detectChanges();
  });

  it('renders the seeded products from the shared store', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Productos frescos');
    expect(compiled.textContent).toContain('Tomate chonto');
    expect(compiled.textContent).toContain('Papa criolla');
  });

  it('searches by product name or producer name', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const search = compiled.querySelector<HTMLInputElement>('#catalog-search');

    if (!search) {
      throw new Error('No se encontró el campo de búsqueda del catálogo.');
    }

    search.value = 'héctor riascos';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Papa criolla');
    expect(compiled.textContent).not.toContain('Tomate chonto');
  });

  it('filters products by category and shows a no-results state', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const category = compiled.querySelector<HTMLSelectElement>('#catalog-category');

    if (!category) {
      throw new Error('No se encontró el filtro por categoría.');
    }

    category.value = 'Tubérculos';
    category.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Papa criolla');
    expect(compiled.textContent).not.toContain('Tomate chonto');

    const search = compiled.querySelector<HTMLInputElement>('#catalog-search');
    if (!search) {
      throw new Error('No se encontró el campo de búsqueda del catálogo.');
    }
    search.value = 'producto inexistente';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(compiled.textContent).toContain('No encontramos productos');
  });

  it('navigates to the selected product detail', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.componentInstance.openProduct('seed-papa');

    expect(navigateSpy).toHaveBeenCalledWith(['/producto', 'seed-papa']);
  });
});
