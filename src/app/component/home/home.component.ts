import { Component, OnInit } from '@angular/core';
import { NzMessageService, NzTreeNode } from 'ng-zorro-antd';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestService } from '../../service/request.service';
import { DomSanitizer } from '@angular/platform-browser';
import { AppComponent } from '../app.component';
import { Article } from '../../domain/article';
import { Options } from '../../domain/options';
import { OptionsFields } from '../../config/options-fields';
import { BackEndApi } from '../../config/back-end-api';
import { FriendlyLinks } from '../../domain/options/friendly-links';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  // 导航相关
  nodes: NzTreeNode[] = [];
  nodesArticleList: Article[][] = [];

  // 轮播图
  carouselArray: string[] = [];

  // 友情链接
  friendlyLinksArray: FriendlyLinks[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private requestService: RequestService,
    private sanitizer: DomSanitizer,
    private nzMsgService: NzMessageService,
  ) {
  }

  ngOnInit() {

    setTimeout(() => {
      // 初始化 options 列表数据
      this.initOptionsData(AppComponent.self.optionsList);

      // 初始化 nodes
      for (const node of AppComponent.self.nodes) {
        if (node.key === 'home') {
          this.nodes = node.getChildren();
        }
      }

      // 初始化每个 node 的文章列表
      this.initNodesArticleList(0);
    }, 500);
  }

  private initOptionsData(options: Options[]) {
    for (const option of options) {
      switch (option.name) {
        case OptionsFields.HOME_CAROUSEL_IMAGES:
          // 首页轮播图
          for (const homeCarouselImages of option.value.content) {
            this.carouselArray.push(BackEndApi.hostAddress + '/' + homeCarouselImages.imageLocation);
          }
          break;
        case OptionsFields.FRIENDLY_LINKS:
          // 友情链接
          this.friendlyLinksArray = option.value.content;
          break;
      }
    }
  }

  private initNodesArticleList(index: number) {
    this.requestService.getArticlesByCategory(this.nodes[index].key, 0, 5)
      .subscribe(result => {
        if (result == null) {
          this.nzMsgService.error('数据请求出错，请检查网络连接！');
        } else {
          this.nodesArticleList.push(result);
          // 递归初始化每个 node 的文章列表
          index++;
          if (index < this.nodes.length) {
            this.initNodesArticleList(index);
          }
        }
      });
  }
}
