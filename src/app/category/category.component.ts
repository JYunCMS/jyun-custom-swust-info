import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, UrlSegment } from '@angular/router';
import { AppComponent } from '../app.component';
import { NzFormatEmitEvent, NzMessageService, NzTreeNode } from 'ng-zorro-antd';
import { RequestService } from '../request.service';
import { Article } from '../domain/article';
import { DomSanitizer } from '@angular/platform-browser';
import { BackEndApi } from '../back-end-api';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})

export class CategoryComponent implements OnInit {

  backEndHostAddress = BackEndApi.hostAddress;

  // 标记当前核心区域展示内容
  showWhatContent = '';
  SHOW_CUSTOM_PAGE = 'show-custom-page';
  SHOW_ARTICLE = 'show-article';
  SHOW_ARTICLE_LIST = 'show-article-list';

  // 导航相关
  nodes: NzTreeNode[] = [];
  breadcrumbNodes: NzTreeNode[] = [];
  is404Url = true;

  // 自定义页面内容
  customPageContent: any;

  // 文章内容
  article: Article;
  articleContent: any;

  // 文章列表相关内容
  initLoading = false;
  showLoadingMore = true;
  articleList: Article[] = [];
  articleListData: Article[] = [];
  currentPageNumber: number;
  everyPageSizeNumber = 10;
  currentShowArticleListCategoryUrlAlias: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private requestService: RequestService,
    private sanitizer: DomSanitizer,
    private nzMsgService: NzMessageService,
  ) {
  }

  ngOnInit() {
    // 首次进入初始化
    this.initWhenNgInit(this.route.snapshot.url);
    // 路由事件也初始化一次
    this.router.events
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.initWhenRouterEvent(event.urlAfterRedirects);
        }
      });
  }

  private initWhenNgInit(url: UrlSegment[]) {
    setTimeout(() => {
      // 初始化 nodes
      for (const node of AppComponent.self.nodes) {
        if (node.key === url[0].path) {
          this.nodes = node.getChildren();
          this.is404Url = false;
          break;
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

      // 初始化主内容区
      this.initMasterContent();
    }, 0);
  }

  private initWhenRouterEvent(urlAfterRedirects: string) {
    // 如果是首页，停止初始化
    if (urlAfterRedirects === '/') {
      return;
    }

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

    // 初始化主内容区
    this.initMasterContent();
  }

  private initMasterContent() {
    const currentNode = this.breadcrumbNodes[this.breadcrumbNodes.length - 1];
    if (currentNode.origin.customPage != null && currentNode.origin.customPage !== '') {
      // 有节点自定义页，展示自定义页
      this.customPageContent = this.sanitizer.bypassSecurityTrustHtml(currentNode.origin.customPage);
      this.showWhatContent = this.SHOW_CUSTOM_PAGE;
    } else if (!currentNode.isLeaf) {
      // 没有节点自定义页，又不是叶子结点，继续向下一级分类前进
      const urlSegmentList: string[] = [];
      for (const node of this.breadcrumbNodes) {
        urlSegmentList.push(node.key);
      }
      urlSegmentList.push(currentNode.children[0].key);
      this.router.navigate(urlSegmentList);
    } else if (this.route.snapshot.url[this.route.snapshot.url.length - 1].path.substring(
      this.route.snapshot.url[this.route.snapshot.url.length - 1].path.length - 5,
      this.route.snapshot.url[this.route.snapshot.url.length - 1].path.length)
      === '.html') {
      // 没有节点自定义页，是叶子结点，是在访问 .html 文章，展示具体文章
      if (this.article != null) {
        this.showWhatContent = this.SHOW_ARTICLE;
      } else {
        this.requestService.getArticleById(this.route.snapshot.url[this.route.snapshot.url.length - 1].path.substring(
          0, this.route.snapshot.url[this.route.snapshot.url.length - 1].path.length - 5))
          .subscribe(result => {
            if (result == null) {
              this.nzMsgService.error('数据请求出错，请检查网络连接！');
            } else if (result.id == null) {
              this.nzMsgService.warning('数据请求出错，指定文章不存在！');
              this.router.navigate(['404']);
            } else {
              this.article = result;
              this.articleContent = this.sanitizer.bypassSecurityTrustHtml(this.article.content);
              this.showWhatContent = this.SHOW_ARTICLE;
            }
          });
      }
    } else {
      // 没有节点自定义页，是叶子结点，展示叶子结点文章列表
      this.initLoading = true;
      this.showWhatContent = this.SHOW_ARTICLE_LIST;
      this.currentShowArticleListCategoryUrlAlias = currentNode.key;
      this.currentPageNumber = 0;
      this.requestService.getArticlesByCategory(currentNode.key, 0, this.everyPageSizeNumber)
        .subscribe(result => {
          if (result == null) {
            this.initLoading = false;
            this.nzMsgService.error('数据请求出错，请检查网络连接！');
          } else if (result.length === 0) {
            this.initLoading = false;
            this.articleListData = [];
            this.articleList = [];
            this.showLoadingMore = false;
          } else {
            this.initLoading = false;
            this.articleListData = result;
            this.articleList = result;
            this.showLoadingMore = true;
          }
        });
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

  goCategory2(breadNode: NzTreeNode) {
    let node = breadNode;
    const urlSegmentList: string[] = [];
    do {
      urlSegmentList.push(node.key);
      node = node.parentNode;
    } while (node != null);
    urlSegmentList.reverse();
    this.router.navigate(urlSegmentList);
  }

  onLoadMore(): void {
    this.initLoading = true;
    this.showLoadingMore = false;
    this.currentPageNumber++;
    this.requestService.getArticlesByCategory(this.currentShowArticleListCategoryUrlAlias, this.currentPageNumber, this.everyPageSizeNumber)
      .subscribe(result => {
        if (result == null) {
          this.initLoading = false;
          this.nzMsgService.error('数据请求出错，请检查网络连接！');
          this.showLoadingMore = true;
        } else if (result.length === 0) {
          this.initLoading = false;
          this.nzMsgService.warning('没有更多……');
        } else {
          this.initLoading = false;
          this.articleListData = this.articleListData.concat(result);
          this.articleList = [...this.articleListData];
          this.showLoadingMore = true;
        }
      });
  }

  goArticle(item: Article) {
    this.article = item;
    this.articleContent = this.sanitizer.bypassSecurityTrustHtml(this.article.content);
    const urlSegmentList: string[] = [];
    for (const node of this.breadcrumbNodes) {
      urlSegmentList.push(node.key);
    }
    urlSegmentList.push(item.id + '.html');
    this.router.navigate(urlSegmentList);
  }
}
