import { TestBed } from '@angular/core/testing';

import { GuiToolsService } from './gui-tools.service';

describe('GuiToolsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GuiToolsService = TestBed.get(GuiToolsService);
    expect(service).toBeTruthy();
  });
});
