import { TestBed } from '@angular/core/testing';
import { MarketplacePage } from './marketplace-page';

describe('MarketplacePage', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [MarketplacePage],
    }).compileComponents();
  });

  it('renders the seeded products from the shared store', () => {
    const fixture = TestBed.createComponent(MarketplacePage);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Productos frescos');
    expect(compiled.textContent).toContain('Tomate chonto');
  });
});
