import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandaComponent } from './commanda.component';

describe('CommandaComponent', () => {
  let component: CommandaComponent;
  let fixture: ComponentFixture<CommandaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommandaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CommandaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
