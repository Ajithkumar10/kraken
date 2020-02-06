import {Component, Input, OnDestroy, OnInit, QueryList, ViewChildren} from '@angular/core';
import {MatTableDataSource} from '@angular/material';
import {KeyBinding, KeyBindingsService} from 'projects/tools/src/lib/key-bindings.service';
import {SelectionModel} from '@angular/cdk/collections';
import * as _ from 'lodash';
import {StorageNodeComponent} from 'projects/storage/src/lib/storage-tree/storage-node/storage-node.component';

@Component({
  selector: 'lib-table-overlay',
  templateUrl: './table-overlay.component.html',
  styleUrls: ['./table-overlay.component.scss']
})
export class TableOverlayComponent<T> implements OnInit, OnDestroy {

  private keyBindings: KeyBinding[] = [];

  @Input() loading: boolean;
  @Input() dataSource: MatTableDataSource<any>;
  @Input() noDataLabel: string;
  @Input() id: string;
  @Input() selection: SelectionModel<any>;

  @ViewChildren(StorageNodeComponent) treeNodes: QueryList<StorageNodeComponent>;

  constructor(
    private keys: KeyBindingsService) {
  }

  ngOnInit(): void {
    this.noDataLabel = this.noDataLabel || 'No data';
    this.keyBindings.push(new KeyBinding(['ArrowUp', 'Up'], this.upSelection.bind(this), this.id));
    this.keyBindings.push(new KeyBinding(['ArrowDown', 'Down'], this.downSelection.bind(this), this.id));
    this.keyBindings.forEach(binding => {
      this.keys.add([binding]);
    });
  }

  ngOnDestroy() {
    this.keyBindings.forEach(binding => this.keys.remove([binding]));
  }

  public upSelection(): boolean {
    // TODO le sort pose peut etre problème ?
    // le sort ne modifie pas l'ordre des données dans le data ? uniquement à l'affichage ?
    console.log('upSelection');
    const nodes = this.dataSource.datdata;
    nodes.forEach(node => {
      console.log('id : ' + node.id + 'desc : ' + node.description);
    });
    const last = _.last(this.selection.selected);
    const elementTop = this.treeNodes.filter(item => this.treeControl._lastSelection.path === item.node.path)[0].ref.nativeElement.offsetTop;
    this.treeNodes.find(item => last.path === item.node.path);
    const lastIndex = _.indexOf(nodes, last);
    console.log('upSelection lastIndex : ' + lastIndex);
    if (lastIndex > 0) {
      console.log('upSelection next : ' + (lastIndex - 1));
      this.selectOne(nodes[lastIndex - 1]);
      // this.upScroll();
      return true;
    }
    return false;
  }

  public downSelection(): boolean {
    const nodes = this.dataSource.data;
    const last = _.last(this.selection.selected);
    const lastIndex = _.indexOf(nodes, last);
    if (lastIndex < nodes.length - 1) {
      this.selectOne(nodes[lastIndex + 1]);
      // this.downScroll();
      return true;
    }
    return false;
  }

  private selectOne(node: any) {
    this.selection.clear();
    this.selection.select(node);
  }
}
