package com.kraken.runtime.docker;

import com.kraken.runtime.entity.ContainerStatus;
import org.springframework.stereotype.Component;

import java.util.function.BiFunction;

@Component
final class ContainerStatusToName implements BiFunction<String, ContainerStatus, String> {
  @Override
  public String apply(final String id, final ContainerStatus containerStatus) {
    return String.format("%s_%s", id, containerStatus);
  }
}
