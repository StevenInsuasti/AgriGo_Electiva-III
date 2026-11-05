import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  PaymentPreference,
  PurchaseOrder,
  PurchaseOrderItem,
} from '../models/purchase-order.model';
import { CartStore } from '../services/cart.store';
import { OrderStore } from '../services/order.store';
import { ProductStore } from '../services/product.store';

const trimmedRequiredValidator: ValidatorFn = (control): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.trim().length > 0 ? null : { required: true };

const trimmedMinLengthValidator =
  (minimum: number): ValidatorFn =>
  (control) => {
    const value = typeof control.value === 'string' ? control.value.trim() : '';
    return value.length >= minimum
      ? null
      : { minlength: { requiredLength: minimum, actualLength: value.length } };
  };

const phoneValidator: ValidatorFn = (control): ValidationErrors | null => {
  if (typeof control.value !== 'string') {
    return { phone: true };
  }

  const digits = control.value.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15 ? null : { phone: true };
};

@Component({
  selector: 'app-checkout-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.scss',
})
export class CheckoutPage {
  private readonly formBuilder = inject(FormBuilder).nonNullable;
  readonly cartStore = inject(CartStore);
  readonly productStore = inject(ProductStore);
  readonly orderStore = inject(OrderStore);
  private readonly router = inject(Router);
  readonly errorMessage = signal('');
  readonly isSubmitting = signal(false);
  readonly paymentOptions: { value: PaymentPreference; label: string }[] = [
    { value: 'cash', label: 'Efectivo (simulado)' },
    { value: 'transfer', label: 'Transferencia (simulada)' },
    { value: 'other', label: 'Otra preferencia' },
  ];

  readonly checkoutForm = this.formBuilder.group({
    customerName: ['', [trimmedRequiredValidator, trimmedMinLengthValidator(3)]],
    phone: ['', [trimmedRequiredValidator, phoneValidator]],
    deliveryAddress: ['', [trimmedRequiredValidator, trimmedMinLengthValidator(5)]],
    paymentPreference: this.formBuilder.control<PaymentPreference>('cash', Validators.required),
  });

  get cartIsEmpty(): boolean {
    return this.cartStore.cartItems().length === 0;
  }

  async confirmOrder(): Promise<void> {
    if (this.isSubmitting()) {
      return;
    }

    this.errorMessage.set('');
    this.checkoutForm.markAllAsTouched();

    if (this.checkoutForm.invalid) {
      this.errorMessage.set('Revisa los datos de entrega antes de confirmar el pedido.');
      return;
    }

    if (this.cartIsEmpty) {
      this.errorMessage.set('El carrito está vacío. Agrega productos antes de continuar.');
      return;
    }

    const orderItems = this.createOrderItems();
    if (!orderItems) {
      return;
    }

    const formValues = this.checkoutForm.getRawValue();
    const order: PurchaseOrder = {
      id: this.createOrderId(),
      createdAt: new Date().toISOString(),
      customerName: formValues.customerName.trim(),
      phone: formValues.phone.trim(),
      deliveryAddress: formValues.deliveryAddress.trim(),
      paymentPreference: formValues.paymentPreference,
      items: orderItems,
      total: orderItems.reduce((total, item) => total + item.subtotal, 0),
    };

    this.isSubmitting.set(true);
    try {
      this.orderStore.addOrder(order);
    } catch (error) {
      this.isSubmitting.set(false);
      this.errorMessage.set(
        error instanceof Error
          ? error.message
          : 'No se pudo guardar el pedido. Inténtalo de nuevo.',
      );
      return;
    }

    let cartClearWarning = '';
    try {
      this.cartStore.clear();
    } catch (error) {
      cartClearWarning =
        error instanceof Error
          ? `El pedido se guardó, pero no se pudo vaciar el carrito: ${error.message}`
          : 'El pedido se guardó, pero no se pudo vaciar el carrito.';
    }

    try {
      const navigated = await this.router.navigate(['/pedido', order.id], {
        state: cartClearWarning ? { cartClearWarning } : undefined,
      });
      if (!navigated) {
        this.errorMessage.set(
          `El pedido ${order.id} se guardó, pero no se pudo abrir su confirmación. Consúltalo en Mis pedidos.`,
        );
      }
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error
          ? `El pedido ${order.id} se guardó, pero no se pudo abrir su confirmación: ${error.message}`
          : `El pedido ${order.id} se guardó, pero no se pudo abrir su confirmación.`,
      );
    }
  }

  private createOrderItems(): PurchaseOrderItem[] | null {
    const products = this.productStore.products();
    const items: PurchaseOrderItem[] = [];

    for (const cartItem of this.cartStore.cartItems()) {
      const product = products.find((current) => current.id === cartItem.productId);
      if (!product) {
        this.errorMessage.set(
          `El producto "${cartItem.productId}" ya no está disponible. Quita el producto del carrito antes de continuar.`,
        );
        return null;
      }

      if (cartItem.quantity > product.stock) {
        this.errorMessage.set(
          `La cantidad de "${product.name}" supera el stock actual (${product.stock}). Ajusta el carrito antes de confirmar.`,
        );
        return null;
      }

      const subtotal = product.price * cartItem.quantity;
      items.push({
        productId: product.id,
        productName: product.name,
        unit: product.unit,
        unitPrice: product.price,
        quantity: cartItem.quantity,
        subtotal,
      });
    }

    return items;
  }

  private createOrderId(): string {
    return `order-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}
