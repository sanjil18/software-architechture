package com.police.trafficfine.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;


@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/admin/{path:[^\\.]*}").setViewName("forward:/index.html");
        registry.addViewController("/{path:^(?!api|health|admin).*$}").setViewName("forward:/index.html");
    }
}
