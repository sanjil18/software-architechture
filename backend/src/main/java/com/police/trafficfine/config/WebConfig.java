package com.police.trafficfine.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Equivalent of the static-file / SPA-fallback section at the bottom of the
 * original server.js: the React build (payment portal at "/", admin portal
 * at "/admin") is copied into src/main/resources/static at build time
 * (see README), and Spring Boot serves it automatically. This just adds
 * the SPA fallback so client-side routes resolve to index.html instead
 * of a 404, for both the "/" and "/admin" sections.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/admin/{path:[^\\.]*}").setViewName("forward:/index.html");
        registry.addViewController("/{path:^(?!api|health|admin).*$}").setViewName("forward:/index.html");
    }
}
