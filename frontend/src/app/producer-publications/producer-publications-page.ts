import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Product } from '../models/product.model';
import { ProductStore } from '../services/product.store';

const CURRENT_PRODUCER_NAME = 'Héctor Riascos';
const PRODUCT_CATEGORIES = ['Frutas', 'Verduras', 'Tubérculos', 'Granos'];

const trimmedRequiredValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.trim().length > 0 ? null : { required: true };

function trimmedMinLengthValidator(minLength: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = typeof control.value === 'string' ? control.value.trim() : '';
    return value.length >= minLength
      ? null
      : { minlength: { requiredLength: minLength, actualLength: value.length } };
  };
}

const httpUrlValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (typeof control.value !== 'string' || control.value.trim().length === 0) {
    return null;
  }

  try {
    const url = new URL(control.value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:' ? null : { url: true };
  } catch {
    return { url: true };
  }
};

const wholeNumberValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  return value === null || Number.isInteger(Number(value)) ? null : { wholeNumber: true };
};

@Component({
  selector: 'app-producer-publications-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './producer-publications-page.html',
  styleUrl: './producer-publications-page.scss',
})
export class ProducerPublicationsPage {
  private readonly formBuilder = inject(FormBuilder).nonNullable;
  readonly productStore = inject(ProductStore);
  readonly categories = PRODUCT_CATEGORIES;
  readonly currentProducerName = CURRENT_PRODUCER_NAME;
  readonly editingProductId = signal<string | null>(null);
  readonly feedback = signal('');
  readonly errorMessage = signal('');

  readonly productForm = this.formBuilder.group({
    name: ['', [trimmedRequiredValidator, trimmedMinLengthValidator(3)]],
    description: ['', [trimmedRequiredValidator, trimmedMinLengthValidator(8)]],
    category: ['', Validators.required],
    price: [null as number | null, [Validators.required, Validators.min(0.01)]],
    unit: ['kg', trimmedRequiredValidator],
    stock: [null as number | null, [Validators.required, Validators.min(0), wholeNumberValidator]],
    producerName: [CURRENT_PRODUCER_NAME, trimmedRequiredValidator],
    location: ['', trimmedRequiredValidator],
    imageUrl: ['', [trimmedRequiredValidator, httpUrlValidator]],
  });

  get producerProducts(): Product[] {
    return this.productStore
      .products()
      .filter((product) => product.producerName === CURRENT_PRODUCER_NAME);
  }

  saveProduct(): void {
    this.feedback.set('');
    this.errorMessage.set('');

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.errorMessage.set('Revisa los campos indicados antes de guardar.');
      return;
    }

    const values = this.productForm.getRawValue();
    const product: Product = {
      id: this.editingProductId() ?? this.createProductId(),
      name: values.name.trim(),
      description: values.description.trim(),
      category: values.category,
      price: values.price ?? 0,
      unit: values.unit.trim(),
      stock: values.stock ?? 0,
      producerName: CURRENT_PRODUCER_NAME,
      location: values.location.trim(),
      imageUrl: values.imageUrl.trim(),
    };

    try {
      if (this.editingProductId()) {
        this.productStore.updateProduct(product);
        this.feedback.set(`Se actualizaron los datos de "${product.name}".`);
      } else {
        this.productStore.addProduct(product);
        this.feedback.set(`Se publicó "${product.name}".`);
      }

      this.resetForm();
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error
          ? error.message
          : 'No fue posible guardar el producto. Inténtalo de nuevo.',
      );
    }
  }

  editProduct(product: Product): void {
    this.feedback.set('');
    this.errorMessage.set('');
    this.editingProductId.set(product.id);
    this.productForm.reset({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      unit: product.unit,
      stock: product.stock,
      producerName: CURRENT_PRODUCER_NAME,
      location: product.location,
      imageUrl: product.imageUrl,
    });
  }

  deleteProduct(product: Product): void {
    if (!window.confirm(`¿Eliminar la publicación "${product.name}"?`)) {
      return;
    }

    this.feedback.set('');
    this.errorMessage.set('');

    try {
      this.productStore.deleteProduct(product.id);
      if (this.editingProductId() === product.id) {
        this.resetForm();
      }
      this.feedback.set(`Se eliminó "${product.name}".`);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error
          ? error.message
          : 'No fue posible eliminar el producto. Inténtalo de nuevo.',
      );
    }
  }

  cancelEdit(): void {
    this.resetForm();
    this.feedback.set('');
    this.errorMessage.set('');
  }

  private resetForm(): void {
    this.editingProductId.set(null);
    this.productForm.reset({
      name: '',
      description: '',
      category: '',
      price: null,
      unit: 'kg',
      stock: null,
      producerName: CURRENT_PRODUCER_NAME,
      location: '',
      imageUrl: '',
    });
  }

  private createProductId(): string {
    return `product-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}
