import {Injectable} from '@angular/core';
import {StorageService} from 'projects/storage/src/lib/storage.service';
import {catchError, flatMap, map} from 'rxjs/operators';
import {StorageNode} from 'projects/storage/src/lib/entities/storage-node';
import {Observable, of} from 'rxjs';
import {Result} from 'projects/analysis/src/lib/entities/result';
import {EventBusService} from 'projects/event/src/lib/event-bus.service';
import {WindowService} from 'projects/tools/src/lib/window.service';
import {NotificationEvent} from 'projects/notification/src/lib/notification-event';
import {BaseNotification} from 'projects/notification/src/lib/base-notification';
import {AnalysisService} from 'projects/analysis/src/lib/analysis.service';
import {AnalysisConfigurationService} from 'projects/analysis/src/lib/analysis-configuration.service';
import {NotificationLevel} from 'projects/notification/src/lib/notification-level';
import {DialogService} from 'projects/dialog/src/lib/dialog.service';

@Injectable()
export class GatlingResultService {

  constructor(
    private storage: StorageService,
    private analysis: AnalysisService,
    private eventBus: EventBusService,
    private window: WindowService,
    private analysisConfiguration: AnalysisConfigurationService,
    private dialogs: DialogService,
  ) {
  }

  deleteResultWithPopup(result: Result): Observable<string> {
    return this.dialogs.delete('test result', [result.description]).pipe(flatMap(() => this.deleteResult(result)));
  }

  deleteResult(result: Result): Observable<string> {
    return this.analysis.deleteTest(result.id);
  }

  openGrafanaReport(result: Result) {
    this.window.open(of(this.analysisConfiguration.grafanaUrl(`/${result.id}`)));
  }

  canOpenGrafanaReport(result: Result) {
    return result && result.type === 'RUN';
  }

  canOpenGatlingReport(result: Result) {
    return result && result.type !== 'HAR' && (result.status === 'COMPLETED' || result.status === 'CANCELED');
  }

  canDeleteResult(result: Result) {
    return result && (result.status === 'COMPLETED' || result.status === 'CANCELED' || result.status === 'FAILED');
  }
}
