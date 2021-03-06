import {ElementRef, Inject, Injectable, OnDestroy, QueryList} from '@angular/core';
import {KeyBinding, KeyBindingsService} from 'projects/tools/src/lib/key-bindings.service';
import {STORAGE_ID} from 'projects/storage/src/lib/storage-id';
import {StorageTreeControlService} from 'projects/storage/src/lib/storage-tree/storage-tree-control.service';
import * as _ from 'lodash';
import {StorageNode} from 'projects/storage/src/lib/entities/storage-node';
import {
  STORAGE_ROOT_NODE,
  StorageTreeDataSourceService
} from 'projects/storage/src/lib/storage-tree/storage-tree-data-source.service';
import {StorageNodeComponent} from 'projects/storage/src/lib/storage-tree/storage-node/storage-node.component';
import {StorageService} from 'projects/storage/src/lib/storage.service';

@Injectable()
export class StorageKeyBindingService implements OnDestroy {

  private keyBindings: KeyBinding[] = [];
  private treeNodes: QueryList<StorageNodeComponent>;
  private scrollableTree: ElementRef<HTMLElement>;


  constructor(
    public treeControl: StorageTreeControlService,
    @Inject(STORAGE_ID) public id: string,
    @Inject(STORAGE_ROOT_NODE) private readonly rootNode: StorageNode,
    private keys: KeyBindingsService,
    private dataSource: StorageTreeDataSourceService,
    public storage: StorageService) {
  }

  public init(matTreeNodes: QueryList<StorageNodeComponent>, scrollableTree: ElementRef<HTMLElement>): void {
    this.keyBindings.push(new KeyBinding(['ArrowUp', 'Up'], this.upSelection.bind(this), this.id));
    this.keyBindings.push(new KeyBinding(['ArrowDown', 'Down'], this.downSelection.bind(this), this.id));
    this.keyBindings.push(new KeyBinding(['shift + ArrowUp', 'shift + Up'], this.upMultiSelection.bind(this), this.id));
    this.keyBindings.push(new KeyBinding(['shift + ArrowDown', 'shift + Down'], this.downMultiSelection.bind(this), this.id));
    this.keyBindings.push(new KeyBinding(['Enter'], this.openSelection.bind(this), this.id));
    this.keyBindings.push(new KeyBinding(['Right', 'ArrowRight'], this.rightSelection.bind(this), this.id));
    this.keyBindings.push(new KeyBinding(['Left', 'ArrowLeft'], this.leftSelection.bind(this), this.id));
    this.keyBindings.push(new KeyBinding(['ctrl + Delete'], this.deleteSelection.bind(this), this.id));
    this.keyBindings.forEach(binding => {
      this.keys.add([binding]);
    });
    this.treeNodes = matTreeNodes;
    this.scrollableTree = scrollableTree;
  }

  ngOnDestroy() {
    this.keyBindings.forEach(binding => this.keys.remove([binding]));
  }

  private upScroll(): void {
    const scrollTopTotal = this.scrollableTree.nativeElement.scrollTop + this.scrollableTree.nativeElement.clientTop;
    const node = this.treeNodes.filter(item => this.treeControl._lastSelection.path === item.node.path)[0];
    const height = this.scrollableTree.nativeElement.scrollHeight / this.treeNodes.length;
    if (node !== undefined) {
      const elementTop = node.ref.nativeElement.offsetTop;
      if (elementTop - scrollTopTotal < (height * 2)) {
        this.scrollableTree.nativeElement.scrollTop -= height;
      }
    }
  }

  private downScroll(): void {
    const scrollTopTotal = this.scrollableTree.nativeElement.scrollTop + this.scrollableTree.nativeElement.clientTop + this.scrollableTree.nativeElement.clientHeight;
    const node = this.treeNodes.filter(item => this.treeControl._lastSelection.path === item.node.path)[0];
    if (node !== undefined) {
      const elementTop = node.ref.nativeElement.offsetTop;
      const height = this.scrollableTree.nativeElement.scrollHeight / this.treeNodes.length;
      if (scrollTopTotal - elementTop < (height * 2)) {
        this.scrollableTree.nativeElement.scrollTop += height;
      }
    }
  }

  public upSelection(): boolean {
    const nodeToSelect = this.selectNextOpen(index => index - 1);
    if (nodeToSelect) {
      this.treeControl.selectOne(nodeToSelect);
      this.upScroll();
      return true;
    }
    return false;
  }

  public upMultiSelection(): boolean {
    const nodeToSelect = this.selectNextOpen(index => index - 1);
    if (nodeToSelect) {
      if (this.treeControl.isSelected(nodeToSelect)) {
        this.treeControl.deselectNode(this.data[this.lastIndexSelection], nodeToSelect);
      } else {
        this.treeControl.selectNode(nodeToSelect);
      }
      this.upScroll();
      return true;
    }
    return false;
  }

  public downSelection(): boolean {
    const nodeToSelect = this.selectNextOpen(index => index + 1);
    if (nodeToSelect) {
      this.treeControl.selectOne(nodeToSelect);
      this.downScroll();
      return true;
    }
    return false;
  }

  public downMultiSelection(): boolean {
    const nextNode = this.selectNextOpen(index => index + 1);
    if (nextNode) {
      if (this.treeControl.isSelected(nextNode)) {
        this.treeControl.deselectNode(this.data[this.lastIndexSelection], nextNode);
      } else {
        this.treeControl.selectNode(nextNode);
      }
      this.downScroll();
      return true;
    }
    return false;
  }

  private selectNextOpen(getNextIndex: (index: number) => number): StorageNode {
    const lastIndex = this.lastIndexSelection;
    const newIndex = getNextIndex(lastIndex);
    if (newIndex >= 0 && newIndex < this.data.length) {
      return this.data[getNextIndex(lastIndex)];
    }
    return null;
  }

  private get lastIndexSelection(): number {
    return _.indexOf(this.dataSource._expandedNodes, this.treeControl._lastSelection);
  }

  private get data(): StorageNode[] {
    return this.dataSource._expandedNodes;
  }

  public openSelection(): boolean {
    this.treeControl.selected.forEach(selectedNode => {
      this.treeControl.nodeDoubleClick(selectedNode);
    });
    return true;
  }

  public rightSelection(): boolean {
    const node = this.treeControl._lastSelection;
    if (node.type === 'DIRECTORY' && !this.treeControl.isExpanded(node)) {
      this.treeControl.expand(node);
    } else {
      return this.downSelection();
    }
    return true;
  }

  public leftSelection(): boolean {
    const node = this.treeControl._lastSelection;
    if (node.type !== 'DIRECTORY' || (node.type === 'DIRECTORY' && !this.treeControl.isExpanded(node))) {
      const parent = this.dataSource.parentNode(node);
      if (parent.path !== this.rootNode.path) {
        this.treeControl.selectOne(parent);
        this.upScroll();
      } else {
        return this.upSelection();
      }
    } else {
      this.treeControl.collapse(node);
      this.upScroll();
    }
    return true;
  }

  public deleteSelection(): boolean {
    const nodes = this.treeControl.selected;
    this.storage.deleteFiles(nodes);
    return true;
  }
}
