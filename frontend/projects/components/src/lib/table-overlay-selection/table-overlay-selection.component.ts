import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {MatTableDataSource} from '@angular/material';
import {KeyBinding, KeyBindingsService} from 'projects/tools/src/lib/key-bindings.service';
import {SelectionModel} from '@angular/cdk/collections';
import * as _ from 'lodash';
import {TableOverlayComponent} from 'projects/components/src/lib/table-overlay/table-overlay.component';

@Component({
  selector: 'lib-table-overlay-selection',
  templateUrl: '../table-overlay/table-overlay.component.html',
  styleUrls: ['../table-overlay/table-overlay.component.scss']
})
export class TableOverlaySelectionComponent<T> extends TableOverlayComponent implements OnInit, OnDestroy {

  private keyBindings: KeyBinding[] = [];

  @Input() loading: boolean;
  @Input() dataSource: MatTableDataSource<any>;
  @Input() noDataLabel: string;
  @Input() id: string;
  @Input() selection: SelectionModel<any>;

  constructor(
    private keys: KeyBindingsService) {
    super();
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
    const lastIndex = this.getLastIndex();
    if (lastIndex > 0) {
      this.selectOne(this.nodes[lastIndex - 1]);
      // this.upScroll();
      return true;
    }
    return false;
  }

  public downSelection(): boolean {
    const lastIndex = this.getLastIndex();
    if (lastIndex < this.nodes.length - 1) {
      this.selectOne(this.nodes[lastIndex + 1]);
      // this.downScroll();
      return true;
    }
    return false;
  }

  private get nodes(): any[] {
    return this.dataSource._orderData(this.dataSource.data);
  }

  private getLastIndex(): number {
    const nodes = this.dataSource._orderData(this.dataSource.data);
    const last = this.selection.selected[0];
    const node = nodes.find(item => last.id === item.id);

    return _.indexOf(nodes, node);
  }

  private selectOne(node: any) {
    this.selection.clear();
    this.selection.select(node);
  }
}
