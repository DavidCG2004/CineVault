import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MoviesFormPage } from './movies-form.page';

describe('MoviesFormPage', () => {
  let component: MoviesFormPage;
  let fixture: ComponentFixture<MoviesFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MoviesFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
