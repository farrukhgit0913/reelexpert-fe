import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateReel } from './create-reel';

describe('CreateReel', () => {
  let component: CreateReel;
  let fixture: ComponentFixture<CreateReel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateReel],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateReel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
