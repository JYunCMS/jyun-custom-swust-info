import { Component, OnInit } from '@angular/core';
import { NzMessageService, NzTreeNode } from 'ng-zorro-antd';
import { RequestService } from './request.service';
import { Category } from './domain/category';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  static self: AppComponent;

  nodes: NzTreeNode[] = [];

  constructor(
    private requestService: RequestService,
    private nzMsgService: NzMessageService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    AppComponent.self = this;

    this.requestService.getNodes()
      .subscribe(categories => {
        if (categories == null) {
          this.nzMsgService.error('数据请求出错，请检查网络连接！');
        } else {
          this.initNodes(this.nodes, categories);
        }
      });
  }

  goCategory(node: NzTreeNode) {
    const urlSegmentList: string[] = [];
    do {
      urlSegmentList.push(node.key);
      node = node.parentNode;
    } while (node != null);
    urlSegmentList.reverse();
    this.router.navigate(urlSegmentList);
  }

  private initNodes(nodes: NzTreeNode[], categories: Category[]) {
    // 清除当前节点列表
    nodes.splice(0, nodes.length);

    // 先按照节点等级排列成到二维数组待用
    const nodeLevelList: NzTreeNode[][] = [];
    for (let n = 0, currentLevel = 0; n < categories.length; currentLevel++) {
      const tempNodeList: NzTreeNode[] = [];
      categories.forEach((category) => {
        if (category.nodeLevel === currentLevel) {
          tempNodeList.push(new NzTreeNode({
            key: category.urlAlias,
            title: category.title,
            isLeaf: category.beLeaf,
            // 下面属性保存在 origin 中
            nodeLevel: category.nodeLevel,
            parentNodeUrlAlias: category.parentNodeUrlAlias,
            sequence: category.sequence,
            childrenCount: category.childrenCount,
            articleCount: category.articleCount,
            customPage: category.customPage
          }));

          // 处理完一个节点
          n++;
        }
      });

      // 处理完一级节点
      nodeLevelList.push(tempNodeList);
    }

    // 从最低一级节点开始向视图 nodes 对象中灌装
    for (let i = nodeLevelList.length - 1; i >= 0; i--) {
      if (i !== 0) {
        // 向父级节点 addChildren
        nodeLevelList[i].forEach((subNode) => {
          nodeLevelList[i - 1].forEach((parentNode) => {
            if (subNode.origin.parentNodeUrlAlias === parentNode.key) {
              parentNode.addChildren([subNode]);
            }
          });
        });
      } else {
        // 向视图 nodes 对象灌装
        nodeLevelList[i].forEach((rootNode) => {
          nodes.push(rootNode);
        });
      }
    }
  }
}
