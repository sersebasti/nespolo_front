import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TavoloComponent } from './tavolo.component';

describe('TavoloComponent', () => {
  let component: TavoloComponent;
  let fixture: ComponentFixture<TavoloComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TavoloComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TavoloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
