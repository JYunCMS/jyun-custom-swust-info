import { Component, OnInit } from '@angular/core';
import { NzMessageService, NzTreeNode } from 'ng-zorro-antd';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestService } from '../request.service';
import { DomSanitizer } from '@angular/platform-browser';
import { AppComponent } from '../app.component';
import { Article } from '../domain/article';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  carouselArray = [
    'http://localhost:8080/upload_dir/2019-03/1553378271058.png',
    'https://localhost:4200/assets/img/JYunCMS-Logo.png',
    'http://localhost:8080/upload_dir/2019-03/1553378271058.png',
    'https://localhost:4200/assets/img/JYunCMS-Logo.png'
  ];

  // 导航相关
  nodes: NzTreeNode[] = [];
  nodesArticleList: Article[][] = [];

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
      // 初始化 nodes
      for (const node of AppComponent.self.nodes) {
        if (node.key === 'home') {
          this.nodes = node.getChildren();
        }
      }

      // 初始化每个 node 的文章列表
      this.initNodesArticleList(0);
    }, 0);
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
