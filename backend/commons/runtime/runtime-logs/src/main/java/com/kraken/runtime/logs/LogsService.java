package com.kraken.runtime.logs;

import com.kraken.runtime.entity.Log;
import com.kraken.runtime.entity.LogType;
import reactor.core.Disposable;
import reactor.core.publisher.Flux;

public interface LogsService {

  Flux<Log> listen(String applicationId);

  boolean dispose(String applicationId, String id, LogType type);

  Disposable push(String applicationId, String id, LogType type, Flux<String> logs);

  void add(Log log);

  void clear();

}
