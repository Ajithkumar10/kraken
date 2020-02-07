import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
  @Input() selection: SelectionModel<any>;
  private DELTA_HEIGHT = 50;

  @ViewChild('scrollableTable', {static: false}) scrollableTable: ElementRef<HTMLElement>;

  constructor(
    private keys: KeyBindingsService,
    private element: ElementRef) {
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
      this.scrollTo(this.scrollableTable, this.getSelectedElement.bind(this));
      return true;
    }
    return false;
  }

  public downSelection(): boolean {
    const lastIndex = this.getLastIndex();
    if (lastIndex < this.nodes.length - 1) {
      this.selectOne(this.nodes[lastIndex + 1]);
      this.scrollTo(this.scrollableTable, this.getSelectedElement.bind(this));
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

  private getSelectedElement(): Element {
    return this.element.nativeElement.getElementsByClassName('mat-row-selected')[0];
  }

  private scrollTo(scrollableElement: ElementRef<HTMLElement>, getElement: () => Element): void {
    setTimeout(() => {
      const element = getElement();
      const scrollHeight = scrollableElement.nativeElement.offsetHeight;
      const scrollTop = scrollableElement.nativeElement.getBoundingClientRect().top;
      const scrollBottom = scrollTop + scrollHeight;
      const elementTop = element.getBoundingClientRect().top;
      const elementBottom = element.getBoundingClientRect().bottom;
      const deltaBottom = scrollBottom - this.DELTA_HEIGHT - elementBottom;
      const deltaTop = elementTop - (scrollTop + this.DELTA_HEIGHT);
      if (deltaBottom < 0) {
        scrollableElement.nativeElement.scrollTop += Math.abs(deltaBottom);
      } else if (deltaTop < 0) {
        scrollableElement.nativeElement.scrollTop -= Math.abs(deltaTop);
      }
    });
  }
}
