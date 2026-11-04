import { Product } from '../models/product.model';

export const PRODUCT_SEED: Product[] = [
  {
    id: 'seed-tomate',
    name: 'Tomate chonto',
    description: 'Tomates frescos, firmes y cosechados en su punto.',
    category: 'Verduras',
    price: 4200,
    unit: 'kg',
    stock: 35,
    producerName: 'Finca El Porvenir',
    location: 'La Ceja, Antioquia',
    imageUrl:
      'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'seed-mora',
    name: 'Mora de Castilla',
    description: 'Moras seleccionadas, ideales para jugos y postres.',
    category: 'Frutas',
    price: 6800,
    unit: 'kg',
    stock: 18,
    producerName: 'Asociación Frutos de Oriente',
    location: 'Rionegro, Antioquia',
    imageUrl:
      'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'seed-papa',
    name: 'Papa criolla',
    description: 'Papa criolla recién cosechada, limpia y lista para cocinar.',
    category: 'Tubérculos',
    price: 5200,
    unit: 'kg',
    stock: 42,
    producerName: 'Héctor Ramírez',
    location: 'Marinilla, Antioquia',
    imageUrl:
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'seed-frijol',
    name: 'Fríjol cargamanto',
    description: 'Fríjol seco de cosecha local, seleccionado y empacado.',
    category: 'Granos',
    price: 9800,
    unit: 'kg',
    stock: 24,
    producerName: 'Cooperativa Campo Vivo',
    location: 'El Santuario, Antioquia',
    imageUrl:
      'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'seed-aguacate',
    name: 'Aguacate Hass',
    description: 'Aguacates cremosos de producción campesina.',
    category: 'Frutas',
    price: 7500,
    unit: 'kg',
    stock: 16,
    producerName: 'María Gómez',
    location: 'Sonsón, Antioquia',
    imageUrl:
      'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'seed-zanahoria',
    name: 'Zanahoria',
    description: 'Zanahorias frescas y crocantes cultivadas en tierra fría.',
    category: 'Verduras',
    price: 3600,
    unit: 'kg',
    stock: 30,
    producerName: 'Finca La Esperanza',
    location: 'El Carmen de Viboral, Antioquia',
    imageUrl:
      'https://images.unsplash.com/photo-1445282768818-728615cc910a?auto=format&fit=crop&w=800&q=80',
  },
];
