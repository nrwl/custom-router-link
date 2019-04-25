import { BrowserModule } from '@angular/platform-browser';
import {
  Directive,
  HostListener,
  Injectable,
  Input,
  NgModule,
  SimpleChanges,
  OnChanges
} from '@angular/core';
import { Component } from '@angular/core';
import { LocationStrategy } from '@angular/common';
import {
  ActivatedRoute,
  Router,
  RouterLinkWithHref,
  RouterModule
} from '@angular/router';

@Component({
  selector: 'link-extended-root',
  template: `
    root
    <router-outlet></router-outlet>
    <br />
    <button (click)="changeLink()">Change Link</button><br />
    <a [c1RouterLink]="href">Non Local</a><br />
    <a c1RouterLink="./b">Local</a>
  `
})
export class AppComponent {
  title = 'link-extended';
  href = 'http://duckduckgo.com#horse';

  changeLink() {
    this.href = '/external';
  }
}

@Component({
  selector: 'component-a',
  template: `
    Component A
  `
})
export class AComponent {}

@Component({
  selector: 'component-b',
  template: `
    Component B
  `
})
export class BComponent {}

@Injectable()
class LocalLinkService {
  isLocalLink(value: any[]) {
    if (value.length === 1 && value[0].indexOf('http') === 0) {
      return false;
    } else if (value.length === 1 && value[0] === '/external') {
      return false;
    } else {
      return true;
    }
  }
}

@Directive({ selector: 'a[c1RouterLink]' })
export class ExtendedRouterLinkDirective extends RouterLinkWithHref
  implements OnChanges {
  constructor(
    router: Router,
    route: ActivatedRoute,
    locationStrategy: LocationStrategy,
    private localLinkService: LocalLinkService
  ) {
    super(router, route, locationStrategy);
    this.patchUpdate();
  }

  @Input()
  set c1RouterLink(value: any) {
    this.routerLink = value;
  }

  @HostListener('click', [
    '$event.button',
    '$event.ctrlKey',
    '$event.metaKey',
    '$event.shiftKey'
  ])
  onClick(
    button: number,
    ctrlKey: boolean,
    metaKey: boolean,
    shiftKey: boolean
  ): boolean {
    if (button !== 0 || ctrlKey || metaKey || shiftKey) {
      return true;
    }

    if (typeof this.target === 'string' && this.target !== '_self') {
      return true;
    }

    if (!this.localLinkService.isLocalLink((this as any).commands)) {
      return true;
    }

    return super.onClick(button, ctrlKey, metaKey, shiftKey);
  }

  /**
   * This patches the href updating to not parse the UrlTree
   */
  private patchUpdate() {
    const originalUpdate: () => void = (this as any).updateTargetUrlAndHref;
    (this as any).updateTargetUrlAndHref = () => {
      if (this.localLinkService.isLocalLink((this as any).commands)) {
        originalUpdate.bind(this)();
      } else {
        this.href = (this as any).commands[0];
      }
    };
  }
}

@NgModule({
  declarations: [
    AppComponent,
    ExtendedRouterLinkDirective,
    AComponent,
    BComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'a'
      },
      {
        path: 'a',
        component: AComponent
      },
      {
        path: 'b',
        component: BComponent
      }
    ])
  ],
  providers: [LocalLinkService],
  bootstrap: [AppComponent]
})
export class AppModule {}
