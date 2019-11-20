package com.kraken.runtime.docker.env;

import com.kraken.runtie.server.properties.RuntimeServerPropertiesTest;
import com.kraken.runtime.entity.TaskType;
import com.kraken.test.utils.TestUtils;
import com.kraken.tools.environment.KrakenEnvironmentKeys;
import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class KrakenVersionPublisherTest {

  KrakenVersionPublisher publisher = new KrakenVersionPublisher(RuntimeServerPropertiesTest.RUNTIME_SERVER_PROPERTIES);

  @Test
  public void shouldTest() {
    assertThat(publisher.test(TaskType.RUN)).isTrue();
    assertThat(publisher.test(TaskType.DEBUG)).isTrue();
    assertThat(publisher.test(TaskType.RECORD)).isTrue();
  }

  @Test
  public void shouldGet() {
    final var env = publisher.get();
    assertThat(env.get(KrakenEnvironmentKeys.KRAKEN_VERSION)).isNotNull();
  }

  @Test
  public void shouldTestUtils(){
    TestUtils.shouldPassNPE(KrakenVersionPublisher.class);
  }
}
