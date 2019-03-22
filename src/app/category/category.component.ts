import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, UrlSegment } from '@angular/router';
import { AppComponent } from '../app.component';
import { NzFormatEmitEvent, NzTreeNode } from 'ng-zorro-antd';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})

export class CategoryComponent implements OnInit {

  nodes: NzTreeNode[] = [];
  breadcrumbNodes: NzTreeNode[] = [];
  is404Url = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.initCurrentSecondLevelNodeListWhenNgInit(this.route.snapshot.url);

    this.router.events
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.initCurrentSecondLevelNodeListWhenRouterEvent(event.urlAfterRedirects);
        }
      });
  }

  private initCurrentSecondLevelNodeListWhenNgInit(url: UrlSegment[]) {
    setTimeout(() => {
      // 初始化 nodes
      for (const node of AppComponent.self.nodes) {
        if (node.key === url[0].path) {
          this.nodes = node.getChildren();
          this.is404Url = false;
        }
      }

      // 若未找到，跳转到 404 页面
      if (this.is404Url) {
        this.router.navigate(['404']);
      }

      // 初始化 面包屑nodes
      let tempNodes = AppComponent.self.nodes;
      for (const urlSegment of url) {
        for (const node of tempNodes) {
          if (urlSegment.path === node.key) {
            this.breadcrumbNodes.push(node);
            tempNodes = node.getChildren();
            break;
          }
        }
      }
    }, 0);
  }

  private initCurrentSecondLevelNodeListWhenRouterEvent(urlAfterRedirects: string) {
    // 初始化 nodes
    for (const node of AppComponent.self.nodes) {
      if (node.key === urlAfterRedirects.split('/')[1]) {
        this.nodes = node.getChildren();
      }
    }

    // 初始化 面包屑nodes
    this.breadcrumbNodes = [];
    let tempNodes = AppComponent.self.nodes;
    for (const urlSegment of urlAfterRedirects.split('/')) {
      if (urlSegment === '') {
        continue;
      }
      for (const node of tempNodes) {
        if (urlSegment === node.key) {
          this.breadcrumbNodes.push(node);
          tempNodes = node.getChildren();
          break;
        }
      }
    }
  }

  goCategory(event: NzFormatEmitEvent) {
    let node = event.node;
    const urlSegmentList: string[] = [];
    do {
      urlSegmentList.push(node.key);
      node = node.parentNode;
    } while (node != null);
    urlSegmentList.reverse();
    this.router.navigate(urlSegmentList);
  }
}
