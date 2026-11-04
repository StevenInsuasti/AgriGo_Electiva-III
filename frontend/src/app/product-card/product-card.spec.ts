import { TestBed } from '@angular/core/testing';
import { PRODUCT_SEED } from '../data/product-seed';
import { ProductCard } from './product-card';

describe('ProductCard', () => {
  it('renders the product input and emits its id when details are requested', async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCard],
    }).compileComponents();

    const fixture = TestBed.createComponent(ProductCard);
    const product = PRODUCT_SEED[0];
    fixture.componentRef.setInput('product', product);
    fixture.detectChanges();
    const selectedIds: string[] = [];
    fixture.componentInstance.productSelected.subscribe((productId) => selectedIds.push(productId));

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(product.name);
    compiled.querySelector('button')?.click();

    expect(selectedIds).toEqual([product.id]);
  });
});
