import {Injectable, OnDestroy} from '@angular/core';
import {StorageService} from 'projects/storage/src/lib/storage.service';
import {NodeEventToNodePipe} from 'projects/storage/src/lib/storage-pipes/node-event-to-node.pipe';
import {EventBusService} from 'projects/event/src/lib/event-bus.service';
import {DebugEntry} from 'projects/analysis/src/lib/entities/debug-entry';
import {ResultsTableService} from 'projects/analysis/src/lib/results/results-table/results-table.service';
import {AnalysisConfigurationService} from 'projects/analysis/src/lib/analysis-configuration.service';
import {Subscription} from 'rxjs';
import {SelectNodeEvent} from 'projects/storage/src/lib/events/select-node-event';
import {map} from 'rxjs/operators';
import {StorageNode} from 'projects/storage/src/lib/entities/storage-node';
import {IsDebugEntryStorageNodePipe} from 'projects/analysis/src/lib/results/is-debug-entry-storage-node.pipe';
import {CompareDialogComponent} from 'projects/analysis/src/lib/results/debug/compare/compare-dialog/compare-dialog.component';
import {DialogService} from 'projects/dialog/src/lib/dialog.service';
import {DialogSize} from 'projects/dialog/src/lib/dialog-size';
import {StorageJsonService} from 'projects/storage/src/lib/storage-json.service';
import {StorageListService} from 'projects/storage/src/lib/storage-list.service';
import {Result} from 'projects/analysis/src/lib/entities/result';
import {DebugEntryToPathPipe} from 'projects/analysis/src/lib/results/debug/debug-pipes/debug-entry-to-path.pipe';
import {SelectionModel} from '@angular/cdk/collections';

@Injectable()
export class DebugEntriesTableService extends StorageJsonService<DebugEntry> implements OnDestroy {

  public static readonly ENTRY_EXT = '.debug';

  public readonly _selection: SelectionModel<DebugEntry> = new SelectionModel(false);
  private _resultSelectionSubscription: Subscription;
  private _nodeSelectionSubscription: Subscription;
  private _result: Result;
  private _lastSelectedNode: StorageNode;

  constructor(
    storage: StorageService,
    storageList: StorageListService,
    private toNode: NodeEventToNodePipe,
    private eventBus: EventBusService,
    private analysisConfiguration: AnalysisConfigurationService,
    private resultsList: ResultsTableService,
    private toPath: DebugEntryToPathPipe,
    private dialogs: DialogService,
  ) {
    super(storage, storageList, node => {
      const result = node.path.match(IsDebugEntryStorageNodePipe.PATH_REGEXP);
      return result ? `${result[2]}_${result[1]}` : '';
    }, value => `${value.id}_${value.resultId}`);

    this._resultSelectionSubscription = this.resultsList.selectionChanged.subscribe(this.init.bind(this));
    this._nodeSelectionSubscription = this.eventBus.of<SelectNodeEvent>(SelectNodeEvent.CHANNEL)
      .pipe(map(this.toNode.transform))
      .subscribe(node => this._lastSelectedNode = node);
  }

  ngOnDestroy() {
    super.clearSubscriptions();
    this._resultSelectionSubscription.unsubscribe();
  }

  public init() {
    this.selection = null;

    const result = this.resultsList.selection;
    if (!result || result === this._result) {
      return;
    }

    this.values = [];
    this._result = result;

    super.init(`${this.analysisConfiguration.analysisRootNode.path}/${this._result.id}`, '.*\\.debug', 2);

    this._subscriptions.push(this.eventBus.of<SelectNodeEvent>(SelectNodeEvent.CHANNEL)
      .pipe(map(this.toNode.transform))
      .subscribe(this._selectNode.bind(this)));
  }

  public open(entry: DebugEntry) {
    const path = `${this.toPath.transform(entry)}/${entry.id}${DebugEntriesTableService.ENTRY_EXT}`;
    this.storage.get(path).subscribe(node => this.storage.edit(node));
    this._selection.select(entry);
  }

  public compare() {
    this.dialogs.open(CompareDialogComponent, DialogSize.SIZE_FULL, {
      left: this._selection.selected[0],
      right: this._selection.selected[0],
      results: this.resultsList.values,
    }).subscribe();
  }

  public set selection(entry: DebugEntry) {
    this._selection.select(entry);
  }

  public get selection(): DebugEntry {
    return this._selection.selected[0];
  }

  public isSelected(entry: DebugEntry): boolean {
    return !!this._selection && this._selection.selected[0] === entry;
  }

  protected _nodesListed(nodes: StorageNode[]) {
    this.storage.listJSON<DebugEntry>(nodes).subscribe((values: DebugEntry[]) => {
      this.values = values;
      this._selectNode(this._lastSelectedNode);
    });
  }

  private _selectNode(node: StorageNode) {
    if (!node) {
      this._selection.clear();
      return;
    }
    const entry = this.find(node);
    if (entry) {
      this._selection.select(entry);
    }
  }

}
