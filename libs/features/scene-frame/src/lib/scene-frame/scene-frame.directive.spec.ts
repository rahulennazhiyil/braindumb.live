import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SceneFrame } from './scene-frame.directive';

@Component({
  selector: 'app-scene-frame-host',
  imports: [SceneFrame],
  template: `<section appSceneFrame (sceneEnter)="entered = true">scene</section>`,
})
class HostCmp {
  entered = false;
}

describe('SceneFrame', () => {
  it('attaches to a host element without errors', async () => {
    await TestBed.configureTestingModule({ imports: [HostCmp] }).compileComponents();
    const fixture = TestBed.createComponent(HostCmp);
    fixture.detectChanges();
    const section = fixture.nativeElement.querySelector('section');
    expect(section).not.toBeNull();
  });

  it('does not fire sceneEnter synchronously on mount', async () => {
    await TestBed.configureTestingModule({ imports: [HostCmp] }).compileComponents();
    const fixture = TestBed.createComponent(HostCmp);
    fixture.detectChanges();
    expect(fixture.componentInstance.entered).toBe(false);
  });
});
