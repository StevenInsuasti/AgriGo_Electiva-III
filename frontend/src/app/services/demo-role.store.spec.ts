import { TestBed } from '@angular/core/testing';
import { DemoRoleStore } from './demo-role.store';

describe('DemoRoleStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('starts without a selected role', () => {
    expect(TestBed.inject(DemoRoleStore).role()).toBeNull();
  });

  it('persists and restores the selected demonstration role', () => {
    const store = TestBed.inject(DemoRoleStore);
    store.chooseRole('producer');

    expect(store.role()).toBe('producer');
    expect(window.localStorage.getItem('agrigo.demo-role')).toBe('producer');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    expect(TestBed.inject(DemoRoleStore).role()).toBe('producer');
  });

  it('reports an invalid saved mode and allows choosing a valid one', () => {
    window.localStorage.setItem('agrigo.demo-role', 'admin');

    const store = TestBed.inject(DemoRoleStore);
    expect(store.role()).toBeNull();
    expect(store.loadError()).toContain('El modo guardado no es válido');

    store.chooseRole('buyer');
    expect(store.role()).toBe('buyer');
    expect(store.loadError()).toBe('');
    expect(window.localStorage.getItem('agrigo.demo-role')).toBe('buyer');
  });
});
