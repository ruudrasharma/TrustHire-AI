package com.trusthire.ai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties
public class TrustHireAiApplication {
    public static void main(String[] args) {
        SpringApplication.run(TrustHireAiApplication.class, args);
    }
}
