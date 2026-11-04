import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { ProductDetailPage } from './product-detail-page';

describe('ProductDetailPage', () => {
  async function createPage(productId: string): Promise<HTMLElement> {
    window.localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ProductDetailPage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: productId })),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ProductDetailPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows product description, price, stock, producer, and location', async () => {
    const compiled = await createPage('seed-papa');

    expect(compiled.querySelector('h1')?.textContent).toContain('Papa criolla');
    expect(compiled.textContent).toContain('Héctor Riascos');
    expect(compiled.textContent).toContain('Marinilla, Antioquia');
    expect(compiled.textContent).toContain('42 kg disponibles');
  });

  it('shows a not-found state for an unknown product id', async () => {
    const compiled = await createPage('unknown-product');

    expect(compiled.textContent).toContain('No encontramos este producto');
    expect(compiled.querySelector('a[routerLink="/marketplace"]')).not.toBeNull();
  });
});
