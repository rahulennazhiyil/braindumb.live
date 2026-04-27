import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SceneScrollLock } from './scene-scroll-lock.directive';

@Component({
  selector: 'app-scroll-lock-host',
  imports: [SceneScrollLock],
  template: `<main appSceneScrollLock>content</main>`,
})
class HostCmp {}

@Component({
  selector: 'app-scroll-lock-host-disabled',
  imports: [SceneScrollLock],
  template: `<main appSceneScrollLock [disabled]="true">content</main>`,
})
class DisabledHost {}

describe('SceneScrollLock', () => {
  it('applies the scroll-lock class to the host', async () => {
    await TestBed.configureTestingModule({ imports: [HostCmp] }).compileComponents();
    const fixture = TestBed.createComponent(HostCmp);
    fixture.detectChanges();
    const main = fixture.nativeElement.querySelector('main') as HTMLElement;
    expect(main.classList.contains('scene-scroll-lock')).toBe(true);
  });

  it('removes the lock class when [disabled] is true', async () => {
    await TestBed.configureTestingModule({ imports: [DisabledHost] }).compileComponents();
    const fixture = TestBed.createComponent(DisabledHost);
    fixture.detectChanges();
    const main = fixture.nativeElement.querySelector('main') as HTMLElement;
    expect(main.classList.contains('scene-scroll-lock')).toBe(false);
  });
});
