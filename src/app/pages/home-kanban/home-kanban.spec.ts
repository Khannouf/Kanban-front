import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeKanban } from './home-kanban';

describe('HomeKanban', () => {
  let component: HomeKanban;
  let fixture: ComponentFixture<HomeKanban>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeKanban]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeKanban);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
