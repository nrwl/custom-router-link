import { BrowserModule } from '@angular/platform-browser';
import {
  Directive,
  HostListener,
  Injectable,
  Input,
  NgModule
} from '@angular/core';
import { Component } from '@angular/core';
import { Location, LocationStrategy } from '@angular/common';
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
    <a c1RouterLink="http://duckduckgo.com">Non Local</a><br />
    <a c1RouterLink="./b">Local</a>
  `
})
export class AppComponent {
  title = 'link-extended';
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
    } else {
      return true;
    }
  }
}

@Directive({ selector: 'a[c1RouterLink]' })
export class ExtendedRouterLinkDirective extends RouterLinkWithHref {
  constructor(
    router: Router,
    route: ActivatedRoute,
    locationStrategy: LocationStrategy,
    private localLinkService: LocalLinkService
  ) {
    super(router, route, locationStrategy);
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
      (window as any).location = (this as any).commands[0];
      return false;
    }

    return super.onClick(button, ctrlKey, metaKey, shiftKey);
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
